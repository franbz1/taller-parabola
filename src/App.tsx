import './App.css'
import PlanoCartesiano from './components/canvas/PlanoCartesiano';
import DatosSimulacion from './components/DatosSimulacion';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useTrajectory, useFreeFall, useInterception, useInterceptionLaunch } from './hooks/useParabolicMotion';
import { type InterceptionResult } from './lib/parabolicMotion';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 600 });
  const [anguloCañon, setAnguloCañon] = useState(45);
  const [velocidadCañon, setVelocidadCañon] = useState(100);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<{ x: number; y: number } | null>(null);
  const [escalaCanvas, setEscalaCanvas] = useState(0.5);
  const [iniciarAnimacion, setIniciarAnimacion] = useState(false);
  const [umbral, setUmbral] = useState(0.5)
  const [interceptHeight, setInterceptHeight] = useState<string>("");

  // Estados para los inputs de coordenadas
  const [inputCoordX, setInputCoordX] = useState<string>("");
  const [inputCoordY, setInputCoordY] = useState<string>("");

  // Parámetros para los cálculos de trayectoria
  const timeStep = 0.1; // Intervalo de tiempo para cálculos

  // Actualizar tamaño del canvas basado en el tamaño de la ventana
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Calcular altura manteniendo proporción 5:3
        const containerHeight = Math.min(containerWidth * 0.6, 600);
        setCanvasSize({
          width: containerWidth,
          height: containerHeight
        });
      }
    };

    // Inicializar tamaño
    updateCanvasSize();

    // Actualizar tamaño en resize
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

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
  
  // Preparar parámetros para useInterceptionLaunch
  const interceptHeightValue = useMemo(() => {
    if (!interceptHeight || isNaN(parseFloat(interceptHeight)) || parseFloat(interceptHeight) < 0) {
      return undefined;
    }
    return parseFloat(interceptHeight);
  }, [interceptHeight]);

  // Calcular parámetros para interceptación en altura específica
  const interceptionLaunchResult = useInterceptionLaunch(
    puntoSeleccionado || { x: 0, y: 0 },
    interceptHeightValue || 0
  );
  
  // Filtrar resultados cuando no hay datos suficientes
  const { launchParams, error: launchError } = useMemo(() => {
    if (!puntoSeleccionado || !interceptHeightValue) {
      return {};
    }
    return interceptionLaunchResult;
  }, [puntoSeleccionado, interceptHeightValue, interceptionLaunchResult]);
  
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

  const handleInterceptHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterceptHeight(e.target.value);
  };

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
    setTimeout(() => setIniciarAnimacion(true), 100);
  };

  // Aplicar los parámetros de lanzamiento calculados
  const handleApplyLaunchParams = () => {
    if (launchParams) {
      setAnguloCañon(launchParams.angle);
      setVelocidadCañon(launchParams.speed);
      // Resetear animación al aplicar nuevos parámetros
      setIniciarAnimacion(false);
    }
  };

  return (
    <div className="simulator-container" ref={containerRef}>
      <header>
        <h1>Simulador de Trayectoria Parabólica</h1>
        <p>Estudio interactivo de proyectiles y objetos en caída libre</p>
      </header>

      <main>
        <div className="simulator-layout">
          {/* Panel izquierdo: Canvas y controles de animación */}
          <div className="simulator-canvas-panel">
            <div className="canvas-container">
              <PlanoCartesiano
                escala={escalaCanvas}
                intervaloMarcas={250}
                ancho={canvasSize.width}
                alto={canvasSize.height}
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
            </div>
            
              <div style={{ 
                marginTop: '15px', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px',
                flexWrap: 'wrap'
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

              {/* Indicador visual de coordenadas seleccionadas */}
              {puntoSeleccionado && (
                <div className="selected-point-indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Avión en: ({puntoSeleccionado.x.toFixed(1)}, {puntoSeleccionado.y.toFixed(1)})</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Panel derecho: Datos de simulación */}
          <div className="simulator-controls-panel">
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
              interception={interception}
              showInterception={showInterception}
              umbral={umbral}
              onumbralChange={handleUmbralChange}
              interceptHeight={interceptHeight}
              onInterceptHeightChange={handleInterceptHeightChange}
              launchParams={launchParams}
              launchError={launchError}
              onApplyLaunchParams={handleApplyLaunchParams}
              inputCoordX={inputCoordX}
              inputCoordY={inputCoordY}
              onInputCoordXChange={handleInputCoordXChange}
              onInputCoordYChange={handleInputCoordYChange}
              onSetPuntoManualmente={handleSetPuntoManualmente}
            />
          </div>
        </div>
        
        {/* Footer con información adicional */}
        <footer className="simulator-footer">
          <p>Simulador de Trayectoria Parabólica v2.0 | Desarrollado con fines educativos UCC</p>
        </footer>
      </main>
    </div>
  )
}

export default App
