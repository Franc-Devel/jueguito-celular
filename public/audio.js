/**
 * Original, asset-free arcade mixer. Constructing it does not create an AudioContext.
 * Call unlock() directly from a click/tap, setEnabled(bool) for persistent mute,
 * setPlaying(bool) for gameplay/ambient lifecycle, and play(name, strength = 1)
 * for fire, hit, kill, gate, boss, hurt, victory or defeat. End cues work in menus.
 */
export class GameAudio {
  constructor() {
    this.enabled = false;
    try { this.enabled = localStorage.getItem('pulso-sound') === 'on'; } catch {}
    this.context = null;
    this.playing = false;
    this.voices = new Set();
    this.lastCue = new Map();
    this.ambient = null;
    this.suspendTimer = null;
    this.maxVoices = 20;
    this.transition = Promise.resolve();
  }

  async unlock() {
    try {
      if (!this.context) {
        const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Audio) return false;
        this.context = new Audio({ latencyHint: 'interactive' });
        this.master = this.context.createGain();
        this.master.gain.value = this.enabled ? .5 : 0;
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -18;
        this.compressor.knee.value = 16;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = .004;
        this.compressor.release.value = .12;
        this.master.connect(this.compressor);
        this.compressor.connect(this.context.destination);
        this.noise = this._noiseBuffer();
        // iOS needs a source started in the same gesture as context creation.
        const silent = this.context.createBufferSource();
        silent.buffer = this.context.createBuffer(1, 1, this.context.sampleRate);
        silent.connect(this.master);
        silent.onended = () => silent.disconnect();
        silent.start();
      }
      this._cancelSuspend();
      // Resume immediately in the gesture, even if another state change is pending.
      await this.context.resume();
      if (this.enabled && this.playing) this._startAmbient();
      else this._scheduleSuspend();
      return this.context.state === 'running';
    } catch { return false; }
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    try { localStorage.setItem('pulso-sound', this.enabled ? 'on' : 'off'); } catch {}
    if (!this.context) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.enabled ? .5 : 0, now, .035);
    if (this.enabled && this.playing) this._resume(() => this._startAmbient());
    else {
      this._stopAmbient();
      this._clearVoices();
      this._scheduleSuspend();
    }
  }

  setPlaying(value) {
    this.playing = Boolean(value);
    if (!this.context) return;
    if (this.enabled && this.playing) this._resume(() => this._startAmbient());
    else {
      this._stopAmbient();
      // Cut repeated combat sounds on pause. Result fanfares may continue.
      for (const voice of this.voices) {
        if (voice.name !== 'victory' && voice.name !== 'defeat') this._disposeVoice(voice);
      }
      this._scheduleSuspend();
    }
  }

  play(name, strength = 1) {
    if (!this.enabled || !this.context || this.context.state === 'closed') return;
    const intervals = { fire: .085, hit: .055, kill: .075, gate: .16, boss: 1, hurt: .22, victory: 1, defeat: 1 };
    if (!(name in intervals)) return;
    // Only deliberate result sounds are allowed while paused or in a menu.
    if (!this.playing && name !== 'victory' && name !== 'defeat') return;
    const now = this.context.currentTime;
    if (now - (this.lastCue.get(name) ?? -Infinity) < intervals[name]) return;
    this.lastCue.set(name, now);
    const level = Math.min(1.5, Math.max(.35, Number(strength) || 1));
    this._cancelSuspend();
    if (this.context.state !== 'running') {
      this._resume(() => {
        if (this.enabled && (this.playing || name === 'victory' || name === 'defeat')) this._cue(name, level);
      });
    } else this._cue(name, level);
  }

  _resume(action) {
    this._cancelSuspend();
    this.transition = this.transition.catch(() => {}).then(async () => {
      if (!this.context || !this.enabled || this.context.state === 'closed') return;
      if (this.context.state !== 'running') await this.context.resume();
      action();
    }).catch(() => {});
  }

  _cancelSuspend() {
    if (this.suspendTimer !== null) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
  }

  _scheduleSuspend() {
    this._cancelSuspend();
    if (!this.context || (this.enabled && this.playing) || this.voices.size) return;
    // One cancellable, short lifecycle timeout; music itself never uses timers.
    this.suspendTimer = setTimeout(() => {
      this.suspendTimer = null;
      this.transition = this.transition.catch(() => {}).then(async () => {
        if (this.context && this.context.state === 'running' && !(this.enabled && this.playing) && !this.voices.size) {
          await this.context.suspend();
        }
      }).catch(() => {});
    }, 160);
  }

  _cue(name, strength) {
    const c = this.context, time = c.currentTime;
    while (this.voices.size >= this.maxVoices) this._disposeVoice(this.voices.values().next().value);
    const gain = c.createGain();
    gain.gain.value = strength;
    gain.connect(this.master);
    const voice = { name, gain, nodes: [gain], sources: new Set(), disposed: false };
    this.voices.add(voice);
    const tone = (frequency, end, duration, volume, type = 'sine', delay = 0) => {
      const oscillator = c.createOscillator(), envelope = c.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time + delay);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, end), time + delay + duration);
      this._envelope(envelope.gain, time + delay, duration, volume, .007);
      oscillator.connect(envelope); envelope.connect(gain);
      voice.nodes.push(envelope);
      this._source(voice, oscillator, time + delay, time + delay + duration + .015);
    };
    const noise = (duration, volume, frequency, type = 'lowpass', delay = 0) => {
      const source = c.createBufferSource(), filter = c.createBiquadFilter(), envelope = c.createGain();
      source.buffer = this.noise;
      filter.type = type;
      filter.frequency.setValueAtTime(frequency, time + delay);
      filter.frequency.exponentialRampToValueAtTime(Math.max(90, frequency * .35), time + delay + duration);
      filter.Q.value = .7;
      this._envelope(envelope.gain, time + delay, duration, volume, .004);
      source.connect(filter); filter.connect(envelope); envelope.connect(gain);
      voice.nodes.push(filter, envelope);
      this._source(voice, source, time + delay, time + delay + duration + .015);
    };
    switch (name) {
      case 'fire':
        tone(740, 320, .065, .075, 'triangle');
        noise(.035, .035, 3400, 'highpass');
        break;
      case 'hit':
        noise(.075, .10, 1900, 'bandpass');
        tone(150, 75, .09, .07, 'triangle');
        break;
      case 'kill':
        noise(.2, .145, 1300);
        tone(100, 38, .22, .15);
        tone(250, 70, .11, .045, 'triangle');
        break;
      case 'gate':
        [440, 660, 880, 1320].forEach((frequency, i) => tone(frequency, frequency * 1.08, .23, .055, 'sine', i * .055));
        noise(.18, .025, 4300, 'highpass', .04);
        break;
      case 'boss':
        noise(.6, .15, 450);
        tone(80, 40, .65, .19);
        [0, .26].forEach(delay => tone(208, 155, .23, .05, 'sawtooth', delay));
        break;
      case 'hurt':
        noise(.19, .12, 900);
        tone(260, 55, .35, .11, 'triangle');
        tone(78, 36, .3, .16);
        break;
      case 'victory':
        [293.66, 369.99, 440, 587.33].forEach((frequency, i) => tone(frequency, frequency, .52, .055, 'triangle', i * .12));
        [587.33, 739.99, 880].forEach(frequency => tone(frequency, frequency, .75, .035, 'sine', .52));
        break;
      case 'defeat':
        [293.66, 261.63, 220, 146.83].forEach((frequency, i) => tone(frequency, frequency * .98, .32, .065, 'triangle', i * .18));
        tone(73.42, 50, .8, .10, 'sine', .36);
        break;
    }
  }

  _envelope(param, start, duration, volume, attack) {
    param.setValueAtTime(.0001, start);
    param.exponentialRampToValueAtTime(Math.max(.0002, volume), start + Math.min(attack, duration * .2));
    param.exponentialRampToValueAtTime(.0001, start + duration);
  }

  _source(voice, source, start, stop) {
    voice.sources.add(source);
    source.onended = () => {
      source.disconnect();
      voice.sources.delete(source);
      if (!voice.sources.size) {
        this._disposeVoice(voice);
        this._scheduleSuspend();
      }
    };
    source.start(start);
    source.stop(stop);
  }

  _disposeVoice(voice) {
    if (!voice || voice.disposed) return;
    voice.disposed = true;
    for (const source of voice.sources) {
      source.onended = null;
      try { source.stop(); } catch {}
      source.disconnect();
    }
    voice.sources.clear();
    for (const node of voice.nodes) node.disconnect();
    this.voices.delete(voice);
  }

  _clearVoices() {
    for (const voice of this.voices) this._disposeVoice(voice);
  }

  _noiseBuffer() {
    const buffer = this.context.createBuffer(1, Math.ceil(this.context.sampleRate * .8), this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  _musicBuffer() {
    const sampleRate = this.context.sampleRate, beat = 60 / 112, duration = beat * 16;
    const buffer = this.context.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
    const data = buffer.getChannelData(0);
    // Original sixteen-beat D-minor synth loop: soft bass, glass notes and a pulse.
    const bass = [73.416, 58.27, 87.307, 65.406];
    const notes = [293.66, 440, 349.23, 440, 233.08, 349.23, 293.66, 349.23,
      349.23, 523.25, 440, 523.25, 261.63, 392, 329.63, 392];
    const tau = Math.PI * 2;
    for (let i = 0; i < data.length; i++) {
      const time = i / sampleRate, step = Math.floor(time / beat), phase = time % beat;
      const root = bass[Math.floor(step / 4)];
      const bassEnv = Math.min(1, phase / .022) * Math.exp(-phase * 5);
      const melodyEnv = Math.min(1, phase / .035) * Math.exp(-phase * 7);
      const low = (Math.sin(tau * root * phase) + .18 * Math.sin(tau * root * 2 * phase)) * bassEnv * .25;
      const glass = (Math.sin(tau * notes[step] * phase) + .12 * Math.sin(tau * notes[step] * 2 * phase)) * melodyEnv * .10;
      const kick = step % 2 === 0 ? Math.sin(tau * (48 * phase + 2 * (1 - Math.exp(-phase * 25)))) * Math.exp(-phase * 24) * .16 : 0;
      // A short envelope on both ends makes the loop seam click-free.
      const seam = Math.min(1, time / .015, (duration - time) / .025);
      data[i] = (low + glass + kick) * Math.max(0, seam);
    }
    return buffer;
  }

  _startAmbient() {
    if (this.ambient || !this.enabled || !this.playing || this.context.state !== 'running') return;
    this.music ??= this._musicBuffer();
    const source = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain();
    source.buffer = this.music; source.loop = true;
    filter.type = 'lowpass'; filter.frequency.value = 1800;
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(.075, this.context.currentTime + .35);
    source.connect(filter); filter.connect(gain); gain.connect(this.master);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start();
    this.ambient = { source, gain };
  }

  _stopAmbient() {
    if (!this.ambient) return;
    const { source, gain } = this.ambient, now = this.context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(0, now, .025);
    try { source.stop(now + .1); } catch {}
    this.ambient = null;
  }
}
