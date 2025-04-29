/**
 * Clase para gestionar efectos de sonido en la aplicación
 */
export class SoundEffects {
  private static audioContext: AudioContext | null = null;
  
  /**
   * Inicializa el contexto de audio (debe llamarse desde una interacción de usuario)
   */
  static initialize(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Genera un sonido de explosión
   */
  static playExplosionSound(): void {
    if (!this.audioContext) {
      this.initialize();
      if (!this.audioContext) return; // Si aún no se pudo inicializar
    }
    
    // Crear un oscilador para el sonido principal
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Configurar el tipo y frecuencia inicial
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 1.5);
    
    // Configurar el volumen (comienza alto y disminuye)
    gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
    
    // Conectar y reproducir
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 1.5);
    
    // Añadir un poco de ruido blanco para simular la explosión
    this.playWhiteNoise(1.0);
  }
  
  /**
   * Genera ruido blanco (componente de la explosión)
   */
  private static playWhiteNoise(duration: number): void {
    if (!this.audioContext) return;
    
    // Crear un buffer de ruido blanco
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    
    // Llenar el buffer con ruido aleatorio
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    // Crear source node y gain node
    const whiteNoise = this.audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    
    const whiteNoiseGain = this.audioContext.createGain();
    whiteNoiseGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    whiteNoiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    // Aplicar un filtro pasa-bajo para suavizar
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);
    
    // Conectar y reproducir
    whiteNoise.connect(filter);
    filter.connect(whiteNoiseGain);
    whiteNoiseGain.connect(this.audioContext.destination);
    
    whiteNoise.start();
    whiteNoise.stop(this.audioContext.currentTime + duration);
  }
} 