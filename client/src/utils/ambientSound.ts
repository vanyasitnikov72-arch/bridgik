// Pure client-side Web Audio API ambient sound generator.
// 0 network requests, 0 external audio files, pure browser synthesis.

export type AmbientMode = 'off' | 'rain' | 'cozy' | 'drone';

class AmbientSoundManager {
  private ctx: AudioContext | null = null;
  private currentMode: AmbientMode = 'off';
  private masterGain: GainNode | null = null;
  private volume: number = 0.35;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMode(): AmbientMode {
    return this.currentMode;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    this.currentMode = 'off';
    for (const node of this.activeNodes) {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {}
    }
    this.activeNodes = [];
  }

  public play(mode: AmbientMode, volume?: number) {
    if (volume !== undefined) {
      this.volume = Math.max(0, Math.min(1, volume));
    }

    if (mode === 'off') {
      this.stop();
      return;
    }

    // Stop current nodes
    this.stop();
    this.currentMode = mode;

    try {
      const ctx = this.getAudioContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume, ctx.currentTime);
      master.connect(ctx.destination);
      this.masterGain = master;

      if (mode === 'rain') {
        this.setupRain(ctx, master);
      } else if (mode === 'cozy') {
        this.setupCozyNoise(ctx, master);
      } else if (mode === 'drone') {
        this.setupCyberDrone(ctx, master);
      }
    } catch (err) {
      console.warn('Failed to start ambient sound:', err);
      this.currentMode = 'off';
    }
  }

  // 1. Rain sound: Bandpassed white noise with subtle randomized drop modulation
  private setupRain(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like outdoor rain
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'lowpass';
    bandpass.frequency.setValueAtTime(1100, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, ctx.currentTime);

    whiteNoise.connect(bandpass);
    bandpass.connect(rainGain);
    rainGain.connect(destination);

    whiteNoise.start(0);
    this.activeNodes.push(whiteNoise, bandpass, rainGain);
  }

  // 2. Cozy Brown Noise: Deep warm rumble / fireplace air
  private setupCozyNoise(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const brownNoise = ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(380, ctx.currentTime);

    const cozyGain = ctx.createGain();
    cozyGain.gain.setValueAtTime(0.85, ctx.currentTime);

    brownNoise.connect(lowpass);
    lowpass.connect(cozyGain);
    cozyGain.connect(destination);

    brownNoise.start(0);
    this.activeNodes.push(brownNoise, lowpass, cozyGain);
  }

  // 3. Cyber Drone: Detuned analog oscillators with slow pulsating low-pass filter
  private setupCyberDrone(ctx: AudioContext, destination: GainNode) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(65.41, ctx.currentTime);
    osc2.detune.setValueAtTime(7, ctx.currentTime); // +7 cents

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
    osc3.detune.setValueAtTime(-5, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    // LFO for slow atmospheric breathing
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 0.12 Hz
    lfoGain.gain.setValueAtTime(90, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.4, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);

    filter.connect(droneGain);
    droneGain.connect(destination);

    osc1.start(0);
    osc2.start(0);
    osc3.start(0);
    lfo.start(0);

    this.activeNodes.push(osc1, osc2, osc3, lfo, lfoGain, filter, droneGain);
  }
}

export const ambientSound = new AmbientSoundManager();
