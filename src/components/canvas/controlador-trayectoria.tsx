import { Point } from "../../lib/parabolicMotion"

/**
 * Clase que controla la animación de la trayectoria
 */
export class ControladorTrayectoria {
  private puntosTrayectoria: Point[]
  private setPuntosVisibles: React.Dispatch<React.SetStateAction<Point[]>>
  private setAnimando: React.Dispatch<React.SetStateAction<boolean>>
  private velocidadAnimacion: number
  private animacionId: number | null = null
  private tiempoMaximoAnimacion?: number
  
  constructor(
    puntosTrayectoria: Point[],
    setPuntosVisibles: React.Dispatch<React.SetStateAction<Point[]>>,
    setAnimando: React.Dispatch<React.SetStateAction<boolean>>,
    velocidadAnimacion: number,
    tiempoMaximoAnimacion?: number
  ) {
    this.puntosTrayectoria = puntosTrayectoria
    this.setPuntosVisibles = setPuntosVisibles
    this.setAnimando = setAnimando
    this.velocidadAnimacion = velocidadAnimacion
    this.tiempoMaximoAnimacion = tiempoMaximoAnimacion
  }
  
  iniciarAnimacion() {
    // Por si acaso había una animación previa
    this.detenerAnimacion()

    // Reiniciar puntos y estado
    this.setPuntosVisibles([])
    
    let indiceActual = 0
    
    const animar = () => {
      // Si es el primer punto de la animación principal, marcar como animando
      if (indiceActual === 0) {
        this.setAnimando(true); 
      }

      // Añadir el punto actual antes de cualquier verificación de fin
      // para asegurar que el punto de colisión (o el último punto) se dibuje.
      if (indiceActual < this.puntosTrayectoria.length) {
        this.setPuntosVisibles(puntosPrevios => [
          ...puntosPrevios,
          this.puntosTrayectoria[indiceActual]
        ])
      }

      // Condición 1: ¿Se alcanzó el tiempo máximo de animación (colisión)?
      if (this.tiempoMaximoAnimacion !== undefined) {
        const tiempoActualAnimacion = (indiceActual + 1) * (this.velocidadAnimacion / 1000)
        if (tiempoActualAnimacion >= this.tiempoMaximoAnimacion) {
          this.setAnimando(false) // Detener animación global si es el controlador principal
          this.animacionId = null
          return
        }
      }
      
      // Condición 2: ¿Se acabaron los puntos de la trayectoria?
      if (indiceActual >= this.puntosTrayectoria.length - 1) {
        this.setAnimando(false) // Detener animación global si es el controlador principal
        this.animacionId = null
        return
      }
      
      indiceActual++

      // Programar siguiente frame
      this.animacionId = window.setTimeout(animar, this.velocidadAnimacion)
    }    
    
    // Iniciar solo si hay puntos
    if (this.puntosTrayectoria.length > 0) {
      animar()
    } else {
      this.setAnimando(false) // No hay nada que animar
    }
  }
  
  detenerAnimacion() {
    if (this.animacionId !== null) {
      clearTimeout(this.animacionId)
      this.animacionId = null
    }
    // Aseguramos que ya no estamos "animando"
    this.setAnimando(false)
  }
}
