import struct
from typing import List


def convert_float32_to_int16(float_data: bytes) -> bytes:
    """
    Convert Float32 audio data to Int16 PCM
    Used when receiving audio from browser (Float32) to send to Deepgram (Int16)
    """
    # Unpack float32 values
    num_samples = len(float_data) // 4
    float_values = struct.unpack(f'{num_samples}f', float_data)

    # Convert to int16
    int16_values = []
    for f in float_values:
        # Clamp to [-1, 1] range
        f = max(-1.0, min(1.0, f))
        # Scale to int16 range
        int16_values.append(int(f * 32767))

    # Pack as int16
    return struct.pack(f'{len(int16_values)}h', *int16_values)


def convert_int16_to_float32(int16_data: bytes) -> bytes:
    """
    Convert Int16 PCM audio data to Float32
    """
    # Unpack int16 values
    num_samples = len(int16_data) // 2
    int16_values = struct.unpack(f'{num_samples}h', int16_data)

    # Convert to float32
    float_values = [v / 32767.0 for v in int16_values]

    # Pack as float32
    return struct.pack(f'{len(float_values)}f', *float_values)
