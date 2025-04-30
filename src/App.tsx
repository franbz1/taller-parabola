import { useState } from 'react'
import './App.css'
import InputForm from './components/InputForm'
import { FormData, TargetData } from './components/InputForm'
import SimulationCanvas from './components/canvas/SimulationCanvas'
import MissileSimulation from './components/MissileSimulation'

function App() {
  // Estado completo del formulario
  const [formParams, setFormParams] = useState<FormData | null>(null);

  // Estado para la primera etapa (solo objetivo)
  const [targetParams, setTargetParams] = useState<TargetData | null>(null);

  // Estado para controlar si se debe dibujar la trayectoria
  const [showTrajectory, setShowTrajectory] = useState(false);
  
  // Estado de la simulación
  const [simulationState, setSimulationState] = useState({
    enemyTrajectory: [] as { x: number, y: number }[],
    trajectoryPoints: [] as { x: number, y: number }[],
    enemyMissileProgress: 0,
    defensorMissileProgress: 0,
    showExplosion: false,
    explosionSize: 0
  });
  
  // Manejador para la primera etapa: mostrar el objetivo
  const handleShowTarget = (data: TargetData) => {
    setTargetParams(data);
    setShowTrajectory(false); // Asegurarnos de no mostrar trayectoria aún
  };

  // Manejador para la segunda etapa: simular trayectoria
  const handleFormSubmit = (data: FormData) => {
    setFormParams(data);
    setShowTrajectory(true); // Ahora sí mostrar la trayectoria
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simulador de Movimiento Parabólico</h1>
        <h2>Intercepción de Misil Enemigo</h2>
      </header>
      <main>
        <InputForm onSubmit={handleFormSubmit} onShowTarget={handleShowTarget} />

        <div className="results-container">
          <h2>Simulación de Trayectoria</h2>

          <div className="trajectory-display">
            {/* Componente de simulación (no visible, solo lógica) */}
            <MissileSimulation
              formParams={formParams}
              targetParams={targetParams}
              onSimulationStateChange={setSimulationState}
            />
            
            {/* Canvas de simulación (visible) */}
            <SimulationCanvas
              width={800}
              height={500}
              targetParams={targetParams}
              formParams={formParams}
              showTrajectory={showTrajectory}
              enemyTrajectory={simulationState.enemyTrajectory}
              trajectoryPoints={simulationState.trajectoryPoints}
              enemyMissileProgress={simulationState.enemyMissileProgress}
              defensorMissileProgress={simulationState.defensorMissileProgress}
              showExplosion={simulationState.showExplosion}
              explosionSize={simulationState.explosionSize}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App