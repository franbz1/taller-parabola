import { useState, useRef, useEffect } from 'react'
import './App.css'
import InputForm from './components/InputForm'
import { FormData } from './components/InputForm'

function App() {
  const [formParams, setFormParams] = useState<FormData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleFormSubmit = (data: FormData) => {
    console.log('Datos recibidos:', data);
    setFormParams(data);
  };

  // Efecto para dibujar el plano cuando cambian los parámetros
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar el plano (ejes X e Y)
    drawCoordinateSystem(ctx, canvas);
    
    // Dibujar una trayectoria simulada simple si hay parámetros
    if (formParams) {
      drawSimpleTrajectory(ctx, canvas, formParams);
    } else {
      // Si no hay parámetros, mostrar mensaje de instrucciones
      drawInstructions(ctx, canvas);
    }
  }, [formParams]);
  
  // Función para mostrar instrucciones cuando no hay datos
  const drawInstructions = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.fillText('Complete el formulario y presione "Simular"', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('para visualizar la trayectoria parabólica', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('del misil defensor', canvas.width / 2, canvas.height / 2 + 40);
    
    // Dibujar un cañón base como ejemplo
    const padding = 40;
    ctx.beginPath();
    ctx.arc(padding + 10, canvas.height - padding, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();
    
    // Cañón (tubo) en posición predeterminada
    ctx.save();
    ctx.translate(padding + 10, canvas.height - padding);
    ctx.rotate(-Math.PI / 4); // 45 grados
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, -3, 20, 6);
    ctx.restore();
    
    // Texto para el cañón defensor
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('DEFENSOR', padding + 10, canvas.height - padding + 20);
  };
  
  // Función para dibujar el sistema de coordenadas
  const drawCoordinateSystem = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const padding = 40;
    const axisColor = '#333';
    const gridColor = '#e0e0e0';
    
    // Calcular el espacio disponible para el gráfico
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Decidir el espaciado de la cuadrícula - cada 10 metros
    const gridSpacingX = graphWidth / 10; // 10 divisiones
    const gridSpacingY = graphHeight / 10; // 10 divisiones
    
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
    ctx.textAlign = 'center';
    ctx.fillText('Distancia (m)', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Altura (m)', 0, 0);
    ctx.restore();
    
    // Marcas y etiquetas en el eje X
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    const maxX = 100; // 100 metros
    const xStep = graphWidth / 10; // 10 divisiones
    
    for (let i = 0; i <= 10; i++) {
      const x = padding + i * xStep;
      const value = Math.round((i / 10) * maxX);
      
      // Marca
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - padding);
      ctx.lineTo(x, canvas.height - padding + 5);
      ctx.stroke();
      
      // Valor
      ctx.fillText(`${value}`, x, canvas.height - padding + 20);
    }
    
    // Coordenadas y etiquetas en el eje Y
    ctx.textAlign = 'right';
    const maxY = 100; // 100 metros
    const yStep = graphHeight / 10; // 10 divisiones
    
    for (let i = 0; i <= 10; i++) {
      const y = canvas.height - padding - i * yStep;
      const value = Math.round((i / 10) * maxY);
      
      // Marca
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.stroke();
      
      // Valor
      ctx.fillText(`${value}`, padding - 10, y + 4);
    }
    
    // Etiqueta de origen (0,0)
    ctx.textAlign = 'right';
    ctx.fillText('0', padding - 10, canvas.height - padding + 4);
    
    // Dibujar la ciudad estática
    drawCity(ctx, canvas, 80); // Ciudad a 80 metros de distancia
    
    // Dibujar el misil enemigo
    drawEnemyMissile(ctx, canvas, 80, 60); // Misil a 80 metros de distancia y 60 metros de altura
  };
  
  // Función para dibujar una ciudad simple
  const drawCity = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, positionX: number) => {
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Factores de conversión para ajustar a la escala del canvas
    const maxX = 100; // 100 metros horizontales
    const maxY = 100; // 100 metros verticales
    
    const scaleX = (x: number) => padding + (x / maxX) * graphWidth;
    const scaleY = (y: number) => canvas.height - padding - (y / maxY) * graphHeight;
    
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
    
    // Etiqueta "CIUDAD"
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('CIUDAD', x, y + 10);
  };
  
  // Función para dibujar un misil enemigo
  const drawEnemyMissile = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, positionX: number, positionY: number) => {
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    // Factores de conversión para ajustar a la escala del canvas
    const maxX = 100; // 100 metros horizontales
    const maxY = 100; // 100 metros verticales
    
    const scaleX = (x: number) => padding + (x / maxX) * graphWidth;
    const scaleY = (y: number) => canvas.height - padding - (y / maxY) * graphHeight;
    
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
    
    // Dibujar línea punteada hacia la ciudad para mostrar trayectoria
    ctx.beginPath();
    ctx.setLineDash([3, 3]); // Línea punteada
    ctx.moveTo(x, y);
    ctx.lineTo(scaleX(positionX), scaleY(0)); // Línea hacia la base (ciudad)
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]); // Restaurar línea normal
    
    // Etiqueta "MISIL ENEMIGO"
    ctx.font = '10px Arial';
    ctx.fillStyle = '#c0392b';
    ctx.textAlign = 'center';
    ctx.fillText('MISIL ENEMIGO', x, y - 24);
    
    // Coordenadas del misil
    ctx.fillText(`(${positionX}, ${positionY})`, x, y - 12);
  };
  
  // Función para dibujar una trayectoria parabólica simple
  const drawSimpleTrajectory = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, params: FormData) => {
    const padding = 40;
    const graphWidth = canvas.width - 2 * padding;
    const graphHeight = canvas.height - 2 * padding;
    
    const { defensorAngle, defensorInitialSpeed, targetDistance, enemyHeight, defensorPosition } = params;
    
    // Factores de conversión para ajustar a la escala del canvas
    const maxX = 100; // 100 metros horizontales
    const maxY = 100; // 100 metros verticales
    
    const scaleX = (x: number) => padding + (x / maxX) * graphWidth;
    const scaleY = (y: number) => canvas.height - padding - (y / maxY) * graphHeight;
    
    // Coordenadas del punto actual cuando se mueve el ratón sobre el canvas
    let currentX = 0;
    let currentY = 0;
    
    // Dibujar la base del lanzador
    const defensorX = scaleX(defensorPosition);
    ctx.beginPath();
    ctx.arc(defensorX, scaleY(0), 10, 0, Math.PI * 2);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();
    
    // Dibujar el cañón
    const cannonLength = 20;
    const angleRad = (defensorAngle * Math.PI) / 180;
    
    ctx.save();
    ctx.translate(defensorX, scaleY(0));
    ctx.rotate(-angleRad);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, -3, cannonLength, 6);
    ctx.restore();
    
    // Texto para el cañón defensor
    ctx.font = '10px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText('DEFENSOR', defensorX, scaleY(0) + 20);
    
    // Usar posición real del defensor para iniciar la trayectoria
    const startX = defensorX + cannonLength * Math.cos(angleRad);
    const startY = scaleY(0) - cannonLength * Math.sin(angleRad);
    
    // Dibujar la trayectoria parabólica simplificada
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
      
      // Si ya cayó al suelo, terminamos
      if (y < 0) break;
      
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
    
    // Punto de impacto
    const tImpact = totalTime;
    const xImpact = defensorPosition + v0x * tImpact;
    
    // Dibujar punto de impacto
    ctx.beginPath();
    ctx.arc(scaleX(xImpact), scaleY(0), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#3498db';
    ctx.fill();
    
    // Etiqueta del punto de impacto
    ctx.fillText(`(${xImpact.toFixed(1)}, 0)`, scaleX(xImpact), scaleY(0) - 10);
    
    // Agregar información de la trayectoria
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(`Alcance: ${xImpact.toFixed(2)} m`, padding + 20, padding + 20);
    ctx.fillText(`Altura máxima: ${yMax.toFixed(2)} m`, padding + 20, padding + 45);
    ctx.fillText(`Tiempo de vuelo: ${totalTime.toFixed(2)} s`, padding + 20, padding + 70);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Simulador de Trayectoria Parabólica</h1>
      </header>
      <main>
        <InputForm onSubmit={handleFormSubmit} />
        
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
