/**
 * Constantes y utilidades para conversión y gravedad
 */
export const DEG_TO_RAD = Math.PI / 180;
export const GRAVITY = 9.81;

/**
 * Punto en el espacio 2D
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Datos para movimiento parabólico
 */
export interface TrajectoryData {
  initialPosition?: Point;   // { x: 0, y: 0 } por defecto
  initialSpeed: number;      // m/s
  angle: number;             // grados
  timeStep?: number;         // s
  maxTime?: number;          // s
}

/**
 * Datos para caída libre
 */
export interface FreeFallData {
  initialPosition?: Point;      // { x: 0, y: h0 } por defecto
  initialHorizontalSpeed?: number; // m/s
  timeStep?: number;            // s
}

/**
 * Conversión de grados a radianes
 */
function toRadians(deg: number): number {
  return deg * DEG_TO_RAD;
}

/**
 * Alcance horizontal máximo (suelo al mismo nivel)
 */
export function calculateRange(v0: number, angleDeg: number): number {
  const θ = toRadians(angleDeg);
  // sin(2θ) = 2 sinθ cosθ
  return (v0 * v0 * Math.sin(2 * θ)) / GRAVITY;
}

/**
 * Altura máxima alcanzada
 */
export function calculateMaxHeight(v0: number, angleDeg: number): number {
  const θ = toRadians(angleDeg);
  const s = Math.sin(θ);
  return (v0 * v0 * s * s) / (2 * GRAVITY);
}

/**
 * Tiempo total de vuelo (ida y vuelta al mismo nivel)
 */
export function calculateFlightTime(v0: number, angleDeg: number): number {
  const θ = toRadians(angleDeg);
  return (2 * v0 * Math.sin(θ)) / GRAVITY;
}

/**
 * Posición (x,y) en tiempo t
 */
export function calculatePosition(
  v0: number,
  angleDeg: number,
  t: number
): Point {
  const θ = toRadians(angleDeg);
  const vx = v0 * Math.cos(θ);
  const vy = v0 * Math.sin(θ);
  return {
    x: vx * t,
    y: vy * t - 0.5 * GRAVITY * t * t,
  };
}

/**
 * Genera la trayectoria parabólica desde t=0 hasta que y=0
 */
export function calculateTrajectory(
  data: TrajectoryData
): Point[] {
  const {
    initialPosition = { x: 0, y: 0 },
    initialSpeed: v0,
    angle,
    timeStep = 0.1,
    maxTime
  } = data;

  const totalTime = maxTime ?? calculateFlightTime(v0, angle);
  const steps = Math.ceil(totalTime / timeStep);
  const pts: Point[] = [];

  const θ = toRadians(angle);
  const vx = v0 * Math.cos(θ);
  const vy = v0 * Math.sin(θ);

  for (let i = 0; i <= steps; i++) {
    const t = i * timeStep;
    const x = initialPosition.x + vx * t;
    const y = initialPosition.y + vy * t - 0.5 * GRAVITY * t * t;

    if (y < 0) {
      // Interpolar hasta y = 0 en el plano absoluto
      const prev = pts[pts.length - 1];
      const ratio = (prev.y - initialPosition.y) / ((prev.y - initialPosition.y) - (y - initialPosition.y));
      pts.push({
        x: prev.x + ratio * (x - prev.x),
        y: initialPosition.y
      });
      break;
    }

    pts.push({ x, y });
  }

  // Ajuste final exacto si no hubo maxTime
  if (maxTime === undefined && pts.length > 0) {
    const last = pts[pts.length - 1];
    last.x = initialPosition.x + calculateRange(v0, angle);
    last.y = initialPosition.y;
  }

  return pts;
}


/**
 * Genera trayectoria de caída libre desde h0 hasta y=0
 */
export function calculateFreeFall(
  data: FreeFallData
): Point[] {
  const {
    initialPosition,
    initialHorizontalSpeed: vx = 0,
    timeStep = 0.1
  } = data;

  // Definir posición inicial absoluta
  const x0 = initialPosition?.x ?? 0;
  const y0 = initialPosition?.y ?? 0;

  if (y0 <= 0) {
    return [{ x: x0, y: 0 }];
  }

  const tMax = Math.sqrt((2 * y0) / GRAVITY);
  const steps = Math.ceil(tMax / timeStep);
  const pts: Point[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i * timeStep;
    const x = x0 + vx * t;
    const y = y0 - 0.5 * GRAVITY * t * t;

    if (y < 0) {
      const prev = pts[pts.length - 1];
      const ratio = prev.y / (prev.y - y);
      pts.push({
        x: prev.x + ratio * (x - prev.x),
        y: 0
      });
      break;
    }

    pts.push({ x, y });
  }

  return pts;
}

/**
 * Resultado de intercepción
 */
export interface InterceptionResult {
  intercepted: boolean;
  point?: Point;
  timeParabolic?: number;
  timeFreefall?: number;

  minDistance: number;
  timeParabolicAtMin: number;
  timeFreefallAtMin: number;
  pointParabolicAtMin: Point;
  pointFreefallAtMin: Point;
}

/**
 * Detecta si dos trayectorias se interceptan
 */
export function detectInterception(
  parabolicData: TrajectoryData,
  freeData: FreeFallData,
  tolerance = 0.1
): InterceptionResult {
  const P = calculateTrajectory(parabolicData);
  const F = calculateFreeFall(freeData);
  const dtP = parabolicData.timeStep ?? 0.1;
  const dtF = freeData.timeStep ?? 0.1;
  const tol2 = tolerance * tolerance;

  // --- NUEVAS VARIABLES PARA MÍNIMA DISTANCIA ---
  let bestDist2 = Infinity;         // mejor distancia al cuadrado hallada
  let bestI = 0, bestJ = 0;         // índices donde ocurrió
  // ---------------------------------------------

  let i = 0, j = 0;
  while (i < P.length && j < F.length) {
    const p = P[i];
    const f = F[j];
    const dx = p.x - f.x;
    const dy = p.y - f.y;
    const d2 = dx * dx + dy * dy;

    // Actualizar mínima distancia encontrada
    if (d2 < bestDist2) {
      bestDist2 = d2;
      bestI = i;
      bestJ = j;
    }

    // Si están dentro de la tolerancia, retorno inmediato
    if (d2 <= tol2) {
      const midPoint = { x: (p.x + f.x) / 2, y: (p.y + f.y) / 2 };
      return {
        intercepted: true,
        point: midPoint,
        timeParabolic: i * dtP,
        timeFreefall: j * dtF,
        minDistance: 0,
        timeParabolicAtMin: i * dtP,
        timeFreefallAtMin: j * dtF,
        pointParabolicAtMin: p,
        pointFreefallAtMin: f
      };
    }

    // avanzar punteros según el próximo tiempo
    if ((i + 1) * dtP < (j + 1) * dtF) {
      i++;
    } else {
      j++;
    }
  }

  // (Opcional) chequeo de intersecciones de segmentos...
  // — aquí podrías hacer un bucle similar y actualizar bestDist2 si quieres
  //   manejar cruces entre pasos. Para simplicidad lo omitimos.

  // AL FINAL, si NO hubo intercepción exacta, construyo el resultado:
  const minDistance = Math.sqrt(bestDist2);
  return {
    intercepted: false,
    minDistance,
    timeParabolicAtMin: bestI * dtP,
    timeFreefallAtMin: bestJ * dtF,
    pointParabolicAtMin: P[bestI],
    pointFreefallAtMin: F[bestJ]
  };
}
