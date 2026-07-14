# Bitácora de Uso de Inteligencia Artificial
**Proyecto Integrador 5 - Especialización Frontend**

---

### Entrada 1: Definición de la Arquitectura de Estado Global y Roles de Usuario
- **Fecha**: 2026-07-21
- **Prompt o Consulta**: *"¿Cuál es la mejor estrategia para gestionar autenticación con Firebase, roles (customer vs admin) y el estado del carrito en React usando Context API y useReducer sin acoplar responsabilidades?"*
- **Aprendizaje / Decisión Técnica**: 
  Se decidió separar los contextos por dominio de responsabilidad:
  1. `AuthContext`: Administra la sesión de Firebase y sincroniza el perfil del usuario desde Firestore (`role: customer | admin`). Maneja un estado intermedio `roleLoading` para evitar redirecciones prematuras en las rutas protegidas.
  2. `CartContext` con `useReducer`: Maneja las transacciones puras del carrito (agregar, eliminar, cambiar cantidad, vaciar). Al estar desacoplado de AuthContext, simplifica las pruebas unitarias y evita renderizados innecesarios.

---

### Entrada 2: Seguridad en Carga de Imágenes con Presigned URLs (AWS S3 + Vercel)
- **Fecha**: 2026-07-21
- **Prompt o Consulta**: *"¿Por qué no debemos usar la SDK de AWS S3 directamente en el frontend para subir imágenes de productos y cómo implementar un flujo seguro con Presigned URLs?"*
- **Aprendizaje / Decisión Técnica**:
  Incrustar las credenciales secretas de AWS en el código cliente expone la infraestructura a ataques y uso no autorizado. La solución recomendada es crear un endpoint serverless (Vercel Serverless Function `api/upload-url.ts`). El frontend solicita una URL firmada a dicho endpoint (que corre en el servidor con las variables de entorno de AWS) y posteriormente el navegador realiza el PUT directamente al bucket S3 de forma segura y temporal.

---

### Entrada 3: Optimización del Catálogo con Búsqueda Debounced
- **Fecha**: 2026-07-21
- **Prompt o Consulta**: *"¿Cómo implementar un custom hook `useDebounce` para la búsqueda de productos en React y evitar re-renders o queries excesivas por cada pulsación de tecla?"*
- **Aprendizaje / Decisión Técnica**:
  Se implementó `useDebounce` que posterga la actualización del término de búsqueda hasta que el usuario deja de escribir por 300ms. Esto mejora significativamente la experiencia del usuario (UX) y optimiza el consumo de la API/estado.

---

### Entrada 4: Reducer Puro para Carrito de Compras y Estrategia de Testing
- **Fecha**: 2026-07-21
- **Prompt o Consulta**: *"¿Cómo estructurar las acciones del reducer del carrito (`cartReducer`) para que sea completamente puro y fácil de evaluar con Vitest?"*
- **Aprendizaje / Decisión Técnica**:
  El reducer se diseñó como una función pura `(state, action) => newState`. Todas las acciones (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`) retornan nuevos objetos de estado inmutables. Esto permite escribir tests unitarios deterministas con `vitest` sin depender del DOM o servicios externos.

---

### Entrada 5: Reglas de Seguridad en Firestore y Doble Validación de Roles
- **Fecha**: 2026-07-21
- **Prompt o Consulta**: *"¿Por qué la validación de rutas de administración en el frontend con React Router no es suficiente para la seguridad del sistema?"*
- **Aprendizaje / Decisión Técnica**:
  La protección de rutas en el cliente mejora la UX impidiendo la navegación visual, pero cualquier usuario malintencionado podría enviar peticiones HTTP directas a Firestore. Por ello, es imprescindible configurar reglas de Firestore en el servidor que verifiquen los permisos del documento de usuario antes de permitir escrituras en la colección de `products` o modificación de estados en `orders`.
