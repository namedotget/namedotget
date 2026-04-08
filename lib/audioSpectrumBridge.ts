/**
 * FFT-derived spectrum for WebGL hero; updated on RAF in useAudioAnalyzer (no React commits).
 */

export const audioSpectrumBridge = {
  lowFreq: 0,
  highFreq: 0,
};

export function computeSpectrumFromBins(audioData: Uint8Array) {
  if (!audioData.length) return { lowFreq: 0, highFreq: 0 };
  const lowSlice = audioData.subarray(0, 10);
  let lowSum = 0;
  for (let i = 0; i < lowSlice.length; i++) lowSum += lowSlice[i];
  const lowFreq = lowSum / (lowSlice.length * 255);

  const highSlice = audioData.subarray(20, 60);
  let highSum = 0;
  for (let i = 0; i < highSlice.length; i++) highSum += highSlice[i];
  const highFreq = highSum / (highSlice.length * 255);

  return { lowFreq, highFreq };
}

export function resetAudioSpectrumBridge() {
  audioSpectrumBridge.lowFreq = 0;
  audioSpectrumBridge.highFreq = 0;
}
