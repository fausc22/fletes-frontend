# Sistema de Fletes - Frontend

Sistema de gestión integral para fletes y transporte de cargas.

## 🚛 Características

- **Gestión de Camiones**: Control de flota completo
- **Registro de Viajes**: Seguimiento de rutas y cargas
- **Control de Gastos**: Registro detallado de gastos operativos
- **Gestión de Ingresos**: Control de facturación y cobros
- **Análisis de Rutas**: Optimización de trayectos
- **Reportes y Estadísticas**: Dashboard completo de métricas
- **PWA Móvil**: Aplicación optimizada para uso móvil

## 🔧 Tecnologías

- **Next.js 15** - Framework React
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **React Hot Toast** - Notificaciones
- **Next PWA** - Aplicación web progresiva
- **Axios** - Cliente HTTP

## 🚀 Instalación

```bash
# Clonar repositorio
git clone [url-repositorio]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## 🌐 Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📱 PWA

El sistema está optimizado como PWA y puede instalarse en dispositivos móviles y desktop para una experiencia nativa.

## 🔐 Autenticación

Sistema de autenticación simplificado con:
- JWT tokens
- Refresh tokens (7 días)
- Persistencia en localStorage
- Renovación automática

## 📦 Estructura del Proyecto

```
├── components/         # Componentes React
├── hooks/             # Hooks personalizados
├── pages/             # Páginas Next.js
├── public/            # Archivos estáticos
├── styles/            # Estilos CSS
└── utils/             # Utilidades
```

## 🎯 Funcionalidades Principales

### Viajes
- Nuevo viaje
- Viajes activos
- Historial
- Planificación

### Camiones
- Gestión de flota
- Mantenimientos
- Documentación
- Control de estado

### Finanzas
- Registro de ingresos
- Control de gastos
- Facturas pendientes
- Análisis de rentabilidad

### Estadísticas
- Dashboard general
- Reportes mensuales
- Métricas por camión
- Exportación de datos

## 🔧 Desarrollo

```bash
# Modo desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.