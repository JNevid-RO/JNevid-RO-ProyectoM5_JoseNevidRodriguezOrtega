# Proyecto Integrador 5 - E-Commerce SPA

Aplicación de e-commerce completa desarrollada con React 18, TypeScript, Vite, Context API, Firebase y AWS S3 con un enfoque modular y arquitectura diferenciada para roles de **Cliente** y **Administrador**.

---

## Stack Tecnológico

- **Core**: React 18 + TypeScript
- **Enrutamiento**: React Router v6
- **Estado Global**: Context API + `useReducer`
- **Autenticación y Base de Datos**: Firebase Auth & Firestore
- **Almacenamiento de Imágenes**: AWS S3 + Vercel Serverless Functions (Presigned URLs)
- **Compilación**: Vite
- **Testing**: Vitest + React Testing Library

---

## Estructura del Proyecto

```
E COMMERCE NEV/
├── api/
│   └── upload-url.ts         # Vercel Serverless Function para Presigned URLs S3
├── src/
│   ├── components/           # Componentes UI reutilizables (Navbar, Layout, ProtectedRoute)
│   ├── contexts/             # Estado global (AuthContext, CartContext, OrdersContext, ThemeContext)
│   ├── data/                 # Datos de catálogo y mock de productos
│   ├── hooks/                # Custom hooks (useDebounce, etc.)
│   ├── lib/                  # Utilidades y formateadores
│   ├── pages/                # Páginas principales (Home, ProductDetail, Cart, Checkout, Orders, Admin, Login)
│   ├── services/             # Servicios externos (Firebase, uploadService)
│   └── types/                # Interfaces TypeScript centralizadas
├── BITACORA_IA.md            # Registro reflexivo sobre decisiones y uso de Inteligencia Artificial
└── README.md
```

---

## Flujo de Seguridad con Presigned URLs (AWS S3)

Para garantizar que las credenciales secretas de AWS nunca se expongan en el código del navegador:

1. El panel de administración envía los metadatos de la imagen a la Vercel Function (`api/upload-url.ts`).
2. La Function (ejecutada exclusivamente del lado del servidor) genera una **Presigned URL** firmada con tiempo de expiración.
3. El frontend recibe la URL firmada y sube la imagen mediante una petición `PUT` directamente al bucket de AWS S3.
4. La URL pública devuelta se almacena en Firestore junto con el producto.

---

## Instalación y Configuración

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno:
   Copia `.env.example` a `.env.local` y agrega tus credenciales de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Ejecutar la suite de pruebas unitarias:
   ```bash
   npm run test
   ```

---

## Bitácora de Uso de IA

El desarrollo técnico de este proyecto contó con la asistencia de Inteligencia Artificial para el análisis de decisiones de diseño, patrones de estado inmutable y estrategias de testing. Toda la documentación se encuentra registrada en [BITACORA_IA.md](./BITACORA_IA.md).
