  // Función para dibujar la explosión
  export const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    
    // Círculo central de la explosión (amarillo brillante)
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFF00';
    ctx.fill();
    
    // Círculo medio de la explosión (naranja)
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#FF9500';
    ctx.globalAlpha = 0.8;
    ctx.fill();
    
    // Círculo exterior de la explosión (rojo)
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#FF5500';
    ctx.globalAlpha = 0.6;
    ctx.fill();
    
    // Restablecer transparencia
    ctx.globalAlpha = 1;
    
    // Dibujar destellos/rayos de la explosión
    const numRays = 12;
    const rayLength = size * 1.2;
    
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < numRays; i++) {
      const angle = (Math.PI * 2 * i) / numRays;
      const rayStartX = x + (size * 0.4) * Math.cos(angle);
      const rayStartY = y + (size * 0.4) * Math.sin(angle);
      const rayEndX = x + rayLength * Math.cos(angle);
      const rayEndY = y + rayLength * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(rayStartX, rayStartY);
      ctx.lineTo(rayEndX, rayEndY);
      ctx.stroke();
    }
    
    // Ondas de choque (círculos concéntricos)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.8 * i, 0, Math.PI * 2);
      ctx.globalAlpha = 0.3 / i;
      ctx.stroke();
    }
    
    // Restablecer transparencia
    ctx.globalAlpha = 1;
  };