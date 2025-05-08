/**
 * Clase para dibujar un avión de combate en un canvas
 */
export class DibujanteAvion {
  /**
   * Dibuja un avión de combate en las coordenadas especificadas
   * @param ctx Contexto del canvas
   * @param posX Posición X donde se dibujará el avión
   * @param posY Posición Y donde se dibujará el avión
   */
  static dibujar(
    ctx: CanvasRenderingContext2D,
    posX: number,
    posY: number
  ) {
    if (!ctx) return;

    // Tamaño del avión
    const tamanio = 20;
    
    // Guardar el estado actual del contexto
    ctx.save();
    
    // Trasladar al punto central
    ctx.translate(posX, posY);
    
    // Aplicar sombra
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Dibujar el cuerpo principal del avión
    ctx.fillStyle = "#2a3f4d";
    ctx.beginPath();
    
    // Morro del avión (punta)
    ctx.moveTo(tamanio, 0);
    
    // Lado superior del fuselaje
    ctx.lineTo(tamanio/2, -tamanio/4);
    ctx.lineTo(-tamanio/2, -tamanio/4);
    
    // Ala superior izquierda
    ctx.lineTo(-tamanio/1.5, -tamanio/1.5);
    ctx.lineTo(-tamanio/1.2, -tamanio/4);
    
    // Continuación del fuselaje superior y cola
    ctx.lineTo(-tamanio, -tamanio/4);
    ctx.lineTo(-tamanio, -tamanio/2);
    
    // Regreso al fuselaje
    ctx.lineTo(-tamanio/2, -tamanio/4);
    
    // Lado inferior del fuselaje
    ctx.lineTo(-tamanio/2, tamanio/4);
    
    // Ala inferior izquierda
    ctx.lineTo(-tamanio/1.5, tamanio/1.5);
    ctx.lineTo(-tamanio/1.2, tamanio/4);
    
    // Continuación del fuselaje inferior y cola
    ctx.lineTo(-tamanio, tamanio/4);
    ctx.lineTo(-tamanio, tamanio/2);
    
    // Regreso y cierre
    ctx.lineTo(-tamanio/2, tamanio/4);
    ctx.lineTo(tamanio/2, tamanio/4);
    ctx.lineTo(tamanio, 0);
    
    ctx.closePath();
    ctx.fill();
    
    // Detalles del fuselaje (gradiente)
    const fuselajeGradient = ctx.createLinearGradient(-tamanio/2, -tamanio/4, tamanio/2, tamanio/4);
    fuselajeGradient.addColorStop(0, '#3a5060');
    fuselajeGradient.addColorStop(0.5, '#4a6272');
    fuselajeGradient.addColorStop(1, '#3a5060');
    
    ctx.fillStyle = fuselajeGradient;
    ctx.beginPath();
    ctx.moveTo(tamanio - 2, 0);
    ctx.lineTo(tamanio/2, -tamanio/6);
    ctx.lineTo(-tamanio/2 + 2, -tamanio/6);
    ctx.lineTo(-tamanio/2 + 2, tamanio/6);
    ctx.lineTo(tamanio/2, tamanio/6);
    ctx.closePath();
    ctx.fill();
    
    // Cabina del piloto
    const cabinaGradient = ctx.createLinearGradient(tamanio/4, -tamanio/8, tamanio/4, tamanio/8);
    cabinaGradient.addColorStop(0, '#8af');
    cabinaGradient.addColorStop(0.5, '#acf');
    cabinaGradient.addColorStop(1, '#68d');
    
    ctx.fillStyle = cabinaGradient;
    ctx.beginPath();
    ctx.ellipse(tamanio/4, 0, tamanio/4, tamanio/8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "#232e36";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Detalles de las alas
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#232e36";
    
    // Detalle ala superior
    ctx.beginPath();
    ctx.moveTo(-tamanio/2, -tamanio/4);
    ctx.lineTo(-tamanio/1.5, -tamanio/1.5);
    ctx.lineTo(-tamanio/1.2, -tamanio/4);
    ctx.stroke();
    
    // Detalle ala inferior
    ctx.beginPath();
    ctx.moveTo(-tamanio/2, tamanio/4);
    ctx.lineTo(-tamanio/1.5, tamanio/1.5);
    ctx.lineTo(-tamanio/1.2, tamanio/4);
    ctx.stroke();
    
    // Toberas de escape
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.rect(-tamanio - 2, -tamanio/4, 4, tamanio/6);
    ctx.fill();
    
    // Efecto de propulsión
    const propulsionGradient = ctx.createLinearGradient(-tamanio - 2, 0, -tamanio - 12, 0);
    propulsionGradient.addColorStop(0, 'rgba(255, 100, 50, 0.8)');
    propulsionGradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.6)');
    propulsionGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    
    ctx.fillStyle = propulsionGradient;
    ctx.beginPath();
    ctx.moveTo(-tamanio - 2, -tamanio/6);
    ctx.lineTo(-tamanio - 12, 0);
    ctx.lineTo(-tamanio - 2, tamanio/6);
    ctx.closePath();
    ctx.fill();
    
    // Mostrar coordenadas
    ctx.shadowColor = 'transparent'; // Desactivar sombra para el texto
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`(${Math.round(posX)}, ${Math.round(posY)})`, 0, -tamanio - 5);
    
    // Restaurar el contexto a su estado original
    ctx.restore();
  }
} 