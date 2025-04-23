/**
 * Constante de aceleración debida a la gravedad (m/s²)
 */
export const GRAVITY = 9.81;

/**
 * Punto en el espacio 2D
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Datos necesarios para calcular la trayectoria
 */
export interface TrajectoryData {
  initialSpeed: number;  // Velocidad inicial (m/s)
  angle: number;         // Ángulo en grados
  timeStep?: number;     // Paso de tiempo en segundos (opcional)
  maxTime?: number;      // Tiempo máximo de simulación en segundos (opcional)
}

/**
 * Calcula el alcance máximo horizontal de la trayectoria
 */
export function calculateRange(initialSpeed: number, angleDegrees: number): number {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return (initialSpeed * initialSpeed * Math.sin(2 * angleRadians)) / GRAVITY;
}

/**
 * Calcula la altura máxima de la trayectoria
 */
export function calculateMaxHeight(initialSpeed: number, angleDegrees: number): number {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return (initialSpeed * initialSpeed * Math.sin(angleRadians) * Math.sin(angleRadians)) / (2 * GRAVITY);
}

/**
 * Calcula el tiempo de vuelo total
 */
export function calculateFlightTime(initialSpeed: number, angleDegrees: number): number {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return (2 * initialSpeed * Math.sin(angleRadians)) / GRAVITY;
}

/**
 * Calcula la posición en un momento dado usando las ecuaciones del movimiento parabólico
 */
export function calculatePosition(
  initialSpeed: number,
  angleDegrees: number,
  time: number
): Point {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  
  // Componentes de la velocidad inicial
  const vx = initialSpeed * Math.cos(angleRadians);
  const vy = initialSpeed * Math.sin(angleRadians);
  
  // Ecuaciones de posición
  const x = vx * time;
  const y = vy * time - 0.5 * GRAVITY * time * time;
  
  return { x, y };
}

/**
 * Genera una serie de puntos que representan la trayectoria completa
 */
export function calculateTrajectory(data: TrajectoryData): Point[] {
  const { initialSpeed, angle, timeStep = 0.1, maxTime } = data;
  
  // Si no se proporciona un tiempo máximo, calcularlo basado en el tiempo de vuelo
  const flightTime = calculateFlightTime(initialSpeed, angle);
  const actualMaxTime = maxTime || flightTime;
  
  const points: Point[] = [];
  let time = 0;
  
  // Calcular puntos en intervalos regulares
  while (time <= actualMaxTime) {
    const point = calculatePosition(initialSpeed, angle, time);
    
    // Si la posición y ya es negativa (debajo del suelo), ajustar el último punto para que esté en y=0
    // y terminar el cálculo
    if (point.y < 0) {
      // Interpolar para encontrar el punto exacto donde y=0
      const prevPoint = points[points.length - 1];
      const ratio = prevPoint.y / (prevPoint.y - point.y);
      const finalX = prevPoint.x + ratio * (point.x - prevPoint.x);
      
      points.push({ x: finalX, y: 0 });
      break;
    }
    
    points.push(point);
    time += timeStep;
  }
  
  return points;
} 