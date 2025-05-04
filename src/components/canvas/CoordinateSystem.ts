import { TargetData } from '../InputForm';

// Función para dibujar el sistema de coordenadas en el canvas
export const drawCoordinateSystem = (
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement, 
  targetParams: TargetData | null
) => {
  const padding = 60;
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
    if (maxY > 1000) {
      maxY = Math.ceil(maxY / 1000) * 1000;
    } else if (maxY > 100) {
      maxY = Math.ceil(maxY / 100) * 100;
    } else {
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
  ctx.fillText(xAxisLabel, canvas.width - padding + 25, canvas.height - padding + 42);

  // Etiqueta para eje Y (ahora arriba del eje)
  ctx.textAlign = 'center';
  const yAxisLabel = maxY >= 1000 ? 'Altura (km)' : 'Altura (m)';
  ctx.fillText(yAxisLabel, padding - 15, padding - 21);

  // Marcas y etiquetas en el eje X
  ctx.textAlign = 'center';
  ctx.font = '12px Arial';
  const xStep = graphWidth / 10;
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
      displayValue = value / 1000;
    }
    ctx.fillText(displayValue.toString(), x, canvas.height - padding + 20);
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
      displayValue = value / 1000;
    }
    ctx.fillText(displayValue.toString(), padding - 10, y + 4);
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

// Función para mostrar instrucciones cuando no hay datos
export const drawInstructions = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'center';
  ctx.fillText('Complete el formulario con la distancia y altura', canvas.width / 2, canvas.height / 2 - 30);
  ctx.fillText('y presione "Mostrar en el plano"', canvas.width / 2, canvas.height / 2);

  ctx.font = '14px Arial';
  ctx.fillStyle = '#e74c3c';
  ctx.fillText('Ingrese la distancia de la ciudad y la altura del misil enemigo', canvas.width / 2, canvas.height / 2 + 60);
};
