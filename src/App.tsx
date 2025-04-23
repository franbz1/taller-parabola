import { useState } from 'react'
import './App.css'
import InputForm from './components/InputForm'
import { FormData } from './components/InputForm'
import TrajectoryCanvas from './components/TrajectoryCanvas'

function App() {
  // Valores iniciales para el canvas (parábola en blanco)
  const [trajectoryParams, setTrajectoryParams] = useState({
    initialSpeed: 0,
    angle: 45,
    isInitialState: true // Flag para indicar el estado inicial
  });

  const handleFormSubmit = (data: FormData) => {
    console.log('Datos recibidos:', data);
    setTrajectoryParams({
      initialSpeed: data.cannonInitialSpeed,
      angle: data.cannonAngle,
      isInitialState: false
    });
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
            <TrajectoryCanvas 
              initialSpeed={trajectoryParams.initialSpeed} 
              angle={trajectoryParams.angle}
              isInitialState={trajectoryParams.isInitialState}
            />
          </div>
          
          {!trajectoryParams.isInitialState && (
            <div className="parameters-display">
              <h3>Parámetros Utilizados</h3>
              <ul>
                <li><strong>Velocidad inicial del cañón:</strong> {trajectoryParams.initialSpeed} m/s</li>
                <li><strong>Ángulo del cañón:</strong> {trajectoryParams.angle}°</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
