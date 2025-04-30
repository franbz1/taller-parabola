import { TargetData } from "../InputForm";

// Función para dibujar sólo la base del defensor
export const drawDefensorBase = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, targetParams: TargetData | null) => {
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