import { useEffect, useRef, useState } from 'react';
import { calculateTrajectory, calculateFlightTime, calculateEnemyMissileTrajectory, Point } from '../lib/parabolicMotion';

interface TrajectoryCanvasProps {
  initialSpeed: number;
  angle: number;
  width?: number;
  height?: number;
  isInitialState?: boolean;
  showEnemyMissile?: boolean;
}

const TrajectoryCanvas: React.FC<TrajectoryCanvasProps> = ({
  initialSpeed,
  angle,
  width = 600,
  height = 400,
  isInitialState = false,
  showEnemyMissile = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [trajectory, setTrajectory] = useState<Point[]>([]);
  const [enemyTrajectory, setEnemyTrajectory] = useState<Point[]>([]);

  // Efecto para calcular la trayectoria cuando cambian los parámetros
  useEffect(() => {
    // Detener cualquier animación en curso
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Resetear el progreso de la animación
    setAnimationProgress(0);

    // Si estamos en estado inicial o los valores no son válidos, no calcular trayectoria
    if (isInitialState || initialSpeed <= 0) {
      setTrajectory([]);
      setEnemyTrajectory([]);
      return;
    }

    // Calcular la trayectoria completa
    const newTrajectory = calculateTrajectory({
      initialSpeed,
      angle,
      timeStep: 0.05
    });

    setTrajectory(newTrajectory);

    // Calcular la trayectoria del misil enemigo
    if (showEnemyMissile && newTrajectory.length > 0) {
      // Definir la posición inicial del misil enemigo (al otro lado del campo)
      const finalX = newTrajectory[newTrajectory.length - 1].x;
      const enemyStartX = finalX * 0.8; // Posición X algo antes del alcance máximo
      const enemyStartY = 300; // Altura inicial del misil enemigo
      
      const enemyTrajectory = calculateEnemyMissileTrajectory({
        startX: enemyStartX,
        startY: enemyStartY,
        initialSpeedX: -5, // Velocidad negativa para moverse hacia la izquierda
        initialSpeedY: 0,  // Comienza con caída vertical
        timeStep: 0.05
      });
      
      setEnemyTrajectory(enemyTrajectory);
    } else {
      setEnemyTrajectory([]);
    }

    // Iniciar nueva animación
    if (newTrajectory.length > 0) {
      startAnimation();
    }

    // Función de limpieza para cancelar animación al desmontar o actualizar
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [initialSpeed, angle, isInitialState, showEnemyMissile]);

  // Función para iniciar la animación
  const startAnimation = () => {
    const startTime = performance.now();
    // Estimamos el tiempo total de vuelo para la duración de la animación
    const flightTime = calculateFlightTime(initialSpeed, angle);
    // Duración de la animación en milisegundos (usamos el tiempo de vuelo real pero con un mínimo y máximo)
    const animationDuration = Math.min(Math.max(flightTime * 1000, 1000), 5000);

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      
      setAnimationProgress(progress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Efecto para dibujar en el canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Si estamos en el estado inicial, solo mostrar instrucciones
    if (isInitialState) {
      drawGround(ctx, canvas);
      drawInstructions(ctx, canvas);
      return;
    }

    // Si no hay trayectoria para animar
    if (trajectory.length === 0) {
      drawGround(ctx, canvas);
      return;
    }

    // Calcular hasta qué punto de la trayectoria mostrar basado en el progreso
    const pointsToShow = Math.max(1, Math.floor(trajectory.length * animationProgress));

    // Solo usar los puntos hasta el progreso actual
    const visibleTrajectory = trajectory.slice(0, pointsToShow);

    // Encontrar valores máximos para escalar (usar la trayectoria completa para mantener la escala consistente)
    const allPoints = [...trajectory];
    
    // Incluir los puntos del misil enemigo en el cálculo de la escala
    if (enemyTrajectory.length > 0) {
      allPoints.push(...enemyTrajectory);
    }
    
    const maxX = Math.max(...allPoints.map(p => p.x)) * 1.1;
    const maxY = Math.max(...allPoints.map(p => p.y)) * 1.2;

    // Función para convertir coordenadas del mundo real a coordenadas del canvas
    const scaleX = (x: number) => (x / maxX) * canvas.width;
    const scaleY = (y: number) => canvas.height - (y / maxY) * canvas.height;

    // Dibujar el suelo
    drawGround(ctx, canvas, scaleY);

    // Dibujar el cañón
    const cannonLength = 30;
    const cannonWidth = 10;
    const angleRad = (angle * Math.PI) / 180;
    
    // Base del cañón
    ctx.beginPath();
    ctx.arc(20, scaleY(0), 15, 0, Math.PI * 2);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();
    
    // Cañón (tubo)
    ctx.save();
    ctx.translate(20, scaleY(0));
    ctx.rotate(-angleRad);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
    ctx.restore();

    // Si no hay puntos para mostrar aún, solo mostrar el cañón
    if (visibleTrajectory.length <= 1) {
      return;
    }

    // Dibujar la trayectoria hasta el punto actual
    ctx.beginPath();
    ctx.moveTo(scaleX(visibleTrajectory[0].x), scaleY(visibleTrajectory[0].y));
    
    for (let i = 1; i < visibleTrajectory.length; i++) {
      ctx.lineTo(scaleX(visibleTrajectory[i].x), scaleY(visibleTrajectory[i].y));
    }
    
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar la posición actual del proyectil
    const currentPoint = visibleTrajectory[visibleTrajectory.length - 1];
    drawPoint(ctx, scaleX(currentPoint.x), scaleY(currentPoint.y), '#e74c3c', 8);

    // Dibujar el misil enemigo si está activado y hay progreso en la animación
    if (showEnemyMissile && enemyTrajectory.length > 0 && animationProgress > 0) {
      // Determinar hasta dónde mostrar la trayectoria del misil enemigo
      const enemyPointsToShow = Math.max(1, Math.floor(enemyTrajectory.length * animationProgress));
      const visibleEnemyTrajectory = enemyTrajectory.slice(0, enemyPointsToShow);
      
      // Dibujar la trayectoria del misil enemigo
      if (visibleEnemyTrajectory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(scaleX(visibleEnemyTrajectory[0].x), scaleY(visibleEnemyTrajectory[0].y));
        
        for (let i = 1; i < visibleEnemyTrajectory.length; i++) {
          ctx.lineTo(scaleX(visibleEnemyTrajectory[i].x), scaleY(visibleEnemyTrajectory[i].y));
        }
        
        ctx.strokeStyle = '#2980b9'; // Azul para el misil enemigo
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Dibujar el misil enemigo actual
      if (visibleEnemyTrajectory.length > 0) {
        const currentEnemyPoint = visibleEnemyTrajectory[visibleEnemyTrajectory.length - 1];
        
        // Dibujar el misil enemigo (un triángulo)
        ctx.beginPath();
        const missileX = scaleX(currentEnemyPoint.x);
        const missileY = scaleY(currentEnemyPoint.y);
        const missileSize = 10;
        
        ctx.moveTo(missileX, missileY - missileSize);
        ctx.lineTo(missileX + missileSize, missileY + missileSize);
        ctx.lineTo(missileX - missileSize, missileY + missileSize);
        ctx.closePath();
        
        ctx.fillStyle = '#2980b9';
        ctx.fill();
      }
    }

    // Si la animación ha terminado, mostrar los puntos clave y la información
    if (animationProgress === 1) {
      // Punto más alto
      const highestPoint = trajectory.reduce((max, point) => 
        point.y > max.y ? point : max, trajectory[0]);
      drawPoint(ctx, scaleX(highestPoint.x), scaleY(highestPoint.y), '#f39c12');
      
      // Punto final
      const lastPoint = trajectory[trajectory.length - 1];
      drawPoint(ctx, scaleX(lastPoint.x), scaleY(lastPoint.y), '#3498db');

      // Mostrar información
      const rangeText = `Alcance: ${lastPoint.x.toFixed(2)} m`;
      const heightText = `Altura máxima: ${highestPoint.y.toFixed(2)} m`;
      
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(rangeText, 20, 30);
      ctx.fillText(heightText, 20, 50);
    }
    
  }, [trajectory, enemyTrajectory, animationProgress, angle, isInitialState, showEnemyMissile]);

  // Función auxiliar para dibujar el suelo
  function drawGround(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scaleY?: (y: number) => number) {
    ctx.beginPath();
    
    // Si tenemos una función de escala, usarla; si no, dibujar al fondo del canvas
    const groundY = scaleY ? scaleY(0) : canvas.height - 30;
    
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Función para mostrar instrucciones iniciales
  function drawInstructions(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.font = '18px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('Completa el formulario y presiona "Calcular"', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('para visualizar la trayectoria parabólica', canvas.width / 2, canvas.height / 2 + 10);
    
    // Dibujar un cañón base
    ctx.beginPath();
    ctx.arc(20, canvas.height - 30, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();
    
    // Cañón (tubo) en posición predeterminada
    ctx.save();
    ctx.translate(20, canvas.height - 30);
    ctx.rotate(-Math.PI / 4); // 45 grados
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, -5, 30, 10);
    ctx.restore();
  }

  // Función auxiliar para dibujar puntos de referencia
  function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 5) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}
      />
      {!isInitialState && animationProgress < 1 && (
        <button 
          className="replay-btn" 
          onClick={startAnimation}
          style={{ display: 'none' }} // Oculto por ahora, se puede activar si se quiere
        >
          Repetir animación
        </button>
      )}
    </div>
  );
};

export default TrajectoryCanvas; 