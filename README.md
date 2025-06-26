# 🎯 Simulador de Movimiento Parabólico

Una aplicación web interactiva desarrollada en React y TypeScript que simula el movimiento parabólico de proyectiles y la intercepción con objetos en caída libre.

![image](https://github.com/user-attachments/assets/37ea4681-455d-4ff1-a0f8-aa5c3000d5c5)

## 🌟 Características

- **Simulación de Trayectoria Parabólica**: Visualización en tiempo real del movimiento de proyectiles
- **Caída Libre**: Simulación de objetos que caen desde puntos específicos
- **Detección de Intercepción**: Cálculo automático de colisiones entre trayectorias
- **Animaciones Fluidas**: Representación visual con efectos de disparo y explosión
- **Controles Interactivos**: Ajuste de parámetros en tiempo real
- **Plano Cartesiano**: Visualización gráfica con sistema de coordenadas
- **Cálculos Físicos Precisos**: Implementación de ecuaciones de cinemática

## 🚀 Demo en Vivo

El proyecto está desplegado y disponible en: [GitHub Pages](https://franbz1.github.io/taller-parabola/)

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de desarrollo rápida
- **Canvas API** - Renderizado de gráficos 2D
- **Vitest** - Framework de testing
- **ESLint** - Linter de código

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/taller-parabola.git
   cd taller-parabola
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador** en `http://localhost:5173`

## 📖 Uso

### Controles Principales

1. **Configuración del Cañón**:
   - **Ángulo**: Ajusta el ángulo de disparo (0-90 grados)
   - **Velocidad**: Establece la velocidad inicial del proyectil (m/s)

2. **Selección de Punto**:
   - Haz clic en cualquier punto del plano cartesiano para colocar un objeto en caída libre
   - También puedes ingresar coordenadas manualmente

3. **Parámetros de Simulación**:
   - **Escala**: Modifica el zoom del plano cartesiano
   - **Umbral de Intercepción**: Define la precisión para detectar colisiones

4. **Controles de Animación**:
   - **Iniciar**: Comienza la animación de las trayectorias
   - **Reiniciar**: Reinicia la simulación desde el principio

### Funciones Avanzadas

- **Cálculo de Intercepción**: El sistema calcula automáticamente si el proyectil interceptará el objeto en caída libre
- **Parámetros Óptimos**: Calcula el ángulo y velocidad necesarios para interceptar en una altura específica
- **Datos en Tiempo Real**: Visualiza alcance, altura máxima y tiempo de vuelo

## 🧮 Fundamentos Físicos

La aplicación implementa las ecuaciones fundamentales de la cinemática:

### Movimiento Parabólico
- **Posición horizontal**: `x = v₀ * cos(θ) * t`
- **Posición vertical**: `y = v₀ * sin(θ) * t - ½ * g * t²`
- **Alcance máximo**: `R = v₀² * sin(2θ) / g`
- **Altura máxima**: `h = v₀² * sin²(θ) / (2g)`

### Caída Libre
- **Posición vertical**: `y = y₀ - ½ * g * t²`
- **Posición horizontal**: `x = x₀ + vₓ * t`

Donde:
- `v₀` = velocidad inicial
- `θ` = ángulo de lanzamiento
- `g` = aceleración gravitacional (9.80665 m/s²)
- `t` = tiempo

## 🧪 Testing

El proyecto incluye una suite completa de pruebas unitarias:

```bash
# Ejecutar tests una vez
npm run test

# Ejecutar tests en modo watch
npm run test:watch
```

Los tests cubren:
- Cálculos de trayectoria parabólica
- Simulación de caída libre
- Detección de intercepción
- Validación de constantes físicas

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── canvas/          # Componentes de renderizado Canvas
│   │   ├── PlanoCartesiano.tsx
│   │   ├── dibujante-*.ts
│   │   └── controlador-trayectoria.tsx
│   └── DatosSimulacion.tsx
├── hooks/               # Hooks personalizados
│   └── useParabolicMotion.ts
├── lib/                 # Lógica de negocio
│   └── parabolicMotion.ts
└── App.tsx             # Componente principal
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run test` - Ejecuta las pruebas
- `npm run lint` - Ejecuta el linter de código

## 🎨 Personalización

### Parámetros Configurables

Puedes modificar las siguientes constantes en `src/lib/parabolicMotion.ts`:

- `GRAVITY`: Aceleración gravitacional (por defecto: 9.80665 m/s²)
- `DEG_TO_RAD`: Factor de conversión de grados a radianes

### Estilos y Animaciones

Los estilos visuales se pueden personalizar en:
- `src/App.css` - Estilos principales
- `src/components/canvas/dibujante-*.ts` - Configuración de colores y efectos

## 🎓 Contexto Educativo

Este proyecto fue desarrollado como material educativo para la enseñanza de conceptos de física, específicamente:

- Cinemática de proyectiles
- Movimiento parabólico
- Caída libre
- Intersección de trayectorias
- Aplicación práctica de ecuaciones diferenciales

## 🐛 Problemas Conocidos

Si encuentras algún problema, por favor reportarlo en la sección de [Issues](https://github.com/tu-usuario/taller-parabola/issues).

---

⭐ Si este proyecto te resulta útil, ¡no olvides darle una estrella!
