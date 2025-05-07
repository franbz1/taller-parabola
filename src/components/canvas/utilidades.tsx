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