/**
 * Clase para dibujar un lanzador de misiles en un canvas
 */
export class DibujanteCanon {
  /**
   * Dibuja un lanzador de misiles antiaéreo en las coordenadas especificadas con el ángulo dado
   * @param ctx Contexto del canvas
   * @param posX Posición X donde se dibujará el lanzador
   * @param posY Posición Y donde se dibujará el lanzador
   * @param angulo Ángulo del lanzador en grados
   * @param mostrarDisparo Si se debe mostrar el efecto de disparo
   */
  static dibujar(
    ctx: CanvasRenderingContext2D,
    posX: number,
    posY: number,
    angulo: number,
    mostrarDisparo: boolean = false
  ) {
    if (!ctx) return;

    // Convertir ángulo a radianes (el ángulo viene en grados)
    const anguloRad = (angulo * Math.PI) / 180;
    
    // Tamaño fijo para el lanzador, independiente de la escala
    const baseWidth = 40;
    const baseHeight = 20;
    const tubeLength = 40;
    const tubeWidth = 12;
    
    // Función auxiliar para dibujar rectángulos redondeados (compatible con todos los navegadores)
    const drawRoundedRect = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      width: number, 
      height: number, 
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
    };
    
    // Guardar el estado actual del contexto para poder restaurarlo después
    ctx.save();
    
    // Trasladar el sistema de coordenadas al punto de pivote (0,0)
    ctx.translate(posX, posY);
    
    // Dibujar la base del lanzador (por debajo del pivote)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    
    // Plataforma de la base (rectángulo redondeado)
    ctx.fillStyle = "#2a3f4d";
    drawRoundedRect(ctx, -baseWidth/2, 0, baseWidth, baseHeight, 5);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // Desactivar sombra para los siguientes elementos
    
    // Superficie de la base con gradiente
    const baseGradient = ctx.createLinearGradient(-baseWidth/2, 0, baseWidth/2, baseHeight);
    baseGradient.addColorStop(0, '#3a5060');
    baseGradient.addColorStop(0.5, '#4a6272');
    baseGradient.addColorStop(1, '#3a5060');
    ctx.fillStyle = baseGradient;
    drawRoundedRect(ctx, -baseWidth/2 + 2, 2, baseWidth - 4, baseHeight - 4, 3);
    ctx.fill();
    
    // Detalles tecnológicos en la base
    // Panel de control
    ctx.fillStyle = "#232e36";
    ctx.fillRect(-baseWidth/3, baseHeight/2 - 5, baseWidth/4, 6);
    
    // Luces indicadoras
    const luces = ['#ff3333', '#33ff33', '#3366ff'];
    luces.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(-baseWidth/3 + 5 + i * 7, baseHeight/2 - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Estructura de soporte (conecta el pivote con la base)
    ctx.fillStyle = "#344b58";
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.lineTo(10, baseHeight/4);
    ctx.lineTo(-10, baseHeight/4);
    ctx.closePath();
    ctx.fill();
    
    // Círculo de pivote para el lanzador (en 0,0)
    ctx.fillStyle = "#4a6272";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#232e36";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Rotar para dibujar el tubo del lanzador según el ángulo
    ctx.rotate(-anguloRad); // Negativo porque el ángulo aumenta en sentido antihorario
    
    // Dibujar el soporte del tubo lanzador
    ctx.fillStyle = "#344b58";
    drawRoundedRect(ctx, -tubeWidth/2 - 3, -12, tubeWidth + 6, 12, 2);
    ctx.fill();
    
    // Dibujar tubo lanzador
    const tubeGradient = ctx.createLinearGradient(0, -tubeWidth/2, tubeLength, tubeWidth/2);
    tubeGradient.addColorStop(0, '#475d6b');
    tubeGradient.addColorStop(0.5, '#5a7080');
    tubeGradient.addColorStop(1, '#475d6b');
    
    ctx.fillStyle = tubeGradient;
    drawRoundedRect(ctx, 0, -tubeWidth/2, tubeLength, tubeWidth, 3);
    ctx.fill();
    
    // Detalles del tubo lanzador (rieles guía)
    ctx.strokeStyle = "#232e36";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, -tubeWidth/2 + 2);
    ctx.lineTo(tubeLength - 5, -tubeWidth/2 + 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(5, tubeWidth/2 - 2);
    ctx.lineTo(tubeLength - 5, tubeWidth/2 - 2);
    ctx.stroke();
    
    // Borde del tubo
    ctx.strokeStyle = "#232e36";
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 0, -tubeWidth/2, tubeLength, tubeWidth, 3);
    ctx.stroke();
    
    // Detalles de la boca del lanzador
    ctx.fillStyle = "#232e36";
    ctx.beginPath();
    ctx.moveTo(tubeLength, -tubeWidth/2);
    ctx.lineTo(tubeLength + 5, -tubeWidth/3);
    ctx.lineTo(tubeLength + 5, tubeWidth/3);
    ctx.lineTo(tubeLength, tubeWidth/2);
    ctx.closePath();
    ctx.fill();
    
    // Misil visible dentro del lanzador cuando no está disparando
    if (!mostrarDisparo) {
      ctx.fillStyle = "#697d89";
      drawRoundedRect(ctx, tubeLength - 25, -tubeWidth/3, 20, tubeWidth/1.5, 4);
      ctx.fill();
      
      // Punta del misil
      ctx.fillStyle = "#566973";
      ctx.beginPath();
      ctx.moveTo(tubeLength - 5, 0);
      ctx.lineTo(tubeLength - 5, -tubeWidth/2);
      ctx.lineTo(tubeLength, 0);
      ctx.lineTo(tubeLength - 5, tubeWidth/2);
      ctx.closePath();
      ctx.fill();
    }
    
    // Efecto de disparo si está habilitado
    if (mostrarDisparo) {
      // Destello en la boca del lanzador
      const flashGradient = ctx.createRadialGradient(
        tubeLength, 0, 0,
        tubeLength, 0, 30
      );
      flashGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
      flashGradient.addColorStop(0.2, 'rgba(255, 200, 50, 0.9)');
      flashGradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.7)');
      flashGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      
      ctx.fillStyle = flashGradient;
      ctx.beginPath();
      ctx.arc(tubeLength, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Humo del disparo
      for (let i = 0; i < 7; i++) {
        const smokeRadius = 2 + Math.random() * 3.5;
        const smokeX = tubeLength + Math.random() * 15 - 5;
        const smokeY = (Math.random() - 0.5) * 15;
        const opacity = 0.8 - Math.random() * 0.5;
        
        ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Restaurar el contexto a su estado anterior
    ctx.restore();
    
    // Dibujar el ángulo actual con mejor estilo
    ctx.fillStyle = "#333";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${angulo.toFixed(2)}°`, posX + 12, posY - 12);
  }
} 