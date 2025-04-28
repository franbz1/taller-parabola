import { useState } from 'react';
import './InputForm.css';

export interface FormData {
  defensorInitialSpeed: number;
  defensorAngle: number;
  targetDistance: number;
  enemyHeight: number;
  defensorPosition: number;
}

// Para la primera etapa solo enviamos la información del objetivo
export interface TargetData {
  targetDistance: number;
  enemyHeight: number;
  defensorPosition: number;
}

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  onShowTarget: (data: TargetData) => void;
}

export default function InputForm({ onSubmit, onShowTarget }: InputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    defensorInitialSpeed: 30,
    defensorAngle: 45,
    targetDistance: 100,
    enemyHeight: 100,
    defensorPosition: 20
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [targetShown, setTargetShown] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const validateTarget = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (formData.targetDistance <= 0) {
      newErrors.targetDistance = "La distancia al objetivo debe ser mayor a 0";
    }
    
    if (formData.enemyHeight <= 0) {
      newErrors.enemyHeight = "La altura del misil enemigo debe ser mayor a 0";
    }
    
    if (formData.defensorPosition < 0 || formData.defensorPosition >= formData.targetDistance) {
      newErrors.defensorPosition = "La posición del defensor debe estar entre 0 y la distancia a la ciudad";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDefensor = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (formData.defensorInitialSpeed <= 0) {
      newErrors.defensorInitialSpeed = "La velocidad inicial debe ser mayor a 0";
    }
    
    if (formData.defensorAngle < 0 || formData.defensorAngle > 90) {
      newErrors.defensorAngle = "El ángulo debe estar entre 0 y 90 grados";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShowTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateTarget()) {
      const targetData: TargetData = {
        targetDistance: formData.targetDistance,
        enemyHeight: formData.enemyHeight,
        defensorPosition: formData.defensorPosition
      };
      onShowTarget(targetData);
      setTargetShown(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDefensor()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="form-container">
      <h2>Configuración de Parámetros</h2>
      
      {/* Primera etapa: datos del objetivo */}
      <form onSubmit={handleShowTarget}>
        <div className="target-setup">
          <h3>Configuración del Objetivo</h3>
          
          <div className="form-group">
            <label htmlFor="targetDistance">Distancia a la ciudad (m):</label>
            <input
              type="number"
              id="targetDistance"
              name="targetDistance"
              value={formData.targetDistance}
              onChange={handleChange}
              step="1"
              min="1"
              disabled={targetShown}
            />
            {errors.targetDistance && <span className="error">{errors.targetDistance}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="enemyHeight">Altura inicial del misil enemigo (m):</label>
            <input
              type="number"
              id="enemyHeight"
              name="enemyHeight"
              value={formData.enemyHeight}
              onChange={handleChange}
              step="1"
              min="1"
              disabled={targetShown}
            />
            {errors.enemyHeight && <span className="error">{errors.enemyHeight}</span>}
          </div>
          
         
          
          {!targetShown && (
            <button type="submit" className="submit-btn">Mostrar en el plano</button>
          )}
        </div>
      </form>
      
      {/* Segunda etapa: datos del defensor (se muestra solo después de mostrar el objetivo) */}
      {targetShown && (
        <form onSubmit={handleSubmit}>
          <div className="defensor-setup">
            <h3>Configuración del Misil Defensor</h3>
            
            <div className="form-group">
              <label htmlFor="defensorInitialSpeed">Velocidad inicial del misil defensor (m/s):</label>
              <input
                type="number"
                id="defensorInitialSpeed"
                name="defensorInitialSpeed"
                value={formData.defensorInitialSpeed}
                onChange={handleChange}
                step="0.1"
                min="0.1"
              />
              {errors.defensorInitialSpeed && <span className="error">{errors.defensorInitialSpeed}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="defensorAngle">Ángulo de lanzamiento (grados):</label>
              <input
                type="number"
                id="defensorAngle"
                name="defensorAngle"
                value={formData.defensorAngle}
                onChange={handleChange}
                min="0"
                max="90"
                step="0.1"
              />
              {errors.defensorAngle && <span className="error">{errors.defensorAngle}</span>}
            </div>

            <button type="submit" className="submit-btn">Simular</button>
          </div>
        </form>
      )}
      
      {/* Botón para reiniciar la configuración */}
      {targetShown && (
        <button 
          className="reset-btn" 
          onClick={() => setTargetShown(false)}
          style={{ marginTop: '20px', backgroundColor: '#7f8c8d' }}
        >
          Reiniciar configuración
        </button>
      )}
    </div>
  );
} 