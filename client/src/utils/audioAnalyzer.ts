let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function monitorStreamVoiceActivity(
  stream: MediaStream,
  onSpeakingChange: (speaking: boolean) => void,
  threshold = 0.015
): () => void {
  const ctx = getSharedAudioContext();
  if (!ctx || stream.getAudioTracks().length === 0) {
    return () => {};
  }

  let source: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let rafId = 0;
  let stopped = false;
  let lastSpokeAt = 0;
  let isCurrentlySpeaking = false;

  try {
    source = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (stopped || !analyser) return;

      const track = stream.getAudioTracks()[0];
      if (!track || !track.enabled || track.readyState !== 'live') {
        if (isCurrentlySpeaking) {
          isCurrentlySpeaking = false;
          onSpeakingChange(false);
        }
        rafId = requestAnimationFrame(tick);
        return;
      }

      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const norm = (data[i] - 128) / 128;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      const now = performance.now();

      if (rms > threshold) {
        lastSpokeAt = now;
        if (!isCurrentlySpeaking) {
          isCurrentlySpeaking = true;
          onSpeakingChange(true);
        }
      } else if (isCurrentlySpeaking && now - lastSpokeAt > 300) {
        isCurrentlySpeaking = false;
        onSpeakingChange(false);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  } catch (err) {
    console.warn('Voice activity monitor init failed', err);
  }

  return () => {
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    try {
      source?.disconnect();
      analyser?.disconnect();
    } catch {}
    if (isCurrentlySpeaking) {
      onSpeakingChange(false);
    }
  };
}