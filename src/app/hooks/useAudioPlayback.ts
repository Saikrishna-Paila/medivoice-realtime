'use client';

import { useRef, useCallback } from 'react';

/**
 * Hook for managing audio playback queue
 * Handles streaming TTS audio with proper sequencing
 */
export function useAudioPlayback() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playNext = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const buffer = audioQueueRef.current.shift()!;
    const audioContext = getAudioContext();

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    currentSourceRef.current = source;

    source.onended = () => {
      currentSourceRef.current = null;
      playNext();
    };

    source.start();
  }, [getAudioContext]);

  const playAudio = useCallback(async (base64Audio: string) => {
    try {
      const audioContext = getAudioContext();

      // Resume audio context if suspended (required after user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      // Add to queue
      audioQueueRef.current.push(audioBuffer);

      // Start playing if not already
      if (!isPlayingRef.current) {
        playNext();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [getAudioContext, playNext]);

  const stopPlayback = useCallback(() => {
    // Stop current audio
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      currentSourceRef.current = null;
    }

    // Clear queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  const cleanup = useCallback(() => {
    stopPlayback();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopPlayback]);

  return {
    playAudio,
    stopPlayback,
    cleanup,
    isPlaying: isPlayingRef.current,
  };
}
