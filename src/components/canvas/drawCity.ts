// Función para dibujar una ciudad simple
export const drawCity = (ctx: CanvasRenderingContext2D, positionX: number,
    scaleX: (x: number) => number, scaleY: (y: number) => number, showExplosion: boolean, showTrajectory: boolean) => {
    const cityX = scaleX(positionX);
    const y = scaleY(0);

    // Si hay explosión, dibujar la ciudad destruida
    if (showExplosion && showTrajectory) {
        drawDestroyedCity(ctx, cityX, y);
        return;
    }

    // Base de la ciudad
    ctx.beginPath();
    ctx.rect(cityX - 20, y - 10, 60, 10);
    ctx.fillStyle = '#34495e';
    ctx.fill();

    // Edificio 1 (izquierdo)
    ctx.beginPath();
    ctx.rect(cityX - 18, y - 25, 12, 15);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();

    // Edificio 2 (central y más alto)
    ctx.beginPath();
    ctx.rect(cityX - 1, y - 35, 14, 25);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();

    // Edificio 3 (derecho)
    ctx.beginPath();
    ctx.rect(cityX + 17, y - 20, 12, 10);
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();

    // Ventanas (edificio 1)
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            ctx.beginPath();
            ctx.rect(cityX - 15 + j * 5, y - 22 + i * 7, 2, 3);
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

// Función para dibujar la ciudad destruida
export const drawDestroyedCity = (ctx: CanvasRenderingContext2D, cityX: number, y: number) => {
    // Base de la ciudad (ahora con grietas)
    ctx.beginPath();
    ctx.rect(cityX - 20, y - 8, 60, 8);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();

    // Dibujar grietas en la base
    ctx.beginPath();
    ctx.moveTo(cityX - 10, y - 8);
    ctx.lineTo(cityX - 5, y - 4);
    ctx.lineTo(cityX, y - 8);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cityX + 15, y - 8);
    ctx.lineTo(cityX + 10, y - 3);
    ctx.lineTo(cityX + 5, y - 8);
    ctx.stroke();

    // Edificio 1 (izquierdo) - parcialmente destruido
    ctx.beginPath();
    ctx.rect(cityX - 18, y - 15, 12, 7); // Reducido en altura
    ctx.fillStyle = '#626567';
    ctx.fill();

    // Escombros del edificio 1
    ctx.beginPath();
    ctx.moveTo(cityX - 18, y - 15);
    ctx.lineTo(cityX - 22, y - 10);
    ctx.lineTo(cityX - 14, y - 10);
    ctx.closePath();
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();

    // Edificio 2 (central) - severamente dañado
    ctx.beginPath();
    ctx.rect(cityX - 1, y - 20, 14, 12); // Muy reducido en altura
    ctx.fillStyle = '#626567';
    ctx.fill();

    // Parte superior destruida del edificio 2
    ctx.beginPath();
    ctx.moveTo(cityX - 1, y - 20);
    ctx.lineTo(cityX + 3, y - 25);
    ctx.lineTo(cityX + 7, y - 20);
    ctx.closePath();
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();

    // Escombros cayendo del edificio 2
    for (let i = 0; i < 5; i++) {
        const offsetX = Math.sin(i * 2) * 5;
        const offsetY = Math.random() * -10;
        ctx.fillRect(cityX + offsetX, y + offsetY, 3, 3);
    }

    // Edificio 3 (derecho) - completamente destruido (solo escombros)
    ctx.beginPath();
    ctx.moveTo(cityX + 17, y - 8);
    ctx.lineTo(cityX + 23, y - 12);
    ctx.lineTo(cityX + 29, y - 8);
    ctx.closePath();
    ctx.fillStyle = '#7f8c8d';
    ctx.fill();

    // Humo sobre los edificios
    const gradient = ctx.createRadialGradient(
        cityX, y - 30, 5,
        cityX, y - 30, 20
    );
    gradient.addColorStop(0, 'rgba(100, 100, 100, 0.9)');
    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cityX, y - 30, 20, 0, Math.PI * 2);
    ctx.fill();

    // Fuego en algunos puntos
    const firePositions = [
        { x: cityX - 15, y: y - 12, size: 5 },
        { x: cityX + 5, y: y - 18, size: 7 },
        { x: cityX + 20, y: y - 10, size: 6 }
    ];

    for (const pos of firePositions) {
        const fireGradient = ctx.createRadialGradient(
            pos.x, pos.y, 0,
            pos.x, pos.y, pos.size
        );
        fireGradient.addColorStop(0, 'rgba(255, 150, 0, 0.9)');
        fireGradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.7)');
        fireGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = fireGradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.size, 0, Math.PI * 2);
        ctx.fill();
    }
};
