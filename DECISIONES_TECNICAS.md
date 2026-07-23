# 🧠 Decisiones Técnicas y Arquitectura del Proyecto

Este documento recopila las decisiones técnicas fundamentales tomadas durante el ciclo de vida de desarrollo de la plataforma e-commerce **ShopNova**. Se documentan los "porqués" detrás de la selección de tecnologías, patrones de diseño y estrategias de infraestructura.

---

## 1. Stack Tecnológico Principal: React + TypeScript + Vite
* **Decisión:** Utilizar React con TypeScript empaquetado mediante Vite, en lugar de Next.js u opciones como Create React App.
* **Argumento:** 
  * **TypeScript** garantiza la escalabilidad del e-commerce al tipar estrictamente entidades críticas como `Product`, `Order` y `User`. Esto eliminó errores de tiempo de ejecución asociados con propiedades indefinidas o nulas (muy comunes al tratar con bases de datos NoSQL).
  * **Vite** proporciona un entorno de desarrollo con Hot Module Replacement (HMR) casi instantáneo, acelerando enormemente la velocidad de iteración en comparación con Webpack, y produciendo un bundle final sumamente optimizado para producción.
  * Al no requerir Server-Side Rendering (SSR) estricto para el alcance inicial del proyecto (que priorizaba la interactividad del panel de administración y el flujo de carrito), una Single Page Application (SPA) pura fue la opción más ágil y costo-efectiva.

## 2. Gestión de Estado: Context API + `useReducer` vs Redux
* **Decisión:** Gestionar el estado global (Carrito, Autenticación, Órdenes) utilizando la API de Contexto nativa de React combinada con el hook `useReducer`.
* **Argumento:** Herramientas como Redux o Zustand habrían introducido dependencias de terceros y *boilerplate* excesivo. Para las necesidades del carrito de compras (agregar, eliminar, actualizar cantidades), el patrón de `useReducer` proporcionó la misma predictibilidad y trazabilidad (despachando acciones) que Redux, pero manteniéndose 100% nativo. Para la sesión de usuario y la sincronización en tiempo real de Firestore, Context API resultó ser la abstracción perfecta para inyectar los datos en todo el árbol de componentes sin prop-drilling.

## 3. Arquitectura Multi-Nube (Multi-Cloud): Firebase + AWS S3
* **Decisión:** Utilizar Firebase (Auth y Firestore) para la lógica transaccional, pero delegar el almacenamiento de imágenes (Storage) a Amazon Web Services (AWS S3) mediante firmas temporales.
* **Argumento:** 
  * Integrar **AWS S3** demuestra capacidad para operar arquitecturas empresariales desacopladas y no depender exclusivamente del ecosistema de un solo proveedor (Vendor Lock-in). 
  * Se implementó el patrón de **Presigned URLs (URLs pre-firmadas)**. Esto significa que el cliente web nunca conoce las credenciales maestras de AWS. En su lugar, solicita un permiso temporal (válido por 5 minutos) a una función en el servidor, la cual le otorga el derecho de subir exclusivamente esa foto directo al bucket. Esto garantiza máxima seguridad y rendimiento.

## 4. Backend Serverless: Vercel Functions
* **Decisión:** Desplegar el backend para la generación de firmas de AWS en funciones *Serverless* de Node.js alojadas dentro de la carpeta `/api/` en Vercel.
* **Argumento:** Evitar la creación, despliegue y mantenimiento de un servidor Express.js tradicional en plataformas como Heroku o AWS EC2. Las funciones Serverless escalan de 0 a infinito automáticamente, no consumen recursos cuando no se usan y viven en el mismo repositorio que el frontend, unificando el ciclo de Integración Continua (CI/CD).

## 5. Base de Datos en Tiempo Real: Firestore
* **Decisión:** Utilizar Cloud Firestore (NoSQL) para persistir el catálogo y las órdenes.
* **Argumento:** 
  * **Real-time Sync:** Vital para un e-commerce. Si el administrador edita un producto o su stock, o si cambia el estado de una orden, los clientes conectados ven el cambio de inmediato mediante WebSockets (listeners `onSnapshot`), sin necesidad de recargar la página.
  * **Escalabilidad:** Estructura basada en colecciones y documentos facilita consultas ágiles.

## 6. Seguridad Transaccional: Reglas de Firestore
* **Decisión:** Proteger la base de datos a nivel de servidor utilizando `firestore.rules` en lugar de confiar únicamente en la validación del frontend.
* **Argumento:** En arquitecturas BaaS (Backend as a Service) donde el cliente habla directamente con la base de datos, el frontend es vulnerable a manipulación. Se implementaron reglas estrictas:
  * Los productos son de lectura pública, pero escritura exclusiva de roles `admin`.
  * Los usuarios solo pueden crear órdenes si asignan su propio `uid` como dueño de la compra.
  * Los usuarios solo pueden leer las órdenes que les pertenecen, mientras que el administrador puede leer y modificar todas.
  * Mitigación de errores de permisos al validar la existencia de objetos con `resource == null`.

## 7. Diseño de UI / UX "Vanilla" y Moderno
* **Decisión:** Construir un sistema de diseño propio basado en Variables CSS globales en `index.css`, sin utilizar librerías pesadas como Bootstrap, Material UI o Tailwind CSS.
* **Argumento:** 
  * **Control total:** Permitió implementar tendencias de diseño modernas (Glassmorphism, gradientes suavizados, sombras dinámicas) sin tener que luchar contra estilos predefinidos.
  * **Rendimiento:** El peso final de los estilos es minúsculo, acelerando el tiempo de primera carga (FCP).
  * **Accesibilidad e interactividad:** Se desarrollaron micro-animaciones (clases `.animate-in`, hover states y modales con backdrop-filter) que proporcionan una sensación de aplicación premium y fluida.

## 8. Prevención de Índices Compuestos (Workaround)
* **Decisión:** En el panel de administrador, el ordenamiento de las órdenes por fecha (`createdAt`) se realiza en memoria (lado del cliente) en lugar de hacerlo directamente en la consulta de Firestore (`orderBy`).
* **Argumento:** Al consultar datos en Firestore y querer combinarlos con filtros o condicionales complejos, Firestore exige la creación manual de **Índices Compuestos** en la consola de Google Cloud. Para mantener el repositorio "Plug & Play" (que cualquier desarrollador pueda clonar, poner sus llaves y funcionar sin configuraciones manuales de base de datos extra), la ordenación post-fetch es una solución de compromiso altamente efectiva para catálogos pequeños y medianos.

## 9. Flujo de Checkout Simulado pero Realista
* **Decisión:** Implementar validaciones estrictas y retrasos simulados en el formulario de pago en lugar de integraciones complejas con pasarelas de pago reales (Stripe/PayPal) para el alcance académico/demostrativo.
* **Argumento:** Se optó por construir la lógica real de estado y validación (desglose de dirección, validación de longitudes de tarjeta, protección del botón de submit, y spinner asíncrono) para demostrar dominio en el control de estado de React y experiencia de usuario. Esto mantiene el proyecto 100% gratuito de operar y seguro.

## 10. Enrutamiento del Cliente: React Router v6 (con flags v7)
* **Decisión:** Utilizar `react-router-dom` habilitando los "future flags" para la transición de estado (`v7_startTransition`).
* **Argumento:** React Router permite la navegación entre páginas (Home, Cart, Checkout, Admin) sin recargas del navegador, manteniendo vivo el estado del Carrito (Context). Habilitar los flags del futuro previene advertencias de obsolescencia en la consola y deja la base de código preparada (Future-Proof) para las inminentes actualizaciones mayores de React (Concurrent Mode) y React Router v7.
