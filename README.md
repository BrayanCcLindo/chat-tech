This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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

## Ejemplo de Integración

```typescript
import { setupWorker } from "msw";
import { handlers } from "./src/lib/msw/handlers";

export const worker = setupWorker(...handlers);
```

---

## Personalización

Puedes modificar los mocks (`mockUsers`, `mockMessages`, `mockConversations`) para adaptarlos a tus necesidades de desarrollo y pruebas.

---

\*\*¡Listo para desarrollar y testear tu app de mensajería
