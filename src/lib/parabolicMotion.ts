/**
 * Constantes y utilidades para conversión y gravedad
 */
export const DEG_TO_RAD = Math.PI / 180;
export const GRAVITY = 9.80665;

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
  // 1) Primero intento detección ANALÍTICA:
  const {
    initialPosition: p0 = { x: 0, y: 0 },
    initialSpeed: v0,
    angle,
    timeStep: dtP = 0.1,
    maxTime
  } = parabolicData;
  const {
    initialPosition: f0 = { x: 0, y: 0 },
    initialHorizontalSpeed: vxF = 0,
    timeStep: dtF = 0.1
  } = freeData;

  const θ = toRadians(angle);
  const vsin = v0 * Math.sin(θ);

  if (vsin > 0) {
    // instante candidato
    const tAnalytic = (f0.y - p0.y) / vsin;
    const flightTime = maxTime ?? calculateFlightTime(v0, angle);

    if (tAnalytic >= 0 && tAnalytic <= flightTime) {
      // posiciones en tAnalytic
      const xP = p0.x + v0 * Math.cos(θ) * tAnalytic;
      const xF = f0.x + vxF * tAnalytic;

      if (Math.abs(xP - xF) <= tolerance) {
        // intercepción exacta
        const y = p0.y + v0 * Math.sin(θ) * tAnalytic - 0.5 * GRAVITY * tAnalytic * tAnalytic;
        const pt: Point = { x: (xP + xF) / 2, y };
        return {
          intercepted: true,
          point: pt,
          timeParabolic: tAnalytic,
          timeFreefall: tAnalytic,
          minDistance: 0,
          timeParabolicAtMin: tAnalytic,
          timeFreefallAtMin: tAnalytic,
          pointParabolicAtMin: pt,
          pointFreefallAtMin: pt
        };
      }
    }
  }

  // 2) Si no dio analítico, caigo al muestreo grosso solo para
  //    hallar la distancia mínima, SIN necesidad de bajarlo mucho:
  const P = calculateTrajectory(parabolicData);
  const F = calculateFreeFall(freeData);
  const tol2 = tolerance * tolerance;
  let bestDist2 = Infinity, bestI = 0, bestJ = 0;
  let i = 0, j = 0;
  while (i < P.length && j < F.length) {
    const dx = P[i].x - F[j].x, dy = P[i].y - F[j].y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist2) {
      bestDist2 = d2; bestI = i; bestJ = j;
    }
    if (d2 <= tol2) {
      const mid: Point = { x: (P[i].x + F[j].x)/2, y: (P[i].y + F[j].y)/2 };
      return {
        intercepted: true,
        point: mid,
        timeParabolic: i * dtP,
        timeFreefall: j * dtF,
        minDistance: 0,
        timeParabolicAtMin: i * dtP,
        timeFreefallAtMin: j * dtF,
        pointParabolicAtMin: P[i],
        pointFreefallAtMin: F[j]
      };
    }
    if ((i + 1) * dtP < (j + 1) * dtF) {
      i++;
    } else {
      j++;
    }
  }

  // 3) retorno caso “no intercepta”
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

/**
 * Parámetros de lanzamiento necesarios para interceptar una caída libre
 */
export interface LaunchParams {
  angle: number;  // en grados
  speed: number;  // en m/s
}

/**
 * Calcula el ángulo y velocidad inicial para que una parábola
 * desde (0,0) intercepten una caída libre que parte de fallOrigin
 * a la altura interceptHeight.
 *
 *   x_free(t) = x0
 *   y_free(t) = y0 - ½ g t² = interceptHeight
 *
 *   x_par(t) = v0·cosθ·t = x0
 *   y_par(t) = v0·sinθ·t - ½ g t² = interceptHeight
 *
 * Despejo t de la caída libre, luego θ = atan2(y0, x0)
 * y v0 = hypot(x0, y0) / t
 *
 * @param fallOrigin  Punto inicial de la caída libre
 * @param interceptHeight  Altura (>=0) a la cual queremos interceptar
 * @throws Error si no es posible la intercepción (e.g. interceptHeight ≥ fallOrigin.y)
 */
export function calculateInterceptionLaunch(
  fallOrigin: Point,
  interceptHeight: number
): LaunchParams {
  const { x: x0, y: y0 } = fallOrigin;

  // Validaciones básicas
  if (x0 <= 0) {
    throw new Error('El punto de origen debe tener coordenada x > 0.');
  }
  if (interceptHeight < 0) {
    throw new Error('La altura de intercepción debe ser >= 0.');
  }
  if (interceptHeight >= y0) {
    throw new Error(
      `La altura de intercepción (${interceptHeight}) debe ser menor que la altura inicial (${y0}).`
    );
  }

  // Tiempo en que la partícula en caída libre alcanza la altura deseada:
  // y0 - ½ g t² = interceptHeight  =>  t = sqrt(2*(y0 - interceptHeight)/g)
  const t = Math.sqrt((2 * (y0 - interceptHeight)) / GRAVITY);

  // Ángulo de lanzamiento (rad -> deg): θ = atan2(y0, x0)
  const θrad = Math.atan2(y0, x0);
  const θdeg = θrad * (180 / Math.PI);

  // Velocidad necesaria: r = sqrt(x0² + y0²), luego v0 = r / t
  const distance = Math.hypot(x0, y0);
  const v0 = distance / t;

  return {
    angle: θdeg,
    speed: v0,
  };
}
