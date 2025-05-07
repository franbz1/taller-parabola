import './App.css'
import PlanoCartesiano from './components/canvas/PlanoCartesiano';
import DatosSimulacion from './components/DatosSimulacion';
import { useState, useMemo, useEffect } from 'react';
import { useTrajectory, useFreeFall, useInterception } from './hooks/useParabolicMotion';
import type { InterceptionResult } from './lib/parabolicMotion';

function App() {
  const [anguloCañon, setAnguloCañon] = useState(45);
  const [velocidadCañon, setVelocidadCañon] = useState(100);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<{ x: number; y: number } | null>(null);
  const [escalaCanvas, setEscalaCanvas] = useState(0.5);
  const [iniciarAnimacion, setIniciarAnimacion] = useState(false);
  const [umbral, setUmbral] = useState(0.5)

  // Estados para los inputs de coordenadas
  const [inputCoordX, setInputCoordX] = useState<string>("");
  const [inputCoordY, setInputCoordY] = useState<string>("");

  // Parámetros para los cálculos de trayectoria
  const timeStep = 0.1; // Intervalo de tiempo para cálculos

  // Datos para la trayectoria parabólica
  const trajectoryData = useMemo(() => ({
    initialPosition: { x: 0, y: 0 }, // El cañón está en el origen
    initialSpeed: velocidadCañon,
    angle: anguloCañon,
    timeStep,
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

  // Calcular intercepción entre trayectorias solo si hay un punto seleccionado
  const interceptionResult = useInterception(trajectoryData, freeFallData, umbral);
  
  // Modificar el resultado de intercepción para que nunca haya intercepción si no hay punto seleccionado
  const interception: InterceptionResult = useMemo(() => {
    if (!puntoSeleccionado) {
      // Devolver un objeto compatible con InterceptionResult pero sin intercepción
      return {
        intercepted: false,
        minDistance: Infinity,
        point: undefined,
        timeParabolic: undefined,
        timeFreefall: undefined,
        // Propiedades adicionales requeridas:
        timeParabolicAtMin: 0,
        timeFreefallAtMin: 0,
        pointParabolicAtMin: { x: 0, y: 0 },
        pointFreefallAtMin: { x: 0, y: 0 }
      };
    }
    return interceptionResult;
  }, [interceptionResult, puntoSeleccionado]);
  
  // Determinar si debemos mostrar resultados de intercepción
  const showInterception = puntoSeleccionado !== null;

  // Efecto para actualizar los inputs cuando puntoSeleccionado cambia
  useEffect(() => {
    if (puntoSeleccionado) {
      setInputCoordX(puntoSeleccionado.x.toString());
      setInputCoordY(puntoSeleccionado.y.toString());
    } else {
      setInputCoordX("");
      setInputCoordY("");
    }
  }, [puntoSeleccionado]);

  const handleAnguloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoAngulo = Number.parseFloat(e.target.value);
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
    const nuevaEscala = Number.parseFloat(e.target.value);
    setEscalaCanvas(nuevaEscala);
  };

  // Manejadores para los inputs de coordenadas
  const handleInputCoordXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCoordX(e.target.value);
  };

  const handleInputCoordYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCoordY(e.target.value);
  };

  // Función para establecer el punto seleccionado desde los inputs
  const handleSetPuntoManualmente = () => {
    const x = Number.parseFloat(inputCoordX);
    const y = Number.parseFloat(inputCoordY);

    if (!Number.isNaN(x) && !Number.isNaN(y)) {
      setPuntoSeleccionado({ x, y });
      setIniciarAnimacion(false); // Reset animación
    } else {
      // Opcional: manejar error si la entrada no es válida
      console.warn("Coordenadas ingresadas no válidas");
    }
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
                intervaloMarcas={250}
                ancho={1000}
                alto={600}
                anguloInicial={anguloCañon}
                velocidadInicial={velocidadCañon}
                onClickPunto={handlePuntoSeleccionado}
                puntoSeleccionado={puntoSeleccionado}
                puntosTrayectoria={trajectory}
                puntosFreeFall={showInterception ? freeFallTrajectory : []}
                velocidadAnimacion={100}
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
              // Nuevas props para coordenadas manuales
              inputCoordX={inputCoordX}
              inputCoordY={inputCoordY}
              onInputCoordXChange={handleInputCoordXChange}
              onInputCoordYChange={handleInputCoordYChange}
              onSetPuntoManualmente={handleSetPuntoManualmente}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
