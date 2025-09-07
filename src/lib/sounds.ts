class SoundService {
    private audioContext: AudioContext | null = null;
    private isEnabled = true;
  
    constructor() {
      // Initialize on first user interaction
      if (typeof window !== 'undefined') {
        const initAudio = () => {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          document.removeEventListener('click', initAudio);
          document.removeEventListener('keydown', initAudio);
        };
        
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
      }
    }
  
    private createBeep(frequency: number, duration: number, volume: number = 0.1) {
      if (!this.audioContext || !this.isEnabled) return;
  
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
  
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
  
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
  
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
  
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    }
  
    // Different notification sounds
    playMessageReceived() {
      this.createBeep(800, 0.1, 0.05);
    }
  
    playMessageSent() {
      this.createBeep(600, 0.08, 0.03);
    }
  
    playUserJoined() {
      this.createBeep(500, 0.15, 0.04);
    }
  
    playError() {
      this.createBeep(300, 0.2, 0.06);
    }
  
    // Toggle sound on/off
    toggle() {
      this.isEnabled = !this.isEnabled;
      return this.isEnabled;
    }
  
    isActive() {
      return this.isEnabled;
    }
  }
  
  export const soundService = new SoundService();