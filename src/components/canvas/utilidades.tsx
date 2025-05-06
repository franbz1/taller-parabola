import { Point } from "../../lib/parabolicMotion"

/**
 * Convierte coordenadas del canvas a coordenadas del plano cartesiano
 */
export const canvasACoordenadas = (
  canvasX: number,
  canvasY: number,
  origenX: number,
  origenY: number,
  escala: number
): Point => {
  const x = Math.round((canvasX - origenX) / escala)
  const y = Math.round((origenY - canvasY) / escala)
  return { x, y }
}

/**
 * Convierte coordenadas del plano cartesiano a coordenadas del canvas
 */
export const coordenadasACanvas = (
  x: number,
  y: number,
  origenX: number,
  origenY: number,
  escala: number
): Point => {
  return {
    x: origenX + x * escala,
    y: origenY - y * escala,
  }
}

/**
 * Calcula el color para un punto de la trayectoria basado en su posición en la secuencia
 */
export const calcularColorTrayectoria = (
  indice: number, 
  total: number
): string => {
  // Gradiente de color de azul a rojo
  const r = Math.floor((indice / total) * 255)
  const b = Math.floor(255 - (indice / total) * 255)
  return `rgb(${r}, 0, ${b})`
}