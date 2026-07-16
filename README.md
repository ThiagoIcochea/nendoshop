# NendoShop – Frontend

## English Version

### Description
NendoShop Frontend is the React-based user interface for the NendoShop e-commerce platform. It provides the experience for browsing products, managing a shopping cart, completing purchases, accessing chat support, and reviewing order history, all connected to the backend API.

### Key Features
- Browse Nendoroid collections by category, series, and character
- Search and view detailed product pages
- Shopping cart and checkout flow with PayPal integration
- Authentication, registration, profile management, and two-factor verification
- Order tracking, delivery status review, and claim creation
- Real-time community/support chat with WebSocket connectivity
- Responsive UI for desktop and mobile devices

### Technology Stack
- **Frontend:** React 19 + React Router
- **Styling:** Tailwind CSS + custom CSS modules
- **Visualization/UI:** Lucide icons, particles, modals, and animated components
- **Real-time features:** WebSocket-based chat and live updates
- **Payments:** PayPal React SDK
- **State:** React Context for authentication

### Project Architecture
- **src/pages**: Main route views such as Home, Catalog, ProductDetail, Cart, Login, Register, Profile, ChatPage, Pagos, MisPedidos, and Dashboard pages.
- **src/components**: Reusable UI blocks such as Navbar, Footer, Card, MessageBubble, ChatWindow, ProtectedRoute, and purchase alert components.
- **src/context**: Authentication context and global state for the logged user.
- **src/hooks**: WebSocket and chat-related hooks, including the chat connection lifecycle and message syncing.
- **src/services**: API and socket integration client logic.
- **src/utils**: Helper modules for dashboard metrics, MFA flows, route configuration, and frontend-specific utilities.

### Main Routes / Screens
- `/` – Home page
- `/catalogo` or `/catalog` – Product catalog
- `/product/:id` – Product detail
- `/cart` – Shopping cart
- `/login` – Login
- `/register` – Registration
- `/profile` – User profile
- `/mis-pedidos` – Order history
- `/pagos` – Checkout/payment flow
- `/chat` – Community/support chat
- `/dashboard/*` – Admin dashboard views

### Backend Endpoints Consumed
The frontend communicates with the backend through the following groups of endpoints:
- **Authentication:** `/api/auth/*`
- **Products:** `/api/products/*`
- **Payments:** `/api/payments/*` and `/api/paypal/*`
- **Deliveries/Orders:** `/api/deliveries/*`
- **Claims:** `/api/claims/*`
- **Chat:** `/api/chat/*` and `/api/chatbot/*`
- **Real-time chat:** WebSocket connection on `/ws`

### Run Commands
From the frontend folder:

```bash
npm install
npm start
```

For production build:

```bash
npm run build
```

For tests:

```bash
npm test
```

### Environment Variables
Create a `.env` file in the frontend project root with at least:

```env
REACT_APP_BACKEND_URL=http://localhost:4000
```

### Members
- Icochea Rodriguez, Thiago Paolo (U22330428)
- Chabria Loayza, Percy Alonzo (U20217294)
- Rojas Olano, Aaron Toribio (U22210544)
- Carbajal Añanca, Melany Daniela (U22222750)
- Guevara Morales, Antonio Nicolás (U22217586)
- Gómez Linares, Laura Angélica (U22217117)

---

## Versión en Español

### Descripción
El frontend de NendoShop es la interfaz React para la plataforma de comercio electrónico de Nendoroids. Proporciona la experiencia para explorar productos, gestionar el carrito de compras, completar pagos, acceder al chat de soporte y revisar el historial de pedidos, todo conectado al backend.

### Funcionalidades Principales
- Explorar colecciones de Nendoroids por categoría, serie y personaje
- Buscar y ver páginas de detalle de productos
- Flujo de carrito y checkout con integración a PayPal
- Autenticación, registro, gestión de perfil y verificación en dos pasos
- Seguimiento de pedidos, revisión de entregas y creación de reclamos
- Chat en tiempo real de comunidad y soporte mediante WebSocket
- Diseño responsivo para escritorio y dispositivos móviles

### Tecnologías
- **Frontend:** React 19 + React Router
- **Estilos:** Tailwind CSS + CSS personalizado
- **UI y visuales:** Íconos Lucide, partículas, modales y componentes animados
- **Tiempo real:** Chat basado en WebSocket y actualizaciones en vivo
- **Pagos:** SDK de PayPal para React
- **Estado:** Context API para autenticación

### Arquitectura del Proyecto
- **src/pages**: Vistas principales de rutas como Home, Catalog, ProductDetail, Cart, Login, Register, Profile, ChatPage, Pagos, MisPedidos y páginas del dashboard.
- **src/components**: Bloques reutilizables de interfaz como Navbar, Footer, Card, MessageBubble, ChatWindow, ProtectedRoute y componentes de alerta.
- **src/context**: Contexto de autenticación y estado global del usuario logueado.
- **src/hooks**: Hooks para WebSocket y chat, incluyendo el ciclo de conexión y sincronización de mensajes.
- **src/services**: Lógica de integración con la API y sockets.
- **src/utils**: Módulos auxiliares para métricas del dashboard, flujos MFA, configuración de rutas y utilidades frontend.

### Rutas / Pantallas Principales
- `/` – Inicio
- `/catalogo` o `/catalog` – Catálogo de productos
- `/product/:id` – Detalle del producto
- `/cart` – Carrito de compras
- `/login` – Inicio de sesión
- `/register` – Registro
- `/profile` – Perfil de usuario
- `/mis-pedidos` – Historial de pedidos
- `/pagos` – Flujo de checkout y pagos
- `/chat` – Chat de comunidad y soporte
- `/dashboard/*` – Vistas del panel administrativo

### Endpoints del Backend Consumed
El frontend se comunica con el backend mediante los siguientes grupos de endpoints:
- **Autenticación:** `/api/auth/*`
- **Productos:** `/api/products/*`
- **Pagos:** `/api/payments/*` y `/api/paypal/*`
- **Entregas / pedidos:** `/api/deliveries/*`
- **Reclamos:** `/api/claims/*`
- **Chat:** `/api/chat/*` y `/api/chatbot/*`
- **Chat en tiempo real:** conexión WebSocket en `/ws`

### Comandos de Ejecución
Desde la carpeta del frontend:

```bash
npm install
npm start
```

Para construir la versión de producción:

```bash
npm run build
```

Para ejecutar pruebas:

```bash
npm test
```

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto frontend con al menos:

```env
REACT_APP_BACKEND_URL=http://localhost:4000
```

### Integrantes
- Icochea Rodriguez, Thiago Paolo (U22330428)
- Chabria Loayza, Percy Alonzo (U20217294)
- Rojas Olano, Aaron Toribio (U22210544)
- Carbajal Añanca, Melany Daniela (U22222750)
- Guevara Morales, Antonio Nicolás (U22217586)
- Gómez Linares, Laura Angélica (U22217117)