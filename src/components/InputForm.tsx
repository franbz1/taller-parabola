import { useState } from 'react';
import './InputForm.css';

export interface FormData {
  cannonInitialSpeed: number;
  cannonAngle: number;
  planeSpeed: number;
  planeHeight: number;
}

interface InputFormProps {
  onSubmit: (data: FormData) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    cannonInitialSpeed: 0,
    cannonAngle: 45,
    planeSpeed: 0,
    planeHeight: 0
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (formData.cannonInitialSpeed <= 0) {
      newErrors.cannonInitialSpeed = "La velocidad inicial debe ser mayor a 0";
    }
    
    if (formData.cannonAngle < 0 || formData.cannonAngle > 90) {
      newErrors.cannonAngle = "El ángulo debe estar entre 0 y 90 grados";
    }
    
    if (formData.planeSpeed <= 0) {
      newErrors.planeSpeed = "La velocidad del avión debe ser mayor a 0";
    }
    
    if (formData.planeHeight <= 0) {
      newErrors.planeHeight = "La altura del avión debe ser mayor a 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="form-container">
      <h2>Configuración de Parámetros</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cannonInitialSpeed">Velocidad inicial del cañón (m/s):</label>
          <input
            type="number"
            id="cannonInitialSpeed"
            name="cannonInitialSpeed"
            value={formData.cannonInitialSpeed}
            onChange={handleChange}
            step="0.1"
            min="0.1"
          />
          {errors.cannonInitialSpeed && <span className="error">{errors.cannonInitialSpeed}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cannonAngle">Ángulo del cañón (grados):</label>
          <input
            type="number"
            id="cannonAngle"
            name="cannonAngle"
            value={formData.cannonAngle}
            onChange={handleChange}
            min="0"
            max="90"
            step="0.1"
          />
          {errors.cannonAngle && <span className="error">{errors.cannonAngle}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="planeSpeed">Velocidad del avión (m/s):</label>
          <input
            type="number"
            id="planeSpeed"
            name="planeSpeed"
            value={formData.planeSpeed}
            onChange={handleChange}
            step="0.1"
            min="0.1"
          />
          {errors.planeSpeed && <span className="error">{errors.planeSpeed}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="planeHeight">Altura del avión (m):</label>
          <input
            type="number"
            id="planeHeight"
            name="planeHeight"
            value={formData.planeHeight}
            onChange={handleChange}
            step="0.1"
            min="0.1"
          />
          {errors.planeHeight && <span className="error">{errors.planeHeight}</span>}
        </div>

        <button type="submit" className="submit-btn">Calcular</button>
      </form>
    </div>
  );
} 