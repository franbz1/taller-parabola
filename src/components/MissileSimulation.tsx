import { useRef, useEffect, useState } from 'react';
import { FormData, TargetData } from './InputForm';
import { calculateDefensorTrajectory, calculateEnemyMissileTrajectory } from '../lib/parabolicMotion';
import { SoundEffects } from '../lib/soundEffects';

interface MissileSimulationProps {
  formParams: FormData | null;
  targetParams: TargetData | null;
  onSimulationStateChange: (state: {
    enemyTrajectory: { x: number, y: number }[];
    trajectoryPoints: { x: number, y: number }[];
    enemyMissileProgress: number;
    defensorMissileProgress: number;
    showExplosion: boolean;
    explosionSize: number;
  }) => void;
}

const MissileSimulation: React.FC<MissileSimulationProps> = ({
  formParams,
  targetParams,
  onSimulationStateChange
}) => {
  // Estado para controlar las animaciones
  const [enemyMissileProgress, setEnemyMissileProgress] = useState(0);
  const [enemyTrajectory, setEnemyTrajectory] = useState<{ x: number, y: number }[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionSize, setExplosionSize] = useState(0);
  const [defensorMissileProgress, setDefensorMissileProgress] = useState(0);
  const [trajectoryPoints, setTrajectoryPoints] = useState<{ x: number, y: number }[]>([]);
  const [simulationActive, setSimulationActive] = useState(false);

  // Refs para las animaciones
  const animationFrameRef = useRef<number | null>(null);
  const defensorAnimationFrameRef = useRef<number | null>(null);
  const explosionAnimationFrameRef = useRef<number | null>(null);

  // Actualizar el componente padre con los valores del estado
  useEffect(() => {
    onSimulationStateChange({
      enemyTrajectory,
      trajectoryPoints,
      enemyMissileProgress,
      defensorMissileProgress,
      showExplosion,
      explosionSize
    });
  }, [enemyTrajectory, trajectoryPoints, enemyMissileProgress, defensorMissileProgress, showExplosion, explosionSize, onSimulationStateChange]);

  // Efecto para iniciar la simulación cuando cambian los parámetros
  useEffect(() => {
    if (formParams && targetParams) {
      startSimulation();
    }
  }, [formParams, targetParams]);

  // Iniciar la simulación completa
  const startSimulation = () => {
    if (!formParams || !targetParams) return;

    // Resetear el estado
    setShowExplosion(false);
    setExplosionSize(0);
    setSimulationActive(true);
    
    // Inicializar el contexto de audio
    SoundEffects.initialize();

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

    // Calcular los puntos de la trayectoria parabólica del defensor
    const points = calculateDefensorTrajectory(
      formParams.defensorAngle, 
      formParams.defensorInitialSpeed
    );
    setTrajectoryPoints(points);
    setDefensorMissileProgress(0);

    // Iniciar ambas animaciones
    startEnemyMissileAnimation();
    startDefensorMissileAnimation(formParams.defensorInitialSpeed);
  };

  // Función para iniciar la animación del misil defensor
  const startDefensorMissileAnimation = (initialSpeed: number) => {
    // Detener cualquier animación previa
    if (defensorAnimationFrameRef.current !== null) {
      cancelAnimationFrame(defensorAnimationFrameRef.current);
    }

    const startTime = performance.now();
    // Duración de la animación en milisegundos - ajustada según la velocidad
    // A mayor velocidad, menor duración para mantener sensación de rapidez
    const animationDuration = Math.max(3000, 6000 - initialSpeed * 50);

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);

      setDefensorMissileProgress(progress);

      if (progress < 1) {
        defensorAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        defensorAnimationFrameRef.current = null;
      }
    };

    defensorAnimationFrameRef.current = requestAnimationFrame(animate);
  };

  // Función para iniciar la animación del misil enemigo
  const startEnemyMissileAnimation = () => {
    // Detener cualquier animación previa
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Detener cualquier animación de explosión previa
    if (explosionAnimationFrameRef.current !== null) {
      cancelAnimationFrame(explosionAnimationFrameRef.current);
    }

    setShowExplosion(false);
    setExplosionSize(0);

    const startTime = performance.now();
    // Duración de la animación en milisegundos
    const animationDuration = 3000;

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);

      setEnemyMissileProgress(progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        // Al finalizar la animación del misil, iniciar la animación de explosión
        setShowExplosion(true);
        startExplosionAnimation();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Función para iniciar la animación de la explosión
  const startExplosionAnimation = () => {
    // Detener cualquier animación de explosión previa
    if (explosionAnimationFrameRef.current !== null) {
      cancelAnimationFrame(explosionAnimationFrameRef.current);
    }

    // Reproducir sonido de explosión
    SoundEffects.playExplosionSound();

    const startTime = performance.now();
    // Duración de la animación de explosión en milisegundos
    const animationDuration = 1500;
    const maxExplosionSize = 50; // Tamaño máximo de la explosión

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);

      // Tamaño de la explosión basado en la curva - crece rápido y luego se mantiene
      let sizeProgress;
      if (progress < 0.3) {
        // Crecimiento rápido inicial (0-30% del tiempo)
        sizeProgress = progress / 0.3;
      } else if (progress < 0.8) {
        // Mantener tamaño máximo (30-80% del tiempo)
        sizeProgress = 1;
      } else {
        // Desvanecimiento (80-100% del tiempo)
        sizeProgress = 1 - ((progress - 0.8) / 0.2);
      }

      setExplosionSize(sizeProgress * maxExplosionSize);

      if (progress < 1) {
        explosionAnimationFrameRef.current = requestAnimationFrame(animate);
      } else {
        explosionAnimationFrameRef.current = null;
        setShowExplosion(false);
      }
    };

    explosionAnimationFrameRef.current = requestAnimationFrame(animate);
  };

  // Cancelar cualquier animación al desmontar
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (defensorAnimationFrameRef.current !== null) {
        cancelAnimationFrame(defensorAnimationFrameRef.current);
      }
      if (explosionAnimationFrameRef.current !== null) {
        cancelAnimationFrame(explosionAnimationFrameRef.current);
      }
    };
  }, []);

  // Este componente no renderiza nada, solo maneja lógica
  return null;
};

export default MissileSimulation;
