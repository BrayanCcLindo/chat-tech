# Mensajería App - Proyecto Next.js

Este es un proyecto de mensajería construido con [Next.js](https://nextjs.org) y bootstrapped con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). Incluye un sistema de mock API usando MSW para simular usuarios, conversaciones y mensajes, ideal para desarrollo frontend sin necesidad de backend real.

---

## 🚀 Cómo levantar el proyecto

### 1. Clona el repositorio

```bash
git clone git@github.com:BrayanCcLindo/chat-tech.git
cd mi-app-mensajes
```

### 2. Instala las dependencias

Puedes usar el gestor de paquetes que prefieras:

```bash
pnpm install
```

### 3. Inicia el servidor de desarrollo

```bash
pnpm run dev
```

### 4. Abre la aplicación en tu navegador

Visita [http://localhost:3000](http://localhost:3000) para ver la app en funcionamiento.

---

## Edición y desarrollo

- Puedes empezar a editar la página principal en `app/page.tsx`. Los cambios se reflejarán automáticamente.
- El proyecto utiliza [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para optimizar y cargar fuentes.

---

## Mock API con MSW

Este proyecto incluye handlers de [Mock Service Worker (MSW)](https://mswjs.io/) para simular endpoints RESTful de usuarios, conversaciones y mensajes.  
Consulta la sección "Mock Handlers para Mensajería (MSW)" más abajo para ver todos los endpoints simulados y cómo funcionan.

---

## Requisitos

- Node.js 18+
- npm, yarn, pnpm o bun

---

## Sugerencias

- Si tienes problemas con dependencias, ejecuta `npm install` nuevamente.
- Si usas Windows, asegúrate de tener permisos para instalar dependencias globales si es necesario.

---

# Mock Handlers para Mensajería (MSW)

Este archivo define los **handlers de Mock Service Worker (MSW)** para simular una API RESTful de mensajería, incluyendo usuarios, conversaciones y mensajes. Es ideal para desarrollo frontend sin necesidad de un backend real.

---

## Endpoints Simulados

### Usuarios

- **GET `/api/users`**
  - Devuelve un usuario de ejemplo (mock).
- **POST `/api/users`**
  - Crea un usuario con los datos recibidos.
- **GET `/api/messaging/users`**
  - Devuelve la lista de usuarios mock.
- **GET `/api/messaging/users/:id`**
  - Devuelve un usuario por su ID.
- **POST `/api/messaging/users`**
  - Crea un usuario de mensajería con nombre, email y avatar generado.

---

### Conversaciones

- **GET `/api/messaging/conversations`**
  - Devuelve todas las conversaciones mock.
- **GET `/api/messaging/conversations/:id`**
  - Devuelve una conversación por ID.
- **POST `/api/messaging/conversations`**
  - Crea una nueva conversación.
- **DELETE `/api/messaging/conversations/:id`**
  - Elimina una conversación y todos sus mensajes asociados.
- **PATCH `/api/messaging/conversations/:id`**
  - Actualiza los datos de una conversación.
- **POST `/api/messaging/conversations/:id/leave`**
  - Simula que un usuario abandona la conversación.

---

### Mensajes

- **GET `/api/messaging/conversations/:conversationId/messages`**
  - Devuelve los mensajes de una conversación, soporta paginación (`limit`, `offset`).
- **POST `/api/messaging/conversations/:conversationId/messages`**
  - Crea un nuevo mensaje (soporta texto y archivos adjuntos).
- **PUT `/api/messaging/messages/:id`**
  - Edita el contenido de un mensaje.
- **DELETE `/api/messaging/messages/:id`**
  - Elimina un mensaje y actualiza el último mensaje de la conversación si corresponde.

---

### Búsqueda

- **GET `/api/messaging/messages/search?q=texto&conversationId=...`**
  - Busca mensajes por contenido y opcionalmente por conversación.

---

## Notas de Implementación

- **Datos Mock:**  
  Los datos de usuarios, mensajes y conversaciones se inicializan desde archivos mock y se mantienen en memoria.
- **IDs:**  
  Se usan UUIDs y timestamps para simular IDs únicos.
- **Mensajes:**  
  Soportan texto, imágenes y archivos. El estado de entrega se simula con un `setTimeout`.
- **Conversaciones:**  
  Se actualiza el campo `lastMessage` y `updatedAt` automáticamente.
- **Borrado:**  
  Al eliminar una conversación, también se eliminan sus mensajes.
- **Búsqueda:**  
  La búsqueda es insensible a mayúsculas/minúsculas y filtra por contenido y/o conversación.

---

## Uso

Importa este archivo en tu setup de MSW para interceptar las peticiones HTTP de tu frontend y simular un backend de mensajería completo.

---
