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
   * Resultado de intercepción
   */
  interception: InterceptionResult;
  /**
   * Si se debe mostrar el resultado de intercepción
   */
  showInterception: boolean;
  /**
   * Altura deseada para interceptación
   */
  interceptHeight: string;
  /**
   * Manejador de evento para cambio de altura de interceptación
   */
  onInterceptHeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Parámetros de lanzamiento calculados para interceptación
   */
  launchParams?: { angle: number; speed: number };
  /**
   * Error de cálculo de interceptación
   */
  launchError?: string;
  /**
   * Método para aplicar parámetros de lanzamiento calculados
   */
  onApplyLaunchParams?: () => void;

  // Nuevas props para coordenadas manuales
  inputCoordX: string;
  onInputCoordXChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputCoordY: string;
  onInputCoordYChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetPuntoManualmente: () => void;
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
  interception,
  showInterception,
  // Props para altura de interceptación
  interceptHeight,
  onInterceptHeightChange,
  launchParams,
  launchError,
  onApplyLaunchParams,
  // Props para coordenadas manuales
  inputCoordX,
  onInputCoordXChange,
  inputCoordY,
  onInputCoordYChange,
  onSetPuntoManualmente
}) => {
  // Estilos reutilizables
  const sectionStyle = {
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500' as const,
    marginBottom: '4px',
    color: '#333'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 500 as const,
    fontSize: '14px',
    transition: 'background-color 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50'
  };

  const headingStyle = {
    fontSize: '16px',
    marginTop: 0,
    marginBottom: '12px',
    color: '#444',
    fontWeight: '600' as const
  };

  return (
    <div style={{
      width: '100%',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      border: '1px solid #e9ecef'
    }}>
      <h3 style={{ 
        marginTop: '0', 
        marginBottom: '20px', 
        fontSize: '18px',
        color: '#333',
        fontWeight: '600'
      }}>Panel de Control</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Panel de parámetros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Control del cañón */}
          <div style={sectionStyle}>
            <h4 style={headingStyle}>Parámetros del Cañón</h4>
            
            {/* Control de ángulo */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="angulo-canon" style={labelStyle}>
                Ángulo del cañón (grados):
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ flex: '1' }}>
                  <input
                    id="angulo-canon"
                    type="range"
                    min="0"
                    max="90"
                    step="0.01"
                    value={anguloCañon}
                    onChange={onAnguloChange}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '80px' }}>
                  <input
                    id="angulo-canon-input"
                    type="number"
                    min="0"
                    max="90"
                    step="0.01"
                    value={anguloCañon}
                    onChange={onAnguloChange}
                    style={{
                      width: '60px',
                      padding: '6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      textAlign: 'right'
                    }}
                  />
                  <div style={{ minWidth: '15px' }}>
                    °
                  </div>
                </div>
              </div>
            </div>

            {/* Control de velocidad */}
            <div style={{ marginBottom: '0' }}>
              <label htmlFor="velocidad-canon" style={labelStyle}>
                Velocidad inicial (m/s):
              </label>
              <input
                id="velocidad-canon"
                type="number"
                min="0.1"
                step="0.1"
                value={velocidadCañon}
                onChange={onVelocidadChange}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Control de escala y umbral */}
          <div style={sectionStyle}>
            <h4 style={headingStyle}>Configuración de Visualización</h4>
            
            {/* Control de escala */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="escala-canvas" style={labelStyle}>
                Escala del canvas: {escala}
              </label>
              <input
                id="escala-canvas"
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={escala}
                onChange={onEscalaChange}
                style={{ width: '100%' }}
              />
            </div>

            {/* Control de umbral */}
            <div>
              <label htmlFor="umbral-deteccion" style={labelStyle}>
                Umbral de detección (m):
              </label>
              <input
                id="umbral-deteccion"
                type="number"
                min="0.1"
                step="0.1"
                value={umbral}
                onChange={onumbralChange}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Panel de objetivos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Coordenadas del avión */}
          <div style={sectionStyle}>
            <h4 style={headingStyle}>Avión Bombardero</h4>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label htmlFor="coord-x-input" style={labelStyle}>
                    Coordenada X:
                  </label>
                  <input
                    id="coord-x-input"
                    type="number"
                    step="0.1"
                    value={inputCoordX}
                    onChange={onInputCoordXChange}
                    placeholder="X"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="coord-y-input" style={labelStyle}>
                    Coordenada Y:
                  </label>
                  <input
                    id="coord-y-input"
                    type="number"
                    step="0.1"
                    value={inputCoordY}
                    onChange={onInputCoordYChange}
                    placeholder="Y"
                    style={inputStyle}
                  />
                </div>
              </div>
              <button 
                onClick={onSetPuntoManualmente}
                style={buttonStyle}
              >
                Establecer Posición
              </button>
            </div>

            {/* Input para altura de interceptación, solo visible si hay punto seleccionado */}
            {puntoSeleccionado && (
              <div>
                <label htmlFor="intercept-height" style={labelStyle}>
                  Altura de interceptación deseada (m):
                </label>
                <input
                  id="intercept-height"
                  type="number"
                  min="0"
                  step="0.1"
                  value={interceptHeight}
                  onChange={onInterceptHeightChange}
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* Panel para aplicar parámetros calculados */}
          {launchParams && (
            <div style={{
              ...sectionStyle,
              backgroundColor: '#e8f5e9',
              border: '1px solid #c8e6c9'
            }}>
              <h4 style={headingStyle}>Parámetros Calculados</h4>
              <div style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '14px' }}>
                <div><strong>Ángulo óptimo:</strong> {launchParams.angle.toFixed(4)}°</div>
                <div><strong>Velocidad óptima:</strong> {launchParams.speed.toFixed(4)} m/s</div>
              </div>
              <button
                onClick={onApplyLaunchParams}
                style={primaryButtonStyle}
                disabled={!onApplyLaunchParams}
              >
                Aplicar estos Parámetros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sección de resultados */}
      <div style={{ 
        marginTop: '20px', 
        backgroundColor: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h4 style={{ ...headingStyle, marginBottom: '16px' }}>Resultados de la Simulación</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {/* Resultados de la trayectoria parabólica */}
          <div style={{
            padding: '12px',
            backgroundColor: '#e6f7ff',
            borderRadius: '6px',
            border: '1px solid #91d5ff'
          }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600', color: '#0070c0' }}>Trayectoria del Proyectil</h5>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              <div><strong>Alcance máximo:</strong> {range.toFixed(4)} m</div>
              <div><strong>Altura máxima:</strong> {maxHeight.toFixed(4)} m</div>
              <div><strong>Tiempo de vuelo:</strong> {flightTime.toFixed(4)} s</div>
            </div>
          </div>

          {/* Punto seleccionado */}
          {puntoSeleccionado && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fff7e6',
              borderRadius: '6px',
              border: '1px solid #ffd591'
            }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600', color: '#d48806' }}>Objeto en Caída</h5>
              <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                <div><strong>Posición inicial:</strong> ({puntoSeleccionado.x.toFixed(2)}, {puntoSeleccionado.y.toFixed(2)})</div>
                {interceptHeight && <div><strong>Altura de intercepción:</strong> {interceptHeight} m</div>}
              </div>
            </div>
          )}

          {/* Resultado de interceptación */}
          {showInterception && (
            <div style={{
              padding: '12px',
              backgroundColor: interception.intercepted ? '#f6ffed' : '#fff1f0',
              borderRadius: '6px',
              border: `1px solid ${interception.intercepted ? '#b7eb8f' : '#ffa39e'}`
            }}>
              <h5 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '15px', 
                fontWeight: '600', 
                color: interception.intercepted ? '#52c41a' : '#f5222d'
              }}>
                Estado de Intercepción
              </h5>
              {interception.intercepted ? (
                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <div><strong>¡Interceptado!</strong></div>
                  <div><strong>Posición:</strong> ({interception.point?.x.toFixed(4)}, {interception.point?.y.toFixed(4)})</div>
                  <div><strong>Tiempo proyectil:</strong> {interception.timeParabolic?.toFixed(4)} s</div>
                  <div><strong>Tiempo objeto:</strong> {interception.timeFreefall?.toFixed(4)} s</div>
                </div>
              ) : (
                <div style={{ fontSize: '13px' }}>
                  <div><strong>No hubo intercepción</strong></div>
                  <div><strong>Distancia mínima:</strong> {interception.minDistance.toFixed(4)} m</div>
                </div>
              )}
            </div>
          )}

          {/* Mensaje de error en cálculo */}
          {launchError && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fff1f0',
              borderRadius: '6px',
              border: '1px solid #ffa39e'
            }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600', color: '#f5222d' }}>Error de Cálculo</h5>
              <div style={{ fontSize: '13px', color: '#cf1322' }}>
                {launchError}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatosSimulacion; 