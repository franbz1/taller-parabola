import { Point } from "../../lib/parabolicMotion"
import { coordenadasACanvas } from "./utilidades"

/**
 * Clase para dibujar misiles y sus trayectorias en un canvas
 */
export class DibujanteMisil {
  /**
   * Dibuja una trayectoria de misil
   * @param ctx Contexto del canvas
   * @param puntos Puntos de la trayectoria
   * @param origenX Origen X del plano cartesiano
   * @param origenY Origen Y del plano cartesiano
   * @param escala Escala del plano cartesiano
   * @param color Color principal de la trayectoria
   */
  static dibujarTrayectoria(
    ctx: CanvasRenderingContext2D,
    puntos: Point[],
    origenX: number,
    origenY: number,
    escala: number,
    color: string = "blue"
  ) {
    if (!ctx || puntos.length === 0) return;

    // Definir colores para los efectos
    const colorBase = color;
    const colorSecundario = "rgba(255, 255, 255, 0.7)"; // Color para el brillo central
    const colorEstela = color === "blue" ? 
      "rgba(100, 150, 255, 0.3)" : 
      "rgba(255, 150, 50, 0.3)"; // Estela semi-transparente

    // Dibujar una línea estilizada para la trayectoria principal
    ctx.strokeStyle = colorBase;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // Convertir todos los puntos a coordenadas de canvas
    const puntoCanvas = puntos.map(p => 
      coordenadasACanvas(p.x, p.y, origenX, origenY, escala)
    );

    // Dibujar estela de gradiente más ancha
    if (puntoCanvas.length > 2) {
      ctx.lineWidth = 8;
      const gradient = ctx.createLinearGradient(
        puntoCanvas[0].x, puntoCanvas[0].y, 
        puntoCanvas[puntoCanvas.length-1].x, puntoCanvas[puntoCanvas.length-1].y
      );
      
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.01)");
      gradient.addColorStop(0.3, colorEstela);
      gradient.addColorStop(1, colorEstela);
      
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      
      for (let i = 0; i < puntoCanvas.length; i++) {
        if (i === 0) {
          ctx.moveTo(puntoCanvas[i].x, puntoCanvas[i].y);
        } else {
          ctx.lineTo(puntoCanvas[i].x, puntoCanvas[i].y);
        }
      }
      
      ctx.stroke();
    }

    // Dibujar línea central brillante
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = colorSecundario;
    ctx.beginPath();
    
    for (let i = 0; i < puntoCanvas.length; i++) {
      if (i === 0) {
        ctx.moveTo(puntoCanvas[i].x, puntoCanvas[i].y);
      } else {
        ctx.lineTo(puntoCanvas[i].x, puntoCanvas[i].y);
      }
    }
    
    ctx.stroke();
    
    // Dibujar línea principal
    ctx.lineWidth = 2;
    ctx.strokeStyle = colorBase;
    ctx.beginPath();
    
    for (let i = 0; i < puntoCanvas.length; i++) {
      if (i === 0) {
        ctx.moveTo(puntoCanvas[i].x, puntoCanvas[i].y);
      } else {
        ctx.lineTo(puntoCanvas[i].x, puntoCanvas[i].y);
      }
    }
    
    ctx.stroke();

    // Calcular la dirección de la punta del misil
    if (puntoCanvas.length > 1) {
      const ultimo = puntoCanvas[puntoCanvas.length - 1];
      const penultimo = puntoCanvas[puntoCanvas.length - 2];
      
      // Calcular el ángulo de dirección
      const angulo = Math.atan2(ultimo.y - penultimo.y, ultimo.x - penultimo.x);
      
      // Dibujar el misil en la punta
      this.dibujarPuntaMisil(ctx, ultimo.x, ultimo.y, angulo, color);
    } 
    // Si solo hay un punto, dibujamos el misil apuntando horizontalmente
    else if (puntoCanvas.length === 1) {
      this.dibujarPuntaMisil(ctx, puntoCanvas[0].x, puntoCanvas[0].y, 0, color);
    }
  }

  /**
   * Dibuja la punta del misil
   * @param ctx Contexto del canvas
   * @param x Posición X
   * @param y Posición Y
   * @param angulo Ángulo de dirección en radianes
   * @param color Color del misil
   */
  static dibujarPuntaMisil(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angulo: number,
    color: string
  ) {
    // Guardar el estado del contexto
    ctx.save();
    
    // Mover y rotar el contexto
    ctx.translate(x, y);
    ctx.rotate(angulo);
    
    // Tamaño del misil
    const longitud = 10;
    const ancho = 4;
    
    // Dibujar sombra
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Cuerpo principal del misil
    ctx.fillStyle = color === "blue" ? "#2a3f8d" : "#8d3f2a";
    
    ctx.beginPath();
    // Punta
    ctx.moveTo(longitud, 0);
    // Cuerpo
    ctx.lineTo(0, ancho / 2);
    ctx.lineTo(-longitud / 3, ancho / 2);
    ctx.lineTo(-longitud / 3, -ancho / 2);
    ctx.lineTo(0, -ancho / 2);
    ctx.closePath();
    ctx.fill();
    
    // Gradiente para el brillo
    const gradiente = ctx.createLinearGradient(-longitud/3, 0, longitud, 0);
    gradiente.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    gradiente.addColorStop(0.7, "rgba(255, 255, 255, 0.4)");
    gradiente.addColorStop(1, "rgba(255, 255, 255, 0.7)");
    
    // Brillo en la superficie
    ctx.fillStyle = gradiente;
    ctx.beginPath();
    ctx.moveTo(longitud, 0);
    ctx.lineTo(longitud / 2, -ancho / 4);
    ctx.lineTo(0, -ancho / 4);
    ctx.lineTo(0, -ancho / 2);
    ctx.lineTo(longitud/2, 0);
    ctx.closePath();
    ctx.fill();
    
    // Propulsión (estela corta)
    const propulsionGradient = ctx.createLinearGradient(
      -longitud/3, 0, -longitud*2/3, 0
    );
    
    if (color === "blue") {
      propulsionGradient.addColorStop(0, "rgba(100, 150, 255, 0.8)");
      propulsionGradient.addColorStop(1, "rgba(100, 150, 255, 0)");
    } else {
      propulsionGradient.addColorStop(0, "rgba(255, 150, 50, 0.8)");
      propulsionGradient.addColorStop(1, "rgba(255, 150, 50, 0)");
    }
    
    ctx.fillStyle = propulsionGradient;
    ctx.beginPath();
    ctx.moveTo(-longitud/3, ancho/2);
    ctx.lineTo(-longitud*2/3, ancho/4);
    ctx.lineTo(-longitud*2/3, -ancho/4);
    ctx.lineTo(-longitud/3, -ancho/2);
    ctx.closePath();
    ctx.fill();
    
    // Restaurar el contexto
    ctx.restore();
  }
} 