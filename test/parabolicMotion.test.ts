import { describe, test, expect } from 'vitest';
import {
  DEG_TO_RAD,
  GRAVITY,
  TrajectoryData,
  FreeFallData,
  calculateRange,
  calculateMaxHeight,
  calculateFlightTime,
  calculatePosition,
  calculateTrajectory,
  calculateFreeFall,
  detectInterception,
} from '../src/lib/parabolicMotion';

describe('Constantes', () => {
  test('DEG_TO_RAD está definido correctamente', () => {
    expect(DEG_TO_RAD).toBeCloseTo(Math.PI / 180);
  });

  test('GRAVITY está definida correctamente', () => {
    expect(GRAVITY).toBeCloseTo(9.81);
  });
});

describe('calculateRange', () => {
  test('calcula correctamente el alcance para 45 grados', () => {
    const v0 = 20;
    const angle = 45;
    const esperado = (v0 * v0) / GRAVITY;
    expect(calculateRange(v0, angle)).toBeCloseTo(esperado);
  });

  test('alcance es cero para 0 y 90 grados', () => {
    const v0 = 10;
    expect(calculateRange(v0, 0)).toBeCloseTo(0);
    expect(calculateRange(v0, 90)).toBeCloseTo(0);
  });
});

describe('calculateMaxHeight', () => {
  test('altura máxima correcta para 45 grados', () => {
    const v0 = 20;
    const angle = 45;
    const esperado = (v0 * v0 * Math.sin(angle * DEG_TO_RAD) ** 2) / (2 * GRAVITY);
    expect(calculateMaxHeight(v0, angle)).toBeCloseTo(esperado);
  });
});

describe('calculateFlightTime', () => {
  test('tiempo de vuelo correcto para 45 grados', () => {
    const v0 = 20;
    const angle = 45;
    const esperado = (2 * v0 * Math.sin(angle * DEG_TO_RAD)) / GRAVITY;
    expect(calculateFlightTime(v0, angle)).toBeCloseTo(esperado);
  });
});

describe('calculatePosition', () => {
  test('posición en t=0', () => {
    const pos = calculatePosition(20, 45, 0);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.y).toBeCloseTo(0);
  });
});

describe('calculateTrajectory', () => {
  test('trayectoria con default initialPosition comienza en (0,0)', () => {
    const data: TrajectoryData = { initialSpeed: 10, angle: 45, timeStep: 0.5 };
    const tr = calculateTrajectory(data);
    expect(tr[0]).toEqual({ x: 0, y: 0 });
  });

  test('trayectoria con initialPosition offset', () => {
    const data: TrajectoryData = {
      initialPosition: { x: 5, y: 5 },
      initialSpeed: 10,
      angle: 30,
      timeStep: 0.5
    };
    const tr = calculateTrajectory(data);
    expect(tr[0]).toEqual({ x: 5, y: 5 });
  });
});

describe('calculateFreeFall', () => {
  test('trayectoria caída desde altura con default x0 y0', () => {
    const data: FreeFallData = { initialPosition: {x: 0, y: 10}, initialHorizontalSpeed: 5, timeStep: 0.1 };
    const tr = calculateFreeFall(data);
    console.log(tr)
    expect(tr[0]).toEqual({ x: 0, y: 10 });
  });

  test('trayectoria caída con initialPosition offset', () => {
    const data: FreeFallData = {
      initialPosition: { x: 2, y: 8 },
      initialHorizontalSpeed: 3,
      timeStep: 0.2
    };
    const tr = calculateFreeFall(data);
    expect(tr[0]).toEqual({ x: 2, y: 8 });
  });
});

describe('detectInterception', () => {
  test('se interceptan y minDistance = 0', () => {
    const para: TrajectoryData = { initialPosition: { x: 0, y: 0 }, initialSpeed: 10, angle: 45, timeStep: 0.1 };
    const libre: FreeFallData = { initialPosition: { x: 5, y: 5 }, initialHorizontalSpeed: 0, timeStep: 0.1 };
    const res = detectInterception(para, libre, 0.2);
    expect(res.intercepted).toBe(true);
    expect(res.minDistance).toBeCloseTo(0);
    expect(res.point).toBeDefined();
    expect(res.timeParabolic).toBeGreaterThanOrEqual(0);
    expect(res.timeFreefall).toBeGreaterThanOrEqual(0);
  });

  test('no se interceptan y minDistance > 0', () => {
    const para: TrajectoryData = { initialPosition: { x: 0, y: 0 }, initialSpeed: 5, angle: 20, timeStep: 0.1 };
    const libre: FreeFallData = { initialPosition: { x: 50, y: 50 }, initialHorizontalSpeed: 0, timeStep: 0.1 };
    const res = detectInterception(para, libre);
    expect(res.intercepted).toBe(false);
    expect(res.minDistance).toBeGreaterThan(0);
    expect(res.pointParabolicAtMin).toBeDefined();
    expect(res.pointFreefallAtMin).toBeDefined();
  });

  test('maneja casos con una trayectoria vacía', () => {
    const para: TrajectoryData = { initialPosition: { x: 0, y: 0 }, initialSpeed: 0, angle: 0, timeStep: 0.1 };
    const libre: FreeFallData = { initialPosition: { x: 0, y: 5 },	timeStep: 0.1 };
    const res = detectInterception(para, libre);
    expect(res.intercepted).toBe(false);
    expect(res.minDistance).toBeGreaterThanOrEqual(0);
  });
});
