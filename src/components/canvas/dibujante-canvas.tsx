import { Point } from "../../lib/parabolicMotion"
import { coordenadasACanvas } from "./utilidades"
import { DibujanteAvion } from "./dibujante-avion"
import { DibujanteMisil } from "./dibujante-misil"

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
    puntosFreeFall: Point[] = [],
    puntoIntercepcion: Point | null = null,
    mostrarExplosion: boolean = false
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

    // Ya no dibujamos el cañón aquí, se hace por separado para mejor control

    // Dibujar trayectoria del proyectil si existe
    if (puntosTrayectoria.length > 0) {
      DibujanteMisil.dibujarTrayectoria(this.ctx, puntosTrayectoria, origenX, origenY, this.opciones.escala, "blue")
    }

    // Dibujar trayectoria de caída libre si existe
    if (puntosFreeFall.length > 0) {
      DibujanteMisil.dibujarTrayectoria(this.ctx, puntosFreeFall, origenX, origenY, this.opciones.escala, "orange")
    }

    // Dibujar punto seleccionado como un avión si existe
    if (puntoSeleccionado) {
      const canvasPos = coordenadasACanvas(
        puntoSeleccionado.x, 
        puntoSeleccionado.y, 
        origenX, 
        origenY, 
        this.opciones.escala
      )
      // Usar el dibujante de avión en lugar de dibujarPunto
      DibujanteAvion.dibujar(this.ctx, canvasPos.x, canvasPos.y)
    }

    // Dibujar explosión en punto de intercepción si existe y está activa
    if (puntoIntercepcion && mostrarExplosion) {
      const canvasPos = coordenadasACanvas(
        puntoIntercepcion.x, 
        puntoIntercepcion.y, 
        origenX, 
        origenY, 
        this.opciones.escala
      )
      this.dibujarExplosion(canvasPos.x, canvasPos.y)
    }
  }

  /**
   * Obtiene las coordenadas del origen del plano
   * @returns Coordenadas del origen {x, y}
   */
  getOrigenCoords(): {x: number, y: number} {
    const origenX = 40; // Margen para los números
    const origenY = this.opciones.alto - 40; // Margen para los números
    return { x: origenX, y: origenY };
  }

  /**
   * Obtiene el contexto del canvas
   * @returns El contexto del canvas o null si no está disponible
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  /**
   * Dibujar la cuadrícula con densidad adaptativa según la escala
   */
  dibujarCuadricula(origenX: number, origenY: number) {
    if (!this.ctx) return
    const { ancho, alto, escala, intervaloMarcas } = this.opciones

    // Umbral mínimo en píxeles para separar líneas de cuadrícula
    const PIXEL_THRESHOLD = 40
    // Calcular cuántas unidades hay que saltar para que la distancia en píxeles supere el umbral
    const unidadesPorSalto = Math.max(intervaloMarcas, Math.ceil(PIXEL_THRESHOLD / escala))
    const saltoEnPixeles = unidadesPorSalto * escala

    this.ctx.lineWidth = 0.5
    this.ctx.strokeStyle = "#ccc"

    // Líneas horizontales
    const lineasY = Math.ceil(origenY / saltoEnPixeles)
    for (let i = 0; i <= lineasY; i++) {
      const y = origenY - i * saltoEnPixeles
      if (y < 0 || y > alto) continue
      this.ctx.beginPath()
      this.ctx.moveTo(origenX, y)
      this.ctx.lineTo(ancho, y)
      this.ctx.stroke()
    }

    // Líneas verticales
    const lineasX = Math.ceil((ancho - origenX) / saltoEnPixeles)
    for (let i = 0; i <= lineasX; i++) {
      const x = origenX + i * saltoEnPixeles
      if (x < 0 || x > ancho) continue
      this.ctx.beginPath()
      this.ctx.moveTo(x, origenY)
      this.ctx.lineTo(x, 0)
      this.ctx.stroke()
    }
  }

  /**
   * Dibujar una explosión en el punto de intercepción
   */
  dibujarExplosion(x: number, y: number) {
    if (!this.ctx) return
    
    // Usar un radio fijo en píxeles para la explosión, independiente de la escala
    const radioMaxBase = 25; // Radio base en píxeles para la explosión principal
    const radioMax = radioMaxBase * 1.2; // Radio exterior efectivo
    
    // Crear un gradiente radial para la explosión
    const gradiente = this.ctx.createRadialGradient(x, y, 0, x, y, radioMax)
    gradiente.addColorStop(0, 'rgba(255, 255, 0, 0.9)') // Centro amarillo brillante
    gradiente.addColorStop(0.4, 'rgba(255, 100, 0, 0.8)') // Naranja
    gradiente.addColorStop(0.7, 'rgba(255, 0, 0, 0.6)') // Rojo
    gradiente.addColorStop(1, 'rgba(100, 0, 0, 0)') // Exterior transparente
    
    // Dibujar círculo principal de la explosión
    this.ctx.fillStyle = gradiente
    this.ctx.beginPath()
    this.ctx.arc(x, y, radioMax, 0, Math.PI * 2)
    this.ctx.fill()
    
    // Dibujar detalles adicionales para dar más realismo
    // Rayos que salen desde el centro
    const numRayos = 12
    const longitudRayos = radioMax * 1.3 // Relativo al radioMax fijo
    
    this.ctx.strokeStyle = 'rgba(255, 255, 200, 0.7)'
    this.ctx.lineWidth = 2 // Ancho de línea fijo para los rayos
    
    for (let i = 0; i < numRayos; i++) {
      const angulo = (i / numRayos) * Math.PI * 2
      this.ctx.beginPath()
      this.ctx.moveTo(x, y)
      this.ctx.lineTo(
        x + Math.cos(angulo) * longitudRayos,
        y + Math.sin(angulo) * longitudRayos
      )
      this.ctx.stroke()
    }
    
    // Círculo brillante en el centro
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    this.ctx.beginPath()
    this.ctx.arc(x, y, radioMaxBase * 0.25, 0, Math.PI * 2) // Relativo al radioMaxBase fijo
    this.ctx.fill()
    
    // Texto "¡BOOM!"
    this.ctx.fillStyle = 'rgba(255, 50, 0, 1)'
    this.ctx.font = 'bold 16px Arial' // Tamaño de fuente fijo
    this.ctx.textAlign = 'center'
    this.ctx.fillText('¡BOOM!', x, y - radioMax - 10) // Posición relativa al radioMax fijo
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
    
    const { ancho, escala, intervaloMarcas: baseIntervaloNumeros } = this.opciones
    
    this.ctx.strokeStyle = "#000"
    this.ctx.lineWidth = 1
    this.ctx.font = "10px Arial"
    // textAlign y textBaseline son heredados de dibujarEjes (center, middle)

    const MAJOR_TICK_TEXT_PIXEL_THRESHOLD = 35 // Umbral para números
    const MINOR_TICK_PIXEL_THRESHOLD = 15   // Umbral para marcas menores

    // --- Calcular intervalo efectivo para los números ---
    let intervaloEfectivoNumeros: number
    if (baseIntervaloNumeros <= 0) {
      intervaloEfectivoNumeros = 1 // Evitar división por cero o bucles infinitos
    } else if (baseIntervaloNumeros * escala >= MAJOR_TICK_TEXT_PIXEL_THRESHOLD) {
      intervaloEfectivoNumeros = baseIntervaloNumeros
    } else {
      // Incrementar el intervalo base hasta que supere el umbral de píxeles
      const N = Math.ceil(MAJOR_TICK_TEXT_PIXEL_THRESHOLD / (baseIntervaloNumeros * escala))
      intervaloEfectivoNumeros = N * baseIntervaloNumeros
    }
    // Asegurarse de que el intervalo efectivo no sea cero si N fue cero (aunque ceil(>0) >= 1)
    if (intervaloEfectivoNumeros <= 0) intervaloEfectivoNumeros = baseIntervaloNumeros > 0 ? baseIntervaloNumeros : 1;


    // --- Calcular paso para las marcas menores ---
    const pasoMarcasMenores = Math.max(1, Math.ceil(MINOR_TICK_PIXEL_THRESHOLD / escala))

    const maxValorX = (ancho - origenX) / escala
    const maxValorY = origenY / escala

    // --- Eje X ---
    // Marcas Mayores (numeradas)
    if (intervaloEfectivoNumeros > 0) {
      for (let valor = intervaloEfectivoNumeros; valor <= maxValorX; valor += intervaloEfectivoNumeros) {
        const x = origenX + valor * escala
        if (x > ancho - 5) continue // Evitar dibujar muy cerca del borde

        this.ctx.beginPath()
        this.ctx.moveTo(x, origenY - 5) // Marca un poco más larga
        this.ctx.lineTo(x, origenY + 5)
        this.ctx.stroke()
        this.ctx.fillText(`${valor}`, x, origenY + 15)
      }
    }

    // Marcas Menores
    if (pasoMarcasMenores > 0) {
      for (let valor = pasoMarcasMenores; valor <= maxValorX; valor += pasoMarcasMenores) {
        if (intervaloEfectivoNumeros > 0 && valor % intervaloEfectivoNumeros === 0) {
          continue // Ya dibujada como marca mayor
        }
        const x = origenX + valor * escala
        if (x > ancho - 5) continue

        this.ctx.beginPath()
        this.ctx.moveTo(x, origenY - 3) // Marca más corta
        this.ctx.lineTo(x, origenY + 3)
        this.ctx.stroke()
      }
    }

    // --- Eje Y ---
    // Marcas Mayores (numeradas)
    if (intervaloEfectivoNumeros > 0) {
      for (let valor = intervaloEfectivoNumeros; valor <= maxValorY; valor += intervaloEfectivoNumeros) {
        const y = origenY - valor * escala
        if (y < 5) continue // Evitar dibujar muy cerca del borde

        this.ctx.beginPath()
        this.ctx.moveTo(origenX - 5, y) // Marca un poco más larga
        this.ctx.lineTo(origenX + 5, y)
        this.ctx.stroke()
        this.ctx.fillText(`${valor}`, origenX - 15, y)
      }
    }

    // Marcas Menores
    if (pasoMarcasMenores > 0) {
      for (let valor = pasoMarcasMenores; valor <= maxValorY; valor += pasoMarcasMenores) {
        if (intervaloEfectivoNumeros > 0 && valor % intervaloEfectivoNumeros === 0) {
          continue // Ya dibujada como marca mayor
        }
        const y = origenY - valor * escala
        if (y < 5) continue

        this.ctx.beginPath()
        this.ctx.moveTo(origenX - 3, y) // Marca más corta
        this.ctx.lineTo(origenX + 3, y)
        this.ctx.stroke()
      }
    }

    // Dibujar origen (0,0)
    this.ctx.fillText("0", origenX - 10, origenY + 15)
  }
}