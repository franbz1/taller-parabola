import { useState } from 'react'
import './App.css'
import InputForm from './components/InputForm'
import { FormData } from './components/InputForm'


function App() {
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    console.log('Datos recibidos:', data);
    // Aquí se podría realizar cálculos con los datos recibidos
  };

  return (
    <div className="app-container">
      <header>
        <h1>Simulador de Trayectoria Parabólica</h1>
      </header>
      <main>
        <InputForm onSubmit={handleFormSubmit} />
        
        {formData && (
          <div className="results-container">
            <h2>Parámetros Configurados</h2>
            <ul>
              <li><strong>Velocidad inicial del cañón:</strong> {formData.cannonInitialSpeed} m/s</li>
              <li><strong>Ángulo del cañón:</strong> {formData.cannonAngle}°</li>
              <li><strong>Velocidad del avión:</strong> {formData.planeSpeed} m/s</li>
              <li><strong>Altura del avión:</strong> {formData.planeHeight} m</li>
            </ul>
            {/* Aquí se podrían mostrar los resultados de los cálculos */}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
