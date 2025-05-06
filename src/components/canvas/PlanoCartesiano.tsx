import { useEffect, useRef, useState } from "react"
import { DibujanteCanvas } from "./dibujante-canvas"
import { ControladorTrayectoria } from "./controlador-trayectoria"
import { canvasACoordenadas } from "./utilidades"
import { Point, InterceptionResult } from "../../lib/parabolicMotion"

interface PlanoCartesianoProps {
  /**
   * Escala para las unidades del plano (por ejemplo, 10 mostrará marcas cada 10 píxeles)
   */
  escala: number
  /**
   * Intervalo para mostrar las marcas numéricas (por ejemplo, 2 mostrará números en cada 2 unidades de escala)
   */
  intervaloMarcas?: number
  /**
   * Ancho del canvas en píxeles
   */
  ancho?: number
  /**
   * Alto del canvas en píxeles
   */
  alto?: number
  /**
   * Función que se ejecuta al hacer clic en un punto, devuelve las coordenadas
   */
  onClickPunto?: (coordenadas: Point) => void
  /**
   * Ángulo inicial del cañón en grados
   */
  anguloInicial?: number
  /**
   * Velocidad inicial del cañón en m/s
   */
  velocidadInicial?: number
  /**
   * Punto seleccionado en el plano
   */
  puntoSeleccionado?: Point | null
  /**
   * Array de puntos para la trayectoria del proyectil
   */
  puntosTrayectoria?: Point[]
  /**
   * Array de puntos para la trayectoria de caída libre
   */
  puntosFreeFall?: Point[]
  /**
   * Velocidad de la animación (ms entre puntos)
   */
  velocidadAnimacion?: number
  /**
   * Si se debe iniciar la animación
   */
  iniciarAnimacion?: boolean
  /**
   * Resultado de la intercepción entre trayectorias
   */
  interception?: InterceptionResult
}

/**
 * Componente que muestra un plano cartesiano 2D con un cañón en el origen
 * que puede ajustarse mediante controles externos y animar trayectorias.
 */
export const PlanoCartesiano = ({
  escala = 20,
  intervaloMarcas = 1,
  ancho = 600,
  alto = 400,
  onClickPunto,
  anguloInicial = 0,
  velocidadInicial = 10,
  puntoSeleccionado = null,
  puntosTrayectoria = [],
  puntosFreeFall = [],
  velocidadAnimacion = 100,
  iniciarAnimacion = false,
  interception
}: PlanoCartesianoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animando, setAnimando] = useState(false)
  const [puntosVisiblesTrayectoria, setPuntosVisiblesTrayectoria] = useState<Point[]>([])
  const [puntosVisiblesFreeFall, setPuntosVisiblesFreeFall] = useState<Point[]>([])
  const [mostrarExplosion, setMostrarExplosion] = useState(false)
  const [interceptoPuntos, setInterceptoPuntos] = useState(false)
  
  // Referencias a los controladores para poder detenerlos cuando cambia iniciarAnimacion
  const controladorTrayectoriaRef = useRef<ControladorTrayectoria | null>(null)
  const controladorFreeFallRef = useRef<ControladorTrayectoria | null>(null)

  // Manejador de clic en el canvas
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    // Calcular el origen (esquina inferior izquierda)
    const origenX = 40 // Margen para los números
    const origenY = alto - 40 // Margen para los números

    // Convertir coordenadas del canvas a coordenadas del plano
    const coordenadas = canvasACoordenadas(canvasX, canvasY, origenX, origenY, escala)

    // Llamar al callback si existe
    if (onClickPunto) {
      onClickPunto(coordenadas)
    }
  }

  // Efecto para dibujar el plano cuando cambian las propiedades
  useEffect(() => {
    const dibujante = new DibujanteCanvas(canvasRef.current, {
      escala,
      intervaloMarcas,
      ancho,
      alto,
      anguloInicial,
      velocidadInicial
    })
    
    // Punto de intercepción si existe
    const puntoIntercepcion = interception?.intercepted && interception.point ? interception.point : null;
    
    dibujante.dibujarPlano(
      puntoSeleccionado, 
      puntosVisiblesTrayectoria,
      puntosVisiblesFreeFall,
      puntoIntercepcion,
      mostrarExplosion
    )
  }, [
    escala, 
    intervaloMarcas, 
    ancho, 
    alto, 
    anguloInicial, 
    velocidadInicial, 
    puntoSeleccionado, 
    puntosVisiblesTrayectoria,
    puntosVisiblesFreeFall,
    interception,
    mostrarExplosion
  ])
  
  // Efecto para reiniciar los puntos visibles cuando cambia la trayectoria
  useEffect(() => {
    setPuntosVisiblesTrayectoria([])
    setPuntosVisiblesFreeFall([])
    setAnimando(false)
    setMostrarExplosion(false)
    setInterceptoPuntos(false)
    
    // Detener cualquier animación en curso
    if (controladorTrayectoriaRef.current) {
      controladorTrayectoriaRef.current.detenerAnimacion()
      controladorTrayectoriaRef.current = null
    }
    
    if (controladorFreeFallRef.current) {
      controladorFreeFallRef.current.detenerAnimacion()
      controladorFreeFallRef.current = null
    }
  }, [puntosTrayectoria, puntosFreeFall])

  // Efecto para controlar la animación de la trayectoria del proyectil
  useEffect(() => {
    // Detener animación previa si existe
    if (controladorTrayectoriaRef.current) {
      controladorTrayectoriaRef.current.detenerAnimacion()
      controladorTrayectoriaRef.current = null
    }
    
    // No iniciar nada si no hay puntos o no se debe iniciar
    if (puntosTrayectoria.length === 0 || !iniciarAnimacion) {
      setPuntosVisiblesTrayectoria([]);
      return;
    }

    const controladorTrayectoria = new ControladorTrayectoria(
      puntosTrayectoria,
      setPuntosVisiblesTrayectoria,
      setAnimando,
      velocidadAnimacion
    )
    
    // Guardar referencia para poder detenerlo después
    controladorTrayectoriaRef.current = controladorTrayectoria;

    // Iniciar animación
    controladorTrayectoria.iniciarAnimacion()

    return () => {
      if (controladorTrayectoriaRef.current) {
        controladorTrayectoriaRef.current.detenerAnimacion()
      }
    }
  }, [puntosTrayectoria, velocidadAnimacion, iniciarAnimacion])

  // Efecto para controlar la animación de la trayectoria de caída libre
  useEffect(() => {
    // Detener animación previa si existe
    if (controladorFreeFallRef.current) {
      controladorFreeFallRef.current.detenerAnimacion()
      controladorFreeFallRef.current = null
    }
    
    // No iniciar nada si no hay puntos o no se debe iniciar
    if (puntosFreeFall.length === 0 || !iniciarAnimacion) {
      setPuntosVisiblesFreeFall([]);
      return;
    }

    const controladorFreeFall = new ControladorTrayectoria(
      puntosFreeFall,
      setPuntosVisiblesFreeFall,
      // No modificamos el estado de animación ya que eso lo hace el controlador 
      // de la trayectoria principal
      () => {},
      velocidadAnimacion
    )
    
    // Guardar referencia para poder detenerlo después
    controladorFreeFallRef.current = controladorFreeFall;

    // Iniciar animación
    controladorFreeFall.iniciarAnimacion()

    return () => {
      if (controladorFreeFallRef.current) {
        controladorFreeFallRef.current.detenerAnimacion()
      }
    }
  }, [puntosFreeFall, velocidadAnimacion, iniciarAnimacion])

  // Efecto para detectar si hay intercepción entre los puntos visibles de ambas trayectorias
  useEffect(() => {
    // Solo verificar si hay interception y no se ha interceptado aún
    if (!interception?.intercepted || interceptoPuntos || !animando) {
      return;
    }

    // Si hay puntos en ambas trayectorias y hay interception
    if (puntosVisiblesTrayectoria.length > 0 && puntosVisiblesFreeFall.length > 0) {
      const tiempoParabolicoInterceptacion = interception.timeParabolic ?? 0;
      const puntoActualTrayectoria = puntosVisiblesTrayectoria.length - 1;
      const tiempoActualTrayectoria = puntoActualTrayectoria * (velocidadAnimacion / 1000);

      // Si ya pasamos el tiempo de intercepción en la animación
      if (tiempoActualTrayectoria >= tiempoParabolicoInterceptacion) {
        // Detener animaciones
        if (controladorTrayectoriaRef.current) {
          controladorTrayectoriaRef.current.detenerAnimacion();
        }
        if (controladorFreeFallRef.current) {
          controladorFreeFallRef.current.detenerAnimacion();
        }

        // Mostrar explosión
        setMostrarExplosion(true);
        setInterceptoPuntos(true);
        
        // Reproducir sonido de explosión (opcional)
        try {
          const audio = new Audio('/static/medium-explosion-40472.mp3');
          audio.play().catch(error => console.log('Error al reproducir sonido', error));
        } catch {
          console.log('Navegador no soporta reproducción de audio');
        }
      }
    }

  }, [
    puntosVisiblesTrayectoria, 
    puntosVisiblesFreeFall, 
    interception, 
    interceptoPuntos, 
    animando, 
    velocidadAnimacion
  ]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <canvas
        ref={canvasRef}
        width={ancho}
        height={alto}
        onClick={handleClick}
        style={{
          border: '1px solid #d1d5db',
          cursor: 'crosshair'
        }}
      />
      {animando && !mostrarExplosion && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px', 
          backgroundColor: '#fef9c3', 
          color: '#854d0e',
          borderRadius: '4px' 
        }}>
          Animando trayectorias...
        </div>
      )}
      
      {mostrarExplosion && interception?.intercepted && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px', 
          backgroundColor: '#f87171', 
          color: '#ffffff',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          ¡BOOM! Colisión detectada en el punto ({interception.point?.x.toFixed(1)}, {interception.point?.y.toFixed(1)})
        </div>
      )}
    </div>
  )
}

export default PlanoCartesiano