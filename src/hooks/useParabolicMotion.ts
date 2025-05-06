import { useMemo } from 'react';
import {
  calculateRange,
  calculateMaxHeight,
  calculateFlightTime,
  calculateTrajectory,
  calculateFreeFall,
  detectInterception
} from '../lib/parabolicMotion';
import type {
  TrajectoryData,
  FreeFallData,
  InterceptionResult
} from '../lib/parabolicMotion';

/**
 * Hook para cálculos de movimiento parabólico
 * @param data Parámetros de la trayectoria parabolica (incluye optional initialPosition)
 */
export function useTrajectory(data: TrajectoryData) {
  const { initialSpeed, angle } = data;

  // Rango, altura máxima y tiempo de vuelo no dependen de la posición inicial
  const range = useMemo(() => calculateRange(initialSpeed, angle), [initialSpeed, angle]);
  const maxHeight = useMemo(() => calculateMaxHeight(initialSpeed, angle), [initialSpeed, angle]);
  const flightTime = useMemo(() => calculateFlightTime(initialSpeed, angle), [initialSpeed, angle]);

  // Trayectoria como array de puntos absolutos (incluye initialPosition si viene en data)
  const trajectory = useMemo(
    () => calculateTrajectory(data),
    [data.initialPosition?.x, data.initialPosition?.y, data.initialSpeed, data.angle, data.timeStep, data.maxTime]
  );

  return {
    range,
    maxHeight,
    flightTime,
    trajectory
  };
}

/**
 * Hook para cálculos de caída libre
 * @param data Parámetros de la caída libre (incluye optional initialPosition)
 */
export function useFreeFall(data: FreeFallData) {
  // Free-fall trajectory from any starting point (initialPosition) or height
  const freeFallTrajectory = useMemo(
    () => calculateFreeFall(data),
    [data.initialPosition?.x, data.initialPosition?.y, data.initialHorizontalSpeed, data.timeStep]
  );

  return {
    freeFallTrajectory
  };
}

/**
 * Hook para detectar intercepción entre trayectoria parabólica y caída libre
 * @param parabolicData Datos de la trayectoria parabólica (incluye initialPosition)
 * @param freeFallData Datos de la caída libre (incluye initialPosition)
 * @param tolerance Tolerancia en metros (opcional)
 */
export function useInterception(
  parabolicData: TrajectoryData,
  freeFallData: FreeFallData,
  tolerance?: number
): InterceptionResult {
  const result = useMemo(
    () => detectInterception(parabolicData, freeFallData, tolerance),
    [
      parabolicData.initialPosition?.x,
      parabolicData.initialPosition?.y,
      parabolicData.initialSpeed,
      parabolicData.angle,
      parabolicData.timeStep,
      parabolicData.maxTime,
      freeFallData.initialPosition?.x,
      freeFallData.initialPosition?.y,
      freeFallData.initialHorizontalSpeed,
      freeFallData.timeStep,
      tolerance
    ]
  );

  return result;
}
