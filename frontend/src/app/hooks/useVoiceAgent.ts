'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMicVAD } from '@ricky0123/vad-react';
import { WEBSOCKET_URL, Status, Message, MedicalSummary, WSMessage } from '@/lib/constants';
import { float32ToInt16 } from '@/lib/utils';
import { useAudioPlayback } from './useAudioPlayback';

export function useVoiceAgent() {
  // State
  const [status, setStatus] = useState<Status>('idle');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnectingRef = useRef(false);
  const connectionResolveRef = useRef<(() => void) | null>(null);
  const messageIdRef = useRef(0);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    messageIdRef.current += 1;
    return `${Date.now()}-${messageIdRef.current}`;
  }, []);

  // Audio playback
  const { playAudio, stopPlayback, cleanup: cleanupAudio } = useAudioPlayback();

  // WebSocket message handler
  const handleWSMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WSMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'transcript':
          if (message.text) {
            setCurrentTranscript(message.text);
            if (message.is_final) {
              // Add user message to conversation
              const userId = generateMessageId();
              setConversation(prev => [...prev, {
                id: userId,
                role: 'user',
                content: message.text!,
                timestamp: new Date(),
              }]);
              setCurrentTranscript('');
            }
          }
          break;

        case 'response':
          if (message.text) {
            const assistantId = generateMessageId();
            setConversation(prev => [...prev, {
              id: assistantId,
              role: 'assistant',
              content: message.text!,
              timestamp: new Date(),
            }]);
          }
          break;

        case 'audio':
          if (message.data && typeof message.data === 'string') {
            playAudio(message.data);
          }
          break;

        case 'status':
          if (message.status) {
            setStatus(message.status);
          }
          break;

        case 'summary':
          if (message.data && typeof message.data === 'object') {
            setSummary(message.data as MedicalSummary);
          }
          break;

        case 'error':
          setError(message.message || 'An error occurred');
          setStatus('error');
          break;
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  }, [playAudio, generateMessageId]);

  // Connect to WebSocket - returns a promise that resolves when connected
  const connectWebSocket = useCallback((): Promise<void> => {
    // If already connecting, wait for that connection
    if (isConnectingRef.current) {
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          resolve();
        }, 10000);
      });
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    isConnectingRef.current = true;

    return new Promise((resolve, reject) => {
      // Close any existing connection
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // Ignore close errors
        }
        wsRef.current = null;
      }

      try {
        console.log('Creating WebSocket connection to:', WEBSOCKET_URL);
        const ws = new WebSocket(WEBSOCKET_URL);
        let resolved = false;
        let connectionTimeout: NodeJS.Timeout;

        // Set a connection timeout
        connectionTimeout = setTimeout(() => {
          if (!resolved) {
            console.error('WebSocket connection timeout');
            isConnectingRef.current = false;
            ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

        ws.onopen = () => {
          console.log('WebSocket connected successfully');
          clearTimeout(connectionTimeout);
          resolved = true;
          isConnectingRef.current = false;
          reconnectAttemptsRef.current = 0;
          setError(null);
          resolve();
        };

        ws.onmessage = handleWSMessage;

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          isConnectingRef.current = false;

          // Don't reject if we already resolved (connection was successful then closed)
          if (!resolved) {
            clearTimeout(connectionTimeout);
            // Don't show error for normal close during connection
            if (event.code !== 1000) {
              setError('Connection closed. Please try again.');
            }
            reject(new Error(`WebSocket closed: ${event.code}`));
          }
        };

        ws.onerror = (event) => {
          // Browser WebSocket errors are often empty - just log it
          console.log('WebSocket error event (this is often normal):', event);
          // Don't reject here - wait for onclose which will provide more info
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        isConnectingRef.current = false;
        setError('Failed to connect to server');
        reject(err);
      }
    });
  }, [handleWSMessage]);

  // Send audio data to backend
  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send as binary
      wsRef.current.send(audioData);
    }
  }, []);

  // VAD configuration
  // Tuned for natural conversational speech with thinking pauses
  const vad = useMicVAD({
    startOnLoad: false,
    baseAssetPath: '/',
    onnxWASMBasePath: '/',
    positiveSpeechThreshold: 0.6,   // Threshold to detect speech start
    negativeSpeechThreshold: 0.45,  // Higher = more tolerant of soft sounds/breathing
    redemptionMs: 3000,             // Wait 3 seconds of silence before ending (allows thinking pauses)
    preSpeechPadMs: 500,            // Include 500ms before speech detected
    minSpeechMs: 300,               // Minimum speech duration to consider valid
    onSpeechStart: () => {
      console.log('🎤 Speech started - VAD detected voice');
      // Stop any playing audio when user starts speaking
      stopPlayback();
    },
    onSpeechEnd: (audio: Float32Array) => {
      console.log('🎤 Speech ended, audio length:', audio.length, 'samples');
      // Convert Float32 to Int16 PCM and send
      const pcmData = float32ToInt16(audio);
      console.log('🎤 Sending audio to backend:', pcmData.byteLength, 'bytes');
      sendAudio(pcmData);
    },
    onVADMisfire: () => {
      console.log('🎤 VAD misfire - speech too short');
    },
  });

  // Start session
  const startSession = useCallback(async () => {
    try {
      console.log('Starting session...');
      setError(null);
      setSummary(null);
      setConversation([]);
      setCurrentTranscript('');
      setStatus('idle');

      // Connect WebSocket first and wait for it to open
      console.log('Connecting WebSocket...');
      await connectWebSocket();
      console.log('WebSocket connected successfully!');

      // Mark session as active after WebSocket is connected
      setIsSessionActive(true);
      setStatus('listening');

      // Start VAD with error handling
      console.log('Starting VAD...');
      console.log('VAD loading:', vad.loading, 'VAD errored:', vad.errored);

      // Wait a bit for VAD to initialize after hot-reload
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Check if VAD is still loading or has errored
        if (vad.loading) {
          console.log('VAD still loading, waiting...');
          setError('Initializing microphone... Please wait a moment and try again.');
          return;
        }
        if (vad.errored) {
          console.error('VAD initialization failed');
          setError('Microphone initialization failed. Please refresh the page.');
          return;
        }
        vad.start();
        console.log('VAD started successfully');
      } catch (vadError) {
        console.error('VAD start error:', vadError);
        // Continue without VAD if it fails - user can still listen
        setError('Microphone access failed. Please refresh the page and allow microphone access.');
      }

    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Failed to start session. Please check your connection.');
      setStatus('error');
      setIsSessionActive(false);
      // Make sure to close WebSocket if it was opened
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  }, [connectWebSocket, vad]);

  // End session
  const endSession = useCallback(() => {
    // Send end session message
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }));
    }

    // Stop VAD
    vad.pause();

    // Update state
    setIsSessionActive(false);
    setCurrentTranscript('');
  }, [vad]);

  // Cleanup on unmount - use empty dependency array to only run on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up voice agent on unmount...');
      // Only close if we're not in the middle of connecting
      if (wsRef.current && !isConnectingRef.current) {
        try {
          wsRef.current.close(1000, 'Component unmounting');
        } catch (e) {
          // Ignore close errors
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run on unmount

  return {
    // State
    status,
    isSessionActive,
    currentTranscript,
    conversation,
    summary,
    error,

    // VAD state
    listening: vad.listening,
    userSpeaking: vad.userSpeaking,

    // Actions
    startSession,
    endSession,
  };
}
