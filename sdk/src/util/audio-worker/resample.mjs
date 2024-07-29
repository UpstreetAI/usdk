export const resample = (sampleArray, srcSampleRate, targetSampleRate) => {
  if (srcSampleRate === targetSampleRate) {
    return sampleArray.slice();
  }

  const conversionFactor = srcSampleRate / targetSampleRate;
  const outputLength = Math.ceil(sampleArray.length / conversionFactor);
  const outputArray = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; ++i) {
    const position = i * conversionFactor;
    const index = Math.floor(position);
    const fraction = position - index;

    if (index + 1 < sampleArray.length) {
      outputArray[i] = sampleArray[index] * (1 - fraction) + sampleArray[index + 1] * fraction;
    } else {
      outputArray[i] = sampleArray[index];
    }
  }

  return outputArray;
};