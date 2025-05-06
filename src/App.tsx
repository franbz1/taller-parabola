import './App.css'
import PlanoCartesiano from './components/canvas/PlanoCartesiano';
import DatosSimulacion from './components/DatosSimulacion';
import { useState, useMemo } from 'react';
import { useTrajectory, useFreeFall, useInterception } from './hooks/useParabolicMotion';

function App() {
  const [anguloCañon, setAnguloCañon] = useState(45);
  const [velocidadCañon, setVelocidadCañon] = useState(10);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<{ x: number; y: number } | null>(null);
  const [escalaCanvas, setEscalaCanvas] = useState(10);
  const [iniciarAnimacion, setIniciarAnimacion] = useState(false);
  const [umbral, setUmbral] = useState(0.5)

  // Parámetros para los cálculos de trayectoria
  const timeStep = 0.1; // Intervalo de tiempo para cálculos
  const maxTime = 10; // Tiempo máximo de simulación

  // Datos para la trayectoria parabólica
  const trajectoryData = useMemo(() => ({
    initialPosition: { x: 0, y: 0 }, // El cañón está en el origen
    initialSpeed: velocidadCañon,
    angle: anguloCañon,
    timeStep,
    maxTime
  }), [velocidadCañon, anguloCañon]);

  // Usar el hook para calcular la trayectoria parabólica
  const { range, maxHeight, flightTime, trajectory } = useTrajectory(trajectoryData);

  // Datos para la caída libre (solo si hay un punto seleccionado)
  const freeFallData = useMemo(() => ({
    initialPosition: puntoSeleccionado ?? { x: 0, y: 0 },
    initialHorizontalSpeed: 0, // Sin velocidad horizontal inicial
    timeStep
  }), [puntoSeleccionado]);

  // Calcular trayectoria de caída libre solo si hay un punto seleccionado
  const { freeFallTrajectory } = useFreeFall(freeFallData);

  // Calcular intercepción entre trayectorias - siempre llamar al hook
  const interception = useInterception(trajectoryData, freeFallData, umbral);
  
  // Determinar si debemos mostrar resultados de intercepción
  const showInterception = puntoSeleccionado !== null;

  const handleAnguloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoAngulo = Number.parseInt(e.target.value);
    setAnguloCañon(nuevoAngulo);
    // Reset animación
    setIniciarAnimacion(false);
  };

  const handleVelocidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaVelocidad = Number.parseFloat(e.target.value);
    if (nuevaVelocidad > 0) {
      setVelocidadCañon(nuevaVelocidad);
      // Reset animación
      setIniciarAnimacion(false);
    }
  };

  const handleUmbralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoUmbral = Number.parseFloat(e.target.value);
    if (nuevoUmbral > 0) {
      setUmbral(nuevoUmbral)

      setIniciarAnimacion(false)
    }
  }

  const handlePuntoSeleccionado = (coordenadas: { x: number; y: number }) => {
    setPuntoSeleccionado(coordenadas);
    // Reset animación
    setIniciarAnimacion(false);
  };

  const handleEscalaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaEscala = Number.parseInt(e.target.value);
    setEscalaCanvas(nuevaEscala);
  };

  const handleStartAnimation = () => {
    setIniciarAnimacion(true);
  };

  const handleRestartAnimation = () => {
    setIniciarAnimacion(false);
    // Pequeño retraso para asegurar que el estado se actualiza antes de volver a iniciar
    setTimeout(() => setIniciarAnimacion(true), 50);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#333' }}>Simulador de Trayectoria Parabólica</h1>
      </header>
      <main>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <PlanoCartesiano
                escala={escalaCanvas}
                intervaloMarcas={3}
                ancho={600}
                alto={400}
                anguloInicial={anguloCañon}
                velocidadInicial={velocidadCañon}
                onClickPunto={handlePuntoSeleccionado}
                puntoSeleccionado={puntoSeleccionado}
                puntosTrayectoria={trajectory}
                puntosFreeFall={showInterception ? freeFallTrajectory : []}
                velocidadAnimacion={50}
                iniciarAnimacion={iniciarAnimacion}
                interception={interception}
              />
              
              <div style={{ 
                marginTop: '15px', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px' 
              }}>
                <button 
                  onClick={handleStartAnimation} 
                  disabled={iniciarAnimacion || (!puntoSeleccionado && trajectory.length === 0)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: iniciarAnimacion ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: iniciarAnimacion ? 'default' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  Iniciar Animación
                </button>
                
                <button 
                  onClick={handleRestartAnimation} 
                  disabled={!iniciarAnimacion}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: !iniciarAnimacion ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !iniciarAnimacion ? 'default' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  Reiniciar Animación
                </button>
              </div>
            </div>
            
            <DatosSimulacion 
              anguloCañon={anguloCañon}
              onAnguloChange={handleAnguloChange}
              velocidadCañon={velocidadCañon}
              onVelocidadChange={handleVelocidadChange}
              escala={escalaCanvas}
              onEscalaChange={handleEscalaChange}
              range={range}
              maxHeight={maxHeight}
              flightTime={flightTime}
              puntoSeleccionado={puntoSeleccionado}
              freeFallTrajectory={freeFallTrajectory}
              interception={interception}
              showInterception={showInterception}
              umbral={umbral}
              onumbralChange={handleUmbralChange}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
