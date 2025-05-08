import { useMemo } from 'react';
import {
  calculateRange,
  calculateMaxHeight,
  calculateFlightTime,
  calculateTrajectory,
  calculateFreeFall,
  detectInterception,
  calculateInterceptionLaunch
} from '../lib/parabolicMotion';
import type {
  TrajectoryData,
  FreeFallData,
  InterceptionResult,
  Point,
  LaunchParams
} from '../lib/parabolicMotion';

/**
 * Hook para cálculos de movimiento parabólico
 * @param data Parámetros de la trayectoria parabolica (incluye optional initialPosition)
 */
export function useTrajectory(data: TrajectoryData) {
  const { initialSpeed, angle } = data;

  const range = useMemo(() => calculateRange(initialSpeed, angle), [initialSpeed, angle]);
  const maxHeight = useMemo(() => calculateMaxHeight(initialSpeed, angle), [initialSpeed, angle]);
  const flightTime = useMemo(() => calculateFlightTime(initialSpeed, angle), [initialSpeed, angle]);

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

/**
 * Hook para obtener ángulo y velocidad inicial necesarios para que
 * una parábola desde (0,0) intercepte una caída libre que parte
 * de `fallOrigin` en la altura `interceptHeight`.
 *
 * @param fallOrigin  Punto de inicio de la caída libre ({ x, y })
 * @param interceptHeight  Altura a la cual interceptar (>= 0)
 * @returns Un objeto con:
 *  - launchParams: { angle, speed } si todo va bien
 *  - error: mensaje en caso de fallo de validación
 */
export function useInterceptionLaunch(
  fallOrigin: Point,
  interceptHeight: number
): { launchParams?: LaunchParams; error?: string } {
  return useMemo(() => {
    try {
      const launchParams = calculateInterceptionLaunch(fallOrigin, interceptHeight);
      return { launchParams };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fallOrigin.x, fallOrigin.y, interceptHeight]);
}
