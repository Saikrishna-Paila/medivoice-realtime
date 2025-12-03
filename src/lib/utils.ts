import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert Float32Array audio data to Int16 PCM ArrayBuffer
 * Required for sending audio to Deepgram (expects 16-bit PCM)
 */
export function float32ToInt16(float32Array: Float32Array): ArrayBuffer {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1] range
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    // Scale to int16 range
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array.buffer;
}

/**
 * Convert Int16 PCM ArrayBuffer to Float32Array
 */
export function int16ToFloat32(int16Buffer: ArrayBuffer): Float32Array {
  const int16Array = new Int16Array(int16Buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 0x8000;
  }
  return float32Array;
}

/**
 * Format timestamp for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
