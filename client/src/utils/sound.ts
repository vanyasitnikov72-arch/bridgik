// Zero-dependency retro 8-bit sound synthesizer using Web Audio API

class RetroAudio {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private notificationAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bridgik_sound_enabled') || localStorage.getItem('bridgit_sound_enabled');
      this.soundEnabled = stored === null ? true : stored === 'true';
      try {
        this.notificationAudio = new Audio('/sounds/sound-messages-odnoklassniki.mp3');
        this.notificationAudio.preload = 'auto';
      } catch {
        // ignore
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('bridgik_sound_enabled', String(enabled));
  }

  public toggle(): boolean {
    this.setEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  /**
   * Cheerful 8-bit chime when a peer connects to the room
   */
  public playConnect() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(880, now + 0.16); // A5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  /**
   * Gentle 8-bit departure chord when a peer leaves the room
   */
  public playDisconnect() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(440, now + 0.09); // A4
    osc.frequency.setValueAtTime(329.63, now + 0.18); // E4

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Triumphant 8-bit coin / level-up chime on successful file transfer
   */
  public playTransferComplete() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const step = 0.06;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * step);

      gain.gain.setValueAtTime(0.07, now + idx * step);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * step + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * step);
      osc.stop(now + (idx + 1) * step + 0.09);
    });
  }

  /**
   * Iconic Odnoklassniki notification chime for incoming messages, connection requests and alerts
   */
  public playMessage() {
    if (!this.soundEnabled) return;

    if (typeof window !== 'undefined') {
      try {
        const audio = this.notificationAudio
          ? (this.notificationAudio.cloneNode(true) as HTMLAudioElement)
          : new Audio('/sounds/sound-messages-odnoklassniki.mp3');
        audio.volume = 0.85;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            this.playSynthFallback();
          });
        }
        return;
      } catch {
        // fallback
      }
    }

    this.playSynthFallback();
  }

  /**
   * Alias for playMessage() specifically for notifications
   */
  public playNotification() {
    this.playMessage();
  }

  private playSynthFallback() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.04); // A5

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Crisp 8-bit UI button / toggle click
   */
  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(400, now + 0.02);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const sound = new RetroAudio();
