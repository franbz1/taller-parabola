import { useState, useRef, useEffect } from 'react'
import './App.css'
import InputForm from './components/InputForm'
import { FormData, TargetData } from './components/InputForm'
import { calculateEnemyMissileTrajectory } from './lib/parabolicMotion'

function App() {
  // Estado completo del formulario
  const [formParams, setFormParams] = useState<FormData | null>(null);
  
  // Estado para la primera etapa (solo objetivo)
  const [targetParams, setTargetParams] = useState<TargetData | null>(null);
  
  // Estado para controlar si se debe dibujar la trayectoria
  const [showTrajectory, setShowTrajectory] = useState(false);
  
  // Estado para controlar la animación del misil enemigo
  const [enemyMissileProgress, setEnemyMissileProgress] = useState(0);
  const [enemyTrajectory, setEnemyTrajectory] = useState<{x: number, y: number}[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Manejador para la primera etapa: mostrar el objetivo
  const handleShowTarget = (data: TargetData) => {
    console.log('Datos del objetivo:', data);
    setTargetParams(data);
    setShowTrajectory(false); // Asegurarnos de no mostrar trayectoria aún
  };
  
  // Manejador para la segunda etapa: simular trayectoria
  const handleFormSubmit = (data: FormData) => {
    console.log('Datos completos:', data);
    setFormParams(data);
    setShowTrajectory(true); // Ahora sí mostrar la trayectoria
    
    // Iniciar la animación del misil enemigo
    if (targetParams) {
      // Calcular la trayectoria del misil enemigo
      const trajectory = calculateEnemyMissileTrajectory({
        startX: targetParams.targetDistance,
        startY: targetParams.enemyHeight, 
        initialSpeedX: 0, // Sin velocidad horizontal inicial
        initialSpeedY: 0, // Sin velocidad vertical inicial (comienza cayendo)
        timeStep: 0.05
      });
      
      setEnemyTrajectory(trajectory);
      setEnemyMissileProgress(0);
      startEnemyMissileAnimation();
    }
  };

  // Función para iniciar la animación del misil enemigo
  const startEnemyMissileAnimation = () => {
    // Detener cualquier animación previa
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const startTime = performance.now();
    // Duración de la animación en milisegundos (ajustar según necesidad)
    const animationDuration = 3000;
    
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      
      setEnemyMissileProgress(progress);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // Cancelar cualquier animación al desmontar
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Efecto para dibujar el plano cuando cambian los parámetros
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar el plano (ejes X e Y) y obtener funciones de escalado
    const { scaleX, scaleY, maxX, maxY } = drawCoordinateSystem(ctx, canvas);
    
    // Si tenemos los parámetros del objetivo, mostrarlos
    if (targetParams) {
      // Dibujar la ciudad en la posición especificada por el usuario
      drawCity(ctx, canvas, targetParams.targetDistance, scaleX, scaleY);
      
      // Dibujar el misil enemigo sobre la ciudad a la altura especificada
      drawEnemyMissile(ctx, canvas, targetParams.targetDistance, targetParams.enemyHeight, scaleX, scaleY);
      
      // Dibujar la base del defensor
      drawDefensorBase(ctx, canvas, targetParams.defensorPosition);
      
      // Si además tenemos la configuración del defensor y debemos mostrar la trayectoria
      if (formParams && showTrajectory) {
        // Dibujar la trayectoria del misil defensor
        drawSimpleTrajectory(ctx, canvas, formParams, scaleX, scaleY, maxX, maxY);
      }
    } else {
      // Si no hay parámetros, mostrar mensaje de instrucciones
      drawInstructions(ctx, canvas);
    }
  }, [targetParams, formParams, showTrajectory, enemyMissileProgress]);
  
  // Función para dibujar el sistema de coordenadas
  const drawCoordinateSystem = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const padding = 40;
    const axisColor = '#333';
    const gridColor = '#e0e0e0';
    
    // Calcular el espacio disponible para el gráfico
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Determinar los valores máximos para los ejes basados en los datos del usuario
    let maxX = 100; // Valor predeterminado
    let maxY = 100; // Valor predeterminado
    
    if (targetParams) {
      // Ajustar el eje X basado en la distancia a la ciudad
      maxX = Math.ceil(targetParams.targetDistance * 1.2); // 20% extra para margen
      
      // Ajustar el eje Y basado en la altura del misil enemigo
      maxY = Math.ceil(targetParams.enemyHeight * 1.5); // 50% extra para margen
      
      // Asegurar valores mínimos razonables
      maxX = Math.max(maxX, 50);
      maxY = Math.max(maxY, 50);
      
      // Ajustar escala para valores muy grandes
      // Para valores mayores a 1000, usar una escala diferente
      if (maxY > 1000) {
        // Redondear a múltiplos de 1000 para números más limpios cuando son grandes
        maxY = Math.ceil(maxY / 1000) * 1000;
      } else if (maxY > 100) {
        // Redondear a múltiplos de 100 para valores medianos
        maxY = Math.ceil(maxY / 100) * 100;
      } else {
        // Redondear a múltiplos de 10 para valores pequeños
        maxY = Math.ceil(maxY / 10) * 10;
      }
      
      // Lo mismo para el eje X
      if (maxX > 1000) {
        maxX = Math.ceil(maxX / 1000) * 1000;
      } else if (maxX > 100) {
        maxX = Math.ceil(maxX / 100) * 100;
      } else {
        maxX = Math.ceil(maxX / 10) * 10;
      }
    }
    
    // Decidir el espaciado de la cuadrícula - 10 divisiones
    const gridSpacingX = graphWidth / 10;
    const gridSpacingY = graphHeight / 10;
    
    // Dibujar cuadrícula
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    
    // Líneas verticales de la cuadrícula
    for (let i = 0; i <= 10; i++) {
      const x = padding + i * gridSpacingX;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }
    
    // Líneas horizontales de la cuadrícula
    for (let i = 0; i <= 10; i++) {
      const y = padding + i * gridSpacingY;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }
    
    // Dibujar ejes principales con línea más gruesa
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2;
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();
    
    // Flechas en los extremos de los ejes
    // Flecha eje X
    ctx.beginPath();
    ctx.moveTo(canvas.width - padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding - 10, canvas.height - padding - 5);
    ctx.lineTo(canvas.width - padding - 10, canvas.height - padding + 5);
    ctx.closePath();
    ctx.fillStyle = axisColor;
    ctx.fill();
    
    // Flecha eje Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding - 5, padding + 10);
    ctx.lineTo(padding + 5, padding + 10);
    ctx.closePath();
    ctx.fill();
    
    // Etiquetas de los ejes
    ctx.font = '14px Arial';
    ctx.fillStyle = axisColor;
    
    // Etiqueta para eje X (ahora al final del eje)
    ctx.textAlign = 'right';
    const xAxisLabel = maxX >= 1000 ? 'Distancia (km)' : 'Distancia (m)';
    ctx.fillText(xAxisLabel, canvas.width - padding - 1, canvas.height - padding + 38);
    
    // Etiqueta para eje Y (ahora arriba del eje)
    ctx.textAlign = 'center';
    const yAxisLabel = maxY >= 1000 ? 'Altura (km)' : 'Altura (m)';
    ctx.fillText(yAxisLabel, padding, padding - 20);
    
    // Función para formatear números grandes de forma legible
    const formatNumber = (num: number): string => {
      if (num >= 1000) {
        // Para números de 4 o más dígitos, mostrar en kilómetros
        return (num / 1000).toFixed(1);
      }
      return num.toString();
    };
    
    // Marcas y etiquetas en el eje X
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    const xStep = graphWidth / 10; // 10 divisiones
    const xValueStep = maxX / 10;
    
    for (let i = 0; i <= 10; i++) {
      const x = padding + i * xStep;
      const value = Math.round(i * xValueStep);
      
      // Marca
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - padding);
      ctx.lineTo(x, canvas.height - padding + 5);
      ctx.stroke();
      
      // Valor formateado para números grandes
      let displayValue = value;
      if (maxX >= 1000) {
        // Si la escala es en km, convertir el valor a km
        displayValue = value / 1000;
        ctx.fillText(displayValue.toFixed(1), x, canvas.height - padding + 20);
      } else {
        ctx.fillText(value.toString(), x, canvas.height - padding + 20);
      }
    }
    
    // Coordenadas y etiquetas en el eje Y
    ctx.textAlign = 'right';
    const yStep = graphHeight / 10; // 10 divisiones
    const yValueStep = maxY / 10;
    
    for (let i = 0; i <= 10; i++) {
      const y = canvas.height - padding - i * yStep;
      const value = Math.round(i * yValueStep);
      
      // Marca
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.stroke();
      
      // Valor formateado para números grandes
      let displayValue = value;
      if (maxY >= 1000) {
        // Si la escala es en km, convertir el valor a km
        displayValue = value / 1000;
        ctx.fillText(displayValue.toFixed(1), padding - 10, y + 4);
      } else {
        ctx.fillText(value.toString(), padding - 10, y + 4);
      }
    }
    
    // Etiqueta de origen (0,0)
    ctx.textAlign = 'right';
    ctx.fillText('0', padding - 10, canvas.height - padding + 4);
    
    // Devolver las funciones de escalado para que otras funciones puedan usarlas
    return {
      scaleX: (x: number) => padding + (x / maxX) * graphWidth,
      scaleY: (y: number) => canvas.height - padding - (y / maxY) * graphHeight,
      maxX,
      maxY
    };
  };
  
  // Función para dibujar sólo la base del defensor
  const drawDefensorBase = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, defensorPosition: number) => {
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Determinar los valores máximos para los ejes basados en los datos del usuario
    let maxX = 100;
    let maxY = 100;
    
    if (targetParams) {
      maxX = Math.ceil(targetParams.targetDistance * 1.2);
      maxY = Math.ceil(targetParams.enemyHeight * 1.5);
      
      // Ajustar escala para valores muy grandes
      if (maxY > 1000) {
        maxY = Math.ceil(maxY / 1000) * 1000;
      } else if (maxY > 100) {
        maxY = Math.ceil(maxY / 100) * 100;
      } else {
        maxY = Math.ceil(maxY / 10) * 10;
      }
      
      if (maxX > 1000) {
        maxX = Math.ceil(maxX / 1000) * 1000;
      } else if (maxX > 100) {
        maxX = Math.ceil(maxX / 100) * 100;
      } else {
        maxX = Math.ceil(maxX / 10) * 10;
      }
      
      maxX = Math.max(maxX, 50);
      maxY = Math.max(maxY, 50);
    }
    
    const scaleX = (x: number) => padding + (x / maxX) * graphWidth;
    const scaleY = (y: number) => canvas.height - padding - (y / maxY) * graphHeight;
    
    // Siempre colocar el defensor en el origen (0,0)
    const defensorX = scaleX(0);
    const defensorY = scaleY(0);
    
    // Dibujar la base del lanzador
    ctx.beginPath();
    ctx.arc(defensorX, defensorY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();
    
    // Cañón en posición horizontal (indicando que aún no se ha configurado)
    ctx.save();
    ctx.translate(defensorX, defensorY);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, -3, 20, 6);
    ctx.restore();
    
    // Mensaje para indicar el siguiente paso
    ctx.font = '14px Arial';
    ctx.fillStyle = '#e74c3c';
    ctx.textAlign = 'center';
    ctx.fillText('Ahora configure la velocidad y ángulo del misil defensor', canvas.width / 2, 25);
  };
  
  // Función para mostrar instrucciones cuando no hay datos
  const drawInstructions = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('Complete el formulario con la distancia y altura', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText('y presione "Mostrar en el plano"', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('Ingrese la distancia de la ciudad y la altura del misil enemigo', canvas.width / 2, canvas.height / 2 + 60);
  };
  
  // Función para dibujar una ciudad simple
  const drawCity = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, positionX: number, 
                    scaleX: (x: number) => number, scaleY: (y: number) => number) => {
    const x = scaleX(positionX);
    const y = scaleY(0);
    
    // Dibujar edificios
    const cityWidth = 30;
    const cityX = x - cityWidth/2;
    
    // Edificio 1 (alto)
    ctx.beginPath();
    ctx.rect(cityX, y - 25, 10, 25);
    ctx.fillStyle = '#34495e';
    ctx.fill();
    
    // Edificio 2 (mediano)
    ctx.beginPath();
    ctx.rect(cityX + 11, y - 18, 8, 18);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    
    // Edificio 3 (pequeño)
    ctx.beginPath();
    ctx.rect(cityX + 20, y - 15, 10, 15);
    ctx.fillStyle = '#34495e';
    ctx.fill();
    
    // Ventanas (edificio 1)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.rect(cityX + 2 + j * 4, y - 23 + i * 7, 2, 3);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
      }
    }
    
    // Ventanas (edificio 2)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 1; j++) {
        ctx.beginPath();
        ctx.rect(cityX + 13 + j * 3, y - 16 + i * 7, 2, 3);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
      }
    }
    
    // Ventanas (edificio 3)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        ctx.rect(cityX + 22 + j * 4, y - 13 + i * 6, 2, 3);
        ctx.fillStyle = '#f1c40f';
        ctx.fill();
      }
    }
    
  };
  
  // Función para dibujar un misil enemigo
  const drawEnemyMissile = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, 
                          positionX: number, positionY: number,
                          scaleX: (x: number) => number, scaleY: (y: number) => number) => {
    
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
    
    // ===== MISIL ENEMIGO QUE APUNTA DIRECTAMENTE HACIA ABAJO =====
    
    // Cuerpo principal del misil (vertical)
    ctx.beginPath();
    ctx.rect(x - 2, y - 12, 4, 24);
    ctx.fillStyle = '#c0392b';
    ctx.fill();
    
    // Punta del misil (apuntando hacia abajo)
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 12);
    ctx.lineTo(x + 2, y + 12);
    ctx.lineTo(x, y + 18);
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    
    // Aletas superiores
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x + 6, y - 16);
    ctx.lineTo(x + 6, y - 6);
    ctx.closePath();
    ctx.fillStyle = '#c0392b';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x - 6, y - 16);
    ctx.lineTo(x - 6, y - 6);
    ctx.closePath();
    ctx.fillStyle = '#c0392b';
    ctx.fill();
    
    // Estela del misil (fuego en la parte superior)
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 12);
    ctx.lineTo(x - 6, y - 20);
    ctx.lineTo(x, y - 16);
    ctx.lineTo(x + 6, y - 20);
    ctx.lineTo(x + 4, y - 12);
    ctx.closePath();
    ctx.fillStyle = '#f39c12';
    ctx.fill();
    
    // Si está en modo simulación, dibujar la trayectoria del misil
    if (showTrajectory && enemyTrajectory.length > 0) {
      // Dibujar la trayectoria del misil enemigo hasta el punto actual
      const pointsToShow = Math.max(1, Math.floor(enemyTrajectory.length * enemyMissileProgress));
      
      if (pointsToShow > 1) {
        ctx.beginPath();
        ctx.moveTo(scaleX(enemyTrajectory[0].x), scaleY(enemyTrajectory[0].y));
        
        for (let i = 1; i < pointsToShow; i++) {
          ctx.lineTo(scaleX(enemyTrajectory[i].x), scaleY(enemyTrajectory[i].y));
        }
        
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else {
      // Si no está en modo simulación, mostrar la línea punteada tradicional
      ctx.beginPath();
      ctx.setLineDash([3, 3]); // Línea punteada
      ctx.moveTo(x, y);
      ctx.lineTo(x, scaleY(0)); // Línea hacia la base (ciudad)
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]); // Restaurar línea normal
    }
  };
  
  // Función para dibujar una trayectoria parabólica simple
  const drawSimpleTrajectory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, 
                               params: FormData, 
                               scaleX: (x: number) => number, scaleY: (y: number) => number,
                               maxX: number, maxY: number) => {
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
    
    // Usar posición real del defensor para iniciar la trayectoria
    const startX = defensorX + cannonLength * Math.cos(angleRad);
    const startY = defensorY - cannonLength * Math.sin(angleRad);
    
    // Dibujar la trayectoria parabólica
    ctx.beginPath();
    
    // Usando ecuaciones de movimiento parabólico para generar puntos
    const g = 9.8; // Gravedad
    const v0 = defensorInitialSpeed;
    const theta = defensorAngle * Math.PI / 180;
    
    // Componentes de la velocidad inicial
    const v0x = v0 * Math.cos(theta);
    const v0y = v0 * Math.sin(theta);
    
    // Tiempo de vuelo
    const totalTime = (2 * v0y) / g;
    
    // Crear array para almacenar todos los puntos de la trayectoria
    const trajectoryPoints = [];
    
    // Dibujamos la curva
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Generar puntos de la trayectoria
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalTime;
      
      // Posición en cada instante
      const x = defensorPosition + v0x * t;
      const y = v0y * t - 0.5 * g * t * t;
      
      // Si ya cayó al suelo o se salió del gráfico, terminamos
      if (y < 0 || x > maxX) break;
      
      trajectoryPoints.push({ x, y });
      ctx.lineTo(scaleX(x), scaleY(y));
    }
    
    ctx.strokeStyle = '#27ae60'; // Verde para el misil defensor
    ctx.lineWidth = 3;
    ctx.stroke();
    
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
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    const padding = 40;
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
        ctx.fillText(`¡Éxito! El misil defensor intercepta al enemigo en t=${tAtTargetX.toFixed(2)}s`, padding + 20, padding + 95);
      } else {
        // Mensaje de fallo
        ctx.font = '14px Arial';
        ctx.fillStyle = '#e74c3c';
        ctx.textAlign = 'left';
        ctx.fillText(`No hay intercepción. Diferencia de altura: ${Math.abs(yAtTargetX - targetY).toFixed(2)} m`, padding + 20, padding + 95);
      }
    } else {
      // Mensaje de que no puede alcanzarlo
      ctx.font = '14px Arial';
      ctx.fillStyle = '#e74c3c';
      ctx.textAlign = 'left';
      ctx.fillText('No hay intercepción. El misil defensor no alcanza la posición objetivo.', padding + 20, padding + 95);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Simulador de Trayectoria Parabólica</h1>
      </header>
      <main>
        <InputForm onSubmit={handleFormSubmit} onShowTarget={handleShowTarget} />
        
        <div className="results-container">
          <h2>Simulación de Trayectoria</h2>
          
          <div className="trajectory-display">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}
            />
          </div>
          
         
        </div>
      </main>
    </div>
  )
}

export default App
