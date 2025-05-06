import { Point } from "../../lib/parabolicMotion"
import { coordenadasACanvas } from "./utilidades"

/**
 * Opciones para el dibujante del canvas
 */
export interface OpcionesDibujante {
  escala: number
  intervaloMarcas: number
  ancho: number
  alto: number
  anguloInicial: number
  velocidadInicial: number
}

/**
 * Clase que dibuja en el canvas del plano cartesiano
 */
export class DibujanteCanvas {
  private canvas: HTMLCanvasElement | null
  private ctx: CanvasRenderingContext2D | null
  private opciones: OpcionesDibujante

  constructor(canvas: HTMLCanvasElement | null, opciones: OpcionesDibujante) {
    this.canvas = canvas
    this.ctx = canvas?.getContext("2d") || null
    this.opciones = opciones
  }

  /**
   * Función principal para dibujar el plano cartesiano
   */
  dibujarPlano(
    puntoSeleccionado: Point | null = null, 
    puntosTrayectoria: Point[] = [],
    puntosFreeFall: Point[] = []
  ) {
    if (!this.canvas || !this.ctx) return

    const { ancho, alto } = this.opciones

    // Limpiar el canvas
    this.ctx.clearRect(0, 0, ancho, alto)

    // Calcular el origen (esquina inferior izquierda con margen)
    const origenX = 40 // Margen para los números
    const origenY = alto - 40 // Margen para los números

    // Dibujar cuadrícula
    this.dibujarCuadricula(origenX, origenY)

    // Dibujar ejes
    this.dibujarEjes(origenX, origenY)

    // Dibujar marcas y números
    this.dibujarMarcas(origenX, origenY)

    // Dibujar cañón
    this.dibujarCañon(origenX, origenY, this.opciones.anguloInicial)

    // Dibujar trayectoria del proyectil si existe
    if (puntosTrayectoria.length > 0) {
      this.dibujarTrayectoria(puntosTrayectoria, origenX, origenY, "blue")
    }

    // Dibujar trayectoria de caída libre si existe
    if (puntosFreeFall.length > 0) {
      this.dibujarTrayectoria(puntosFreeFall, origenX, origenY, "orange")
    }

    // Dibujar punto seleccionado si existe
    if (puntoSeleccionado) {
      const canvasPos = coordenadasACanvas(
        puntoSeleccionado.x, 
        puntoSeleccionado.y, 
        origenX, 
        origenY, 
        this.opciones.escala
      )
      this.dibujarPunto(canvasPos.x, canvasPos.y, puntoSeleccionado)
    }
  }

  /**
   * Dibujar la cuadrícula
   */
  dibujarCuadricula(origenX: number, origenY: number) {
    if (!this.ctx) return
    
    const { ancho, alto, escala } = this.opciones
    
    this.ctx.strokeStyle = "#eee"
    this.ctx.lineWidth = 0.5

    // Calcular cuántas líneas caben en el canvas
    const lineasHorizontales = Math.ceil(origenY / escala)
    const lineasVerticales = Math.ceil((ancho - origenX) / escala)

    // Dibujar líneas horizontales
    for (let i = 0; i <= lineasHorizontales; i++) {
      const y = origenY - i * escala
      if (y < 0 || y > alto) continue

      this.ctx.beginPath()
      this.ctx.moveTo(origenX, y)
      this.ctx.lineTo(ancho, y)
      this.ctx.stroke()
    }

    // Dibujar líneas verticales
    for (let i = 0; i <= lineasVerticales; i++) {
      const x = origenX + i * escala
      if (x < 0 || x > ancho) continue

      this.ctx.beginPath()
      this.ctx.moveTo(x, origenY)
      this.ctx.lineTo(x, 0)
      this.ctx.stroke()
    }
  }

  /**
   * Dibujar una trayectoria
   */
  dibujarTrayectoria(puntos: Point[], origenX: number, origenY: number, color: string = "blue") {
    if (!this.ctx || puntos.length === 0) return
    
    const { escala } = this.opciones
    
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 2
    this.ctx.lineJoin = "round"
    
    // Dibujar línea que conecta los puntos
    this.ctx.beginPath()
    
    for (let i = 0; i < puntos.length; i++) {
      const canvasPos = coordenadasACanvas(
        puntos[i].x, 
        puntos[i].y, 
        origenX, 
        origenY, 
        escala
      )
      
      if (i === 0) {
        this.ctx.moveTo(canvasPos.x, canvasPos.y)
      } else {
        this.ctx.lineTo(canvasPos.x, canvasPos.y)
      }
    }
    
    this.ctx.stroke()
    
    // Dibujar el último punto como un círculo
    if (puntos.length > 0) {
      const ultimoPunto = puntos[puntos.length - 1]
      const canvasPos = coordenadasACanvas(
        ultimoPunto.x, 
        ultimoPunto.y, 
        origenX, 
        origenY, 
        escala
      )
      
      this.ctx.fillStyle = color
      this.ctx.beginPath()
      this.ctx.arc(canvasPos.x, canvasPos.y, 4, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  /**
   * Dibujar los ejes principales
   */
  dibujarEjes(origenX: number, origenY: number) {
    if (!this.ctx) return
    
    const { ancho } = this.opciones
    
    this.ctx.strokeStyle = "#000"
    this.ctx.lineWidth = 1.5
    this.ctx.font = "12px Arial"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"

    // Eje X
    this.ctx.beginPath()
    this.ctx.moveTo(origenX, origenY)
    this.ctx.lineTo(ancho, origenY)
    this.ctx.stroke()

    // Eje Y
    this.ctx.beginPath()
    this.ctx.moveTo(origenX, origenY)
    this.ctx.lineTo(origenX, 0)
    this.ctx.stroke()

    // Flechas y etiquetas
    // Flecha X
    this.ctx.beginPath()
    this.ctx.moveTo(ancho - 10, origenY - 5)
    this.ctx.lineTo(ancho, origenY)
    this.ctx.lineTo(ancho - 10, origenY + 5)
    this.ctx.fill()

    // Flecha Y
    this.ctx.beginPath()
    this.ctx.moveTo(origenX - 5, 10)
    this.ctx.lineTo(origenX, 0)
    this.ctx.lineTo(origenX + 5, 10)
    this.ctx.fill()

    // Etiquetas
    this.ctx.fillText("X", ancho - 15, origenY + 15)
    this.ctx.fillText("Y", origenX - 15, 15)
  }

  /**
   * Dibujar marcas y números en los ejes
   */
  dibujarMarcas(origenX: number, origenY: number) {
    if (!this.ctx) return
    
    const { ancho, escala, intervaloMarcas } = this.opciones
    
    this.ctx.strokeStyle = "#000"
    this.ctx.lineWidth = 1
    this.ctx.font = "10px Arial"

    // Calcular cuántas marcas caben en el canvas
    const marcasHorizontales = Math.floor((ancho - origenX) / escala)
    const marcasVerticales = Math.floor(origenY / escala)

    // Dibujar marcas en eje X
    for (let i = 1; i <= marcasHorizontales; i++) {
      const x = origenX + i * escala
      if (x > ancho) continue

      // Dibujar marca
      this.ctx.beginPath()
      this.ctx.moveTo(x, origenY - 5)
      this.ctx.lineTo(x, origenY + 5)
      this.ctx.stroke()

      // Dibujar número si corresponde al intervalo
      if (i % intervaloMarcas === 0) {
        this.ctx.fillText(`${i}`, x, origenY + 15)
      }
    }

    // Dibujar marcas en eje Y
    for (let i = 1; i <= marcasVerticales; i++) {
      const y = origenY - i * escala
      if (y < 0) continue

      // Dibujar marca
      this.ctx.beginPath()
      this.ctx.moveTo(origenX - 5, y)
      this.ctx.lineTo(origenX + 5, y)
      this.ctx.stroke()

      // Dibujar número si corresponde al intervalo
      if (i % intervaloMarcas === 0) {
        this.ctx.fillText(`${i}`, origenX - 15, y)
      }
    }

    // Dibujar origen (0,0)
    this.ctx.fillText("0", origenX - 10, origenY + 15)
  }

  /**
   * Dibujar un punto con sus coordenadas
   */
  dibujarPunto(x: number, y: number, coordenadas: Point) {
    if (!this.ctx) return
    
    // Dibujar círculo
    this.ctx.fillStyle = "red"
    this.ctx.beginPath()
    this.ctx.arc(x, y, 5, 0, Math.PI * 2)
    this.ctx.fill()

    // Dibujar coordenadas
    this.ctx.fillStyle = "black"
    this.ctx.font = "12px Arial"
    this.ctx.fillText(`(${coordenadas.x}, ${coordenadas.y})`, x, y - 10)
  }

  /**
   * Dibujar el cañón en el origen
   */
  dibujarCañon(origenX: number, origenY: number, angulo: number) {
    if (!this.ctx) return
    
    const { escala } = this.opciones
    
    // Longitud del cañón
    const longitudCañon = escala * 2

    // Convertir ángulo a radianes (0 grados apunta hacia la derecha)
    const anguloRad = (angulo * Math.PI) / 180

    // Calcular el punto final del cañón
    const finX = origenX + longitudCañon * Math.cos(anguloRad)
    const finY = origenY - longitudCañon * Math.sin(anguloRad)

    // Dibujar la base del cañón (círculo)
    this.ctx.fillStyle = "#555"
    this.ctx.beginPath()
    this.ctx.arc(origenX, origenY, escala / 2, 0, Math.PI * 2)
    this.ctx.fill()

    // Dibujar el cañón (línea gruesa)
    this.ctx.strokeStyle = "#333"
    this.ctx.lineWidth = escala / 3
    this.ctx.lineCap = "round"
    this.ctx.beginPath()
    this.ctx.moveTo(origenX, origenY)
    this.ctx.lineTo(finX, finY)
    this.ctx.stroke()

    // Dibujar el ángulo actual
    this.ctx.fillStyle = "black"
    this.ctx.font = "12px Arial"
    this.ctx.fillText(`${angulo}°`, origenX + 10, origenY - 10)
  }
}