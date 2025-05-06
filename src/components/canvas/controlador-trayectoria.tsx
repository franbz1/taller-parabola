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
  
  constructor(
    puntosTrayectoria: Point[],
    setPuntosVisibles: React.Dispatch<React.SetStateAction<Point[]>>,
    setAnimando: React.Dispatch<React.SetStateAction<boolean>>,
    velocidadAnimacion: number
  ) {
    this.puntosTrayectoria = puntosTrayectoria
    this.setPuntosVisibles = setPuntosVisibles
    this.setAnimando = setAnimando
    this.velocidadAnimacion = velocidadAnimacion
  }
  
  iniciarAnimacion() {
    // Por si acaso había una animación previa
    this.detenerAnimacion()

    // Reiniciar puntos y estado
    this.setPuntosVisibles([])
    this.setAnimando(true)
    
    let indiceActual = 0
    
    const animar = () => {
      // Si ya llegamos al final, detenemos todo
      if (indiceActual >= this.puntosTrayectoria.length-1) {
        this.setAnimando(false)
        this.animacionId = null
        return
      }

      // Añadir el siguiente punto
      this.setPuntosVisibles(puntosPrevios => [
        ...puntosPrevios,
        this.puntosTrayectoria[indiceActual]
      ])
      
      indiceActual++

      // Programar siguiente frame
      this.animacionId = window.setTimeout(animar, this.velocidadAnimacion)
    }    
    
    animar()
  }
  
  detenerAnimacion() {
    if (this.animacionId !== null) {
      clearTimeout(this.animacionId)
      this.animacionId = null
    }
    // Aseguramos que ya no estamos “animando”
    this.setAnimando(false)
  }
}
