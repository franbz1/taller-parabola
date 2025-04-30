import React, { useEffect, useRef } from 'react';
import { FormData, TargetData } from '../InputForm';
import { drawCoordinateSystem, drawInstructions } from './CoordinateSystem';
import { drawDefensorBase } from './defnesor';
import { drawCity } from './drawCity';
import { drawExplosion } from './DrawExplosion';

interface SimulationCanvasProps {
  width: number;
  height: number;
  targetParams: TargetData | null;
  formParams: FormData | null;
  showTrajectory: boolean;
  enemyTrajectory: { x: number, y: number }[];
  trajectoryPoints: { x: number, y: number }[];
  enemyMissileProgress: number;
  defensorMissileProgress: number;
  showExplosion: boolean;
  explosionSize: number;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  width,
  height,
  targetParams,
  formParams,
  showTrajectory,
  enemyTrajectory,
  trajectoryPoints,
  enemyMissileProgress,
  defensorMissileProgress,
  showExplosion,
  explosionSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Función para dibujar un misil enemigo
  const drawEnemyMissile = (
    ctx: CanvasRenderingContext2D,
    positionX: number, 
    positionY: number,
    scaleX: (x: number) => number, 
    scaleY: (y: number) => number
  ) => {
    // Si tenemos trayectoria calculada y el botón simular fue presionado
    if (enemyTrajectory.length > 0 && showTrajectory) {
      // Determinar hasta qué punto de la trayectoria mostrar basado en el progreso
      const pointIndex = Math.min(
        Math.floor(enemyTrajectory.length * enemyMissileProgress),
        enemyTrajectory.length - 1
      );

      if (pointIndex >= 0) {
        const currentPoint = enemyTrajectory[pointIndex];

        // Actualizar posiciones con las de la trayectoria calculada
        positionX = currentPoint.x;
        positionY = currentPoint.y;
      }
    }

    const x = scaleX(positionX);
    const y = scaleY(positionY);

    // Si hay que mostrar la explosión, dibujarla en lugar del misil
    if (showExplosion && showTrajectory) {
      drawExplosion(ctx, x, y, explosionSize);
      return; // No dibujar el misil si hay explosión
    }

    // ===== MISIL ENEMIGO QUE APUNTA DIRECTAMENTE HACIA ABAJO =====

    // Cuerpo principal del misil (vertical)
    ctx.beginPath();
    ctx.rect(x - 2, y - 12, 4, 24);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    // Punta del misil (apuntando hacia abajo)
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 12);
    ctx.lineTo(x, y + 18);
    ctx.lineTo(x + 2, y + 12);
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    // Aletas superiores
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x + 6, y - 16);
    ctx.lineTo(x, y - 8);
    ctx.closePath();
    ctx.fillStyle = '#c0392b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x - 6, y - 16);
    ctx.lineTo(x, y - 8);
    ctx.closePath();
    ctx.fillStyle = '#c0392b';
    ctx.fill();

    // Estela del misil (fuego en la parte superior)
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 12);
    ctx.lineTo(x, y - 22);
    ctx.lineTo(x + 4, y - 12);
    ctx.closePath();
    ctx.fillStyle = '#f39c12';
    ctx.fill();

    // Si está en modo simulación, dibujar la trayectoria del misil
    if (showTrajectory && enemyTrajectory.length > 0) {
      // Dibujar la trayectoria del misil enemigo hasta el punto actual
      const pointsToShow = Math.min(Math.floor(enemyTrajectory.length * enemyMissileProgress) + 1, enemyTrajectory.length);

      if (pointsToShow > 1) {
        ctx.beginPath();
        ctx.moveTo(scaleX(enemyTrajectory[0].x), scaleY(enemyTrajectory[0].y));

        for (let i = 1; i < pointsToShow; i++) {
          ctx.lineTo(scaleX(enemyTrajectory[i].x), scaleY(enemyTrajectory[i].y));
        }

        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Si no está mostrada toda la trayectoria, mostrar línea punteada para el resto
        if (pointsToShow < enemyTrajectory.length) {
          ctx.beginPath();
          ctx.moveTo(scaleX(enemyTrajectory[pointsToShow - 1].x), scaleY(enemyTrajectory[pointsToShow - 1].y));

          for (let i = pointsToShow; i < enemyTrajectory.length; i++) {
            ctx.lineTo(scaleX(enemyTrajectory[i].x), scaleY(enemyTrajectory[i].y));
          }

          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]); // Línea punteada
          ctx.stroke();
          ctx.setLineDash([]); // Restaurar línea normal
        }
      }
    }
  };

  // Función para dibujar una trayectoria parabólica simple
  const drawSimpleTrajectory = (
    ctx: CanvasRenderingContext2D,
    params: FormData,
    scaleX: (x: number) => number, 
    scaleY: (y: number) => number,
    maxX: number, 
    maxY: number
  ) => {
    const { defensorAngle, defensorInitialSpeed, targetDistance, enemyHeight } = params;

    // Siempre colocar el defensor en el origen (0,0)
    const defensorPosition = 0;
    const defensorX = scaleX(0);
    const defensorY = scaleY(0);

    // Dibujar la base del lanzador
    ctx.beginPath();
    ctx.arc(defensorX, defensorY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();

    // Dibujar el cañón
    const cannonLength = 20;
    const angleRad = (defensorAngle * Math.PI) / 180;

    ctx.save();
    ctx.translate(defensorX, defensorY);
    ctx.rotate(-angleRad);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, -3, cannonLength, 6);
    ctx.restore();

    // Usando ecuaciones de movimiento parabólico para generar puntos
    const g = 9.8; // Gravedad
    const v0 = defensorInitialSpeed;
    const theta = defensorAngle * Math.PI / 180;

    // Componentes de la velocidad inicial
    const v0x = v0 * Math.cos(theta);
    const v0y = v0 * Math.sin(theta);

    // Tiempo de vuelo
    const totalTime = (2 * v0y) / g;

    // Dibujar la trayectoria parabólica ANIMADA
    const currentPoints = trajectoryPoints.slice(0, Math.ceil(trajectoryPoints.length * defensorMissileProgress));

    if (currentPoints.length > 1) {
      // Dibujamos la curva con los puntos actuales
      ctx.beginPath();
      ctx.moveTo(scaleX(currentPoints[0].x), scaleY(currentPoints[0].y));

      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(scaleX(currentPoints[i].x), scaleY(currentPoints[i].y));
      }

      ctx.strokeStyle = '#27ae60'; // Verde para el misil defensor
      ctx.lineWidth = 3;
      ctx.stroke();

      // Dibujar el proyectil en la posición actual
      if (currentPoints.length > 0) {
        const currentPosition = currentPoints[currentPoints.length - 1];
        ctx.beginPath();
        ctx.arc(scaleX(currentPosition.x), scaleY(currentPosition.y), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#2ecc71';
        ctx.fill();
      }
    }

    // Solo mostrar información completa cuando la animación termina
    if (defensorMissileProgress >= 0.99) {
      // Punto de altura máxima
      const tMax = v0y / g;
      const xMax = defensorPosition + v0x * tMax;
      const yMax = v0y * tMax - 0.5 * g * tMax * tMax;

      // Verificar si el punto máximo está dentro del rango visible
      if (xMax <= maxX && yMax <= maxY) {
        // Dibujar punto de altura máxima
        ctx.beginPath();
        ctx.arc(scaleX(xMax), scaleY(yMax), 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f39c12';
        ctx.fill();

        // Etiqueta del punto de altura máxima
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(`(${xMax.toFixed(1)}, ${yMax.toFixed(1)})`, scaleX(xMax), scaleY(yMax) - 10);
      }

      // Punto de impacto (cuando y=0)
      const tImpact = totalTime;
      const xImpact = defensorPosition + v0x * tImpact;

      // Verificar si el punto de impacto está dentro del rango visible
      if (xImpact <= maxX) {
        // Dibujar punto de impacto
        ctx.beginPath();
        ctx.arc(scaleX(xImpact), scaleY(0), 5, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();

        // Etiqueta del punto de impacto
        ctx.fillText(`(${xImpact.toFixed(1)}, 0)`, scaleX(xImpact), scaleY(0) - 10);
      }

      // Agregar información de la trayectoria
      const padding = 40;
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(`Alcance: ${xImpact.toFixed(2)} m`, padding + 20, padding + 20);
      ctx.fillText(`Altura máxima: ${yMax.toFixed(2)} m`, padding + 20, padding + 45);
      ctx.fillText(`Tiempo de vuelo: ${totalTime.toFixed(2)} s`, padding + 20, padding + 70);

      // Verificar si el misil defensor puede alcanzar al misil enemigo
      const targetX = targetDistance;
      const targetY = enemyHeight;

      // Calcular la posición del misil defensor en el momento en que x = targetX
      // Resolviendo para t: targetX = defensorPosition + v0x * t
      const tAtTargetX = (targetX - defensorPosition) / v0x;

      // Si el tiempo es negativo o mayor que el tiempo de vuelo, no puede alcanzarlo
      if (tAtTargetX >= 0 && tAtTargetX <= totalTime) {
        // Calcular la altura del misil defensor en ese momento
        const yAtTargetX = v0y * tAtTargetX - 0.5 * g * tAtTargetX * tAtTargetX;

        // Dibujar línea de intercepción
        if (Math.abs(yAtTargetX - targetY) < 5) { // Si está a menos de 5 metros
          ctx.beginPath();
          ctx.moveTo(scaleX(targetX), scaleY(targetY));
          ctx.lineTo(scaleX(targetX), scaleY(yAtTargetX));
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Dibujar punto de intercepción
          ctx.beginPath();
          ctx.arc(scaleX(targetX), scaleY(yAtTargetX), 7, 0, Math.PI * 2);
          ctx.fillStyle = '#e74c3c';
          ctx.fill();

          // Mensaje de intercepción
          ctx.fillStyle = '#e74c3c';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('¡INTERCEPCIÓN!', scaleX(targetX), scaleY(yAtTargetX) - 20);

          ctx.font = '12px Arial';
          ctx.fillText(`t = ${tAtTargetX.toFixed(2)} s`, scaleX(targetX), scaleY(yAtTargetX) - 35);

          // Agregar mensaje a la información
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = '#e74c3c';
          ctx.textAlign = 'left';
          ctx.fillText('¡MISIL INTERCEPTADO!', padding + 20, padding + 95);
        } else {
          ctx.font = '14px Arial';
          ctx.fillStyle = '#c0392b';
          ctx.textAlign = 'left';
          ctx.fillText(`No se intercepta. Diferencia de altura: ${Math.abs(yAtTargetX - targetY).toFixed(2)} m`, padding + 20, padding + 95);
        }
      } else {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#c0392b';
        ctx.textAlign = 'left';
        ctx.fillText('No se intercepta. El misil no alcanza la distancia del objetivo.', padding + 20, padding + 95);
      }
    }
  };

  // Efecto para dibujar el plano cuando cambian los parámetros
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar el plano (ejes X e Y) y obtener funciones de escalado
    const { scaleX, scaleY, maxX, maxY } = drawCoordinateSystem(ctx, canvas, targetParams);
    
    // Si tenemos los parámetros del objetivo, mostrarlos
    if (targetParams) {
      // Dibujar la ciudad en la posición especificada por el usuario
      drawCity(ctx, targetParams.targetDistance, scaleX, scaleY, showExplosion, showTrajectory);
      
      // Dibujar el misil enemigo sobre la ciudad a la altura especificada
      drawEnemyMissile(
        ctx, 
        targetParams.targetDistance, 
        targetParams.enemyHeight, 
        scaleX, 
        scaleY
      );
      
      // Dibujar la base del defensor
      drawDefensorBase(ctx, canvas, targetParams);
      
      // Si además tenemos la configuración del defensor y debemos mostrar la trayectoria
      if (formParams && showTrajectory) {
        // Dibujar la trayectoria del misil defensor
        drawSimpleTrajectory(ctx, formParams, scaleX, scaleY, maxX, maxY);
      }
    } else {
      // Si no hay parámetros, mostrar mensaje de instrucciones
      drawInstructions(ctx, canvas);
    }
  }, [
    targetParams, 
    formParams, 
    showTrajectory, 
    enemyMissileProgress, 
    defensorMissileProgress,
    enemyTrajectory,
    trajectoryPoints,
    showExplosion,
    explosionSize,
    width,
    height
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}
    />
  );
};

export default SimulationCanvas;
