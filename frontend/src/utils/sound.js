// Web Audio API Ringtone and Dialing Sound Synthesizer
// Works reliably across all browsers without requiring external audio asset downloads

class SoundController {
	constructor() {
		this.audioCtx = null;
		this.ringtoneInterval = null;
		this.dialingInterval = null;
	}

	getAudioContext() {
		if (!this.audioCtx || this.audioCtx.state === "closed") {
			const AudioContextClass = window.AudioContext || window.webkitAudioContext;
			if (AudioContextClass) {
				this.audioCtx = new AudioContextClass();
			}
		}
		if (this.audioCtx && this.audioCtx.state === "suspended") {
			this.audioCtx.resume();
		}
		return this.audioCtx;
	}

	// Incoming Call Ringtone
	playRingtone() {
		this.stopRingtone();
		const ctx = this.getAudioContext();
		if (!ctx) return;

		const playRingBurst = () => {
			if (!this.audioCtx || this.audioCtx.state === "closed") return;
			try {
				const now = this.audioCtx.currentTime;

				// Dual-tone US/Standard telephone ring frequencies (440Hz + 480Hz)
				const osc1 = this.audioCtx.createOscillator();
				const osc2 = this.audioCtx.createOscillator();
				const gain = this.audioCtx.createGain();

				osc1.type = "sine";
				osc2.type = "sine";
				osc1.frequency.setValueAtTime(440, now);
				osc2.frequency.setValueAtTime(480, now);

				// Tone burst envelope: 1.5s on, then off
				gain.gain.setValueAtTime(0, now);
				gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
				gain.gain.setValueAtTime(0.18, now + 1.4);
				gain.gain.linearRampToValueAtTime(0, now + 1.5);

				osc1.connect(gain);
				osc2.connect(gain);
				gain.connect(this.audioCtx.destination);

				osc1.start(now);
				osc2.start(now);
				osc1.stop(now + 1.5);
				osc2.stop(now + 1.5);
			} catch (e) {
				console.warn("Audio playback error:", e);
			}
		};

		playRingBurst();
		this.ringtoneInterval = setInterval(playRingBurst, 3000);
	}

	stopRingtone() {
		if (this.ringtoneInterval) {
			clearInterval(this.ringtoneInterval);
			this.ringtoneInterval = null;
		}
	}

	// Outgoing Dialing Beep
	playDialTone() {
		this.stopDialTone();
		const ctx = this.getAudioContext();
		if (!ctx) return;

		const playBeep = () => {
			if (!this.audioCtx || this.audioCtx.state === "closed") return;
			try {
				const now = this.audioCtx.currentTime;
				const osc = this.audioCtx.createOscillator();
				const gain = this.audioCtx.createGain();

				osc.type = "sine";
				osc.frequency.setValueAtTime(425, now);

				gain.gain.setValueAtTime(0, now);
				gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
				gain.gain.setValueAtTime(0.12, now + 0.9);
				gain.gain.linearRampToValueAtTime(0, now + 1.0);

				osc.connect(gain);
				gain.connect(this.audioCtx.destination);

				osc.start(now);
				osc.stop(now + 1.0);
			} catch (e) {
				console.warn("Dial tone error:", e);
			}
		};

		playBeep();
		this.dialingInterval = setInterval(playBeep, 3000);
	}

	stopDialTone() {
		if (this.dialingInterval) {
			clearInterval(this.dialingInterval);
			this.dialingInterval = null;
		}
	}

	// End Call Tone
	playEndCallTone() {
		this.stopRingtone();
		this.stopDialTone();
		const ctx = this.getAudioContext();
		if (!ctx) return;

		try {
			const now = ctx.currentTime;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(480, now);
			osc.frequency.exponentialRampToValueAtTime(240, now + 0.25);

			gain.gain.setValueAtTime(0.15, now);
			gain.gain.linearRampToValueAtTime(0, now + 0.3);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(now);
			osc.stop(now + 0.3);
		} catch (e) {
			console.warn("End call tone error:", e);
		}
	}
}

export const soundController = new SoundController();
