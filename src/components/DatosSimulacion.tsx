import React from 'react';
import { InterceptionResult } from '../lib/parabolicMotion';

interface DatosSimulacionProps {
  /**
   * Ángulo del cañón en grados
   */
  anguloCañon: number;
  /**
   * Manejador de evento para cambio de ángulo
   */
  onAnguloChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Velocidad inicial del cañón en m/s
   */
  velocidadCañon: number;
  /**
 * umbral para marcar una intercepcion como valida
 */
  umbral: number;
  /**
 * Manejador de evento para cambio de velocidad
 */
  onumbralChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Manejador de evento para cambio de velocidad
   */
  onVelocidadChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Escala del plano cartesiano
   */
  escala: number;
  /**
   * Manejador de evento para cambio de escala
   */
  onEscalaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Alcance horizontal máximo
   */
  range: number;
  /**
   * Altura máxima de la trayectoria
   */
  maxHeight: number;
  /**
   * Tiempo total de vuelo
   */
  flightTime: number;
  /**
   * Punto seleccionado en el plano
   */
  puntoSeleccionado: { x: number; y: number } | null;
  /**
   * Trayectoria de caída libre
   */
  freeFallTrajectory: { x: number; y: number }[];
  /**
   * Resultado de intercepción
   */
  interception: InterceptionResult;
  /**
   * Si se debe mostrar el resultado de intercepción
   */
  showInterception: boolean;
}

/**
 * Componente que muestra los datos de la simulación
 */
const DatosSimulacion: React.FC<DatosSimulacionProps> = ({
  anguloCañon,
  onAnguloChange,
  velocidadCañon,
  umbral,
  onVelocidadChange,
  onumbralChange,
  escala,
  onEscalaChange,
  range,
  maxHeight,
  flightTime,
  puntoSeleccionado,
  freeFallTrajectory,
  interception,
  showInterception
}) => {
  return (
    <div style={{
      minWidth: '300px',
      padding: '15px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <h3 style={{ marginTop: '0', marginBottom: '15px' }}>Datos de la Simulación</h3>

      {/* Control de escala */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="escala-canvas" style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Escala del canvas: {escala}
        </label>
        <input
          id="escala-canvas"
          type="range"
          min="5"
          max="30"
          step="1"
          value={escala}
          onChange={onEscalaChange}
          style={{
            width: '100%'
          }}
        />
      </div>

      {/* Control de ángulo */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="angulo-canon" style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Ángulo del cañón: {anguloCañon}°
        </label>
        <input
          id="angulo-canon"
          type="range"
          min="0"
          max="90"
          value={anguloCañon}
          onChange={onAnguloChange}
          style={{
            width: '100%'
          }}
        />
      </div>

      {/* Control de velocidad */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="velocidad-canon" style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          Velocidad inicial del cañón (m/s):
        </label>
        <input
          id="velocidad-canon"
          type="number"
          min="0.1"
          step="0.1"
          value={velocidadCañon}
          onChange={onVelocidadChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Control de umbral */}
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="velocidad-canon" style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '4px'
        }}>
          umbral de detección de interceptacion:
        </label>
        <input
          id="velocidad-canon"
          type="number"
          min="0.1"
          step="0.1"
          value={umbral}
          onChange={onumbralChange}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Resultados de la trayectoria parabólica */}
      <div style={{
        marginBottom: '16px',
        padding: '8px',
        backgroundColor: '#e6f7ff',
        borderRadius: '4px',
        border: '1px solid #91d5ff'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Trayectoria del Proyectil</h4>
        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
          <div><strong>Alcance máximo:</strong> {range.toFixed(2)} m</div>
          <div><strong>Altura máxima:</strong> {maxHeight.toFixed(2)} m</div>
          <div><strong>Tiempo de vuelo:</strong> {flightTime.toFixed(2)} s</div>
        </div>
      </div>

      {/* Punto seleccionado */}
      {puntoSeleccionado && (
        <div style={{
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: '#fff7e6',
          borderRadius: '4px',
          border: '1px solid #ffd591'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Objeto en Caída</h4>
          <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
            <div><strong>Posición inicial:</strong> ({puntoSeleccionado.x}, {puntoSeleccionado.y})</div>
            <div><strong>Puntos calculados:</strong> {freeFallTrajectory.length}</div>
          </div>
        </div>
      )}

      {/* Resultado de intercepción */}
      {showInterception && (
        <div style={{
          padding: '8px',
          backgroundColor: interception.intercepted ? '#f6ffed' : '#fff1f0',
          borderRadius: '4px',
          border: `1px solid ${interception.intercepted ? '#b7eb8f' : '#ffa39e'}`
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Intercepción</h4>
          {interception.intercepted ? (
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <div><strong>¡Interceptado!</strong></div>
              <div><strong>Posición:</strong> ({interception.point?.x.toFixed(1)}, {interception.point?.y.toFixed(1)})</div>
              <div><strong>Tiempo proyectil:</strong> {interception.timeParabolic?.toFixed(2)} s</div>
              <div><strong>Tiempo objeto:</strong> {interception.timeFreefall?.toFixed(2)} s</div>
            </div>
          ) : (
            <div style={{ fontSize: '13px' }}>
              <div><strong>No hubo intercepción</strong></div>
              <div><strong>Distancia mínima:</strong> {interception.minDistance.toFixed(2)} m</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatosSimulacion; 