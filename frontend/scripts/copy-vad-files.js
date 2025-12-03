const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Files to copy from @ricky0123/vad-web
const vadFiles = [
  {
    src: 'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js',
    dest: 'vad.worklet.bundle.min.js'
  },
  {
    src: 'node_modules/@ricky0123/vad-web/dist/silero_vad_legacy.onnx',
    dest: 'silero_vad_legacy.onnx'
  },
  {
    src: 'node_modules/@ricky0123/vad-web/dist/silero_vad_v5.onnx',
    dest: 'silero_vad_v5.onnx'
  },
  {
    src: 'node_modules/@ricky0123/vad-web/dist/silero_vad.onnx',
    dest: 'silero_vad.onnx'
  }
];

// Files to copy from onnxruntime-web
const onnxFiles = [
  {
    src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
    dest: 'ort-wasm-simd-threaded.wasm'
  },
  {
    src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs',
    dest: 'ort-wasm-simd-threaded.mjs'
  }
];

// Try alternative paths for ONNX runtime files
const onnxAltFiles = [
  {
    src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
    dest: 'ort-wasm-simd-threaded.jsep.wasm'
  },
  {
    src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm',
    dest: 'ort-wasm-simd-threaded.asyncify.wasm'
  }
];

const allFiles = [...vadFiles, ...onnxFiles, ...onnxAltFiles];

console.log('Copying VAD and ONNX files to public directory...');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

let copied = 0;
let skipped = 0;

allFiles.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, '..', src);
  const destPath = path.join(publicDir, dest);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  Copied: ${dest}`);
    copied++;
  } else {
    console.log(`  Skipped (not found): ${src}`);
    skipped++;
  }
});

console.log(`\nDone! Copied ${copied} files, skipped ${skipped} files.`);
