# Socket Server Rules & Guidelines

## Overview
This document outlines the standardized patterns and rules for implementing socket events in the chat application.

## Architecture

### File Structure
```
src/socket/
├── index.ts                    # Main exports
├── server/
│   ├── index.ts               # Socket server setup
│   └── adapter.ts             # Redis adapter configuration
└── events/
    ├── chat/                  # Chat-related events
    │   ├── index.ts
    │   ├── connection.ts
    │   ├── message.ts
    │   ├── room.ts
    │   └── typing.ts
    ├── presence/              # User presence events
    │   ├── index.ts
    │   ├── connection.ts
    │   └── cleanup.ts
    └── hello/                 # Hello events (example)
        ├── index.ts
        └── hello.ts
```

## Steps to Add New Socket Events

### 1. Define Types
**File:** `src/types/socket.ts`

Add event definitions to interfaces:
```typescript
export interface ClientToServer {
  // Add your new event here
  yourEvent: (data: YourPayloadType) => void;
}

export interface ServerToClient {
  // Add server response event here
  yourEventResponse: (data: YourResponseType) => void;
}
```

### 2. Create Event Module
**Files to create:**
- `src/socket/events/yourmodule/yourmodule.ts`
- `src/socket/events/yourmodule/index.ts`

**Pattern for `yourmodule.ts`:**
```typescript
import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient } from "@/types";
import { logger } from "@/lib/logger";

export function registerYourModuleEvents(
  io: Server<ClientToServer, ServerToClient>,
  socket: Socket<ClientToServer, ServerToClient>
) {
  socket.on("yourEvent", (data) => {
    try {
      // Your event logic here
      logger.info("Your event received", { socketId: socket.id });
      
      // Emit response
      socket.emit("yourEventResponse", { /* response data */ });
    } catch (error) {
      logger.error("Error handling your event", { error, socketId: socket.id });
      socket.emit("error", { message: "Error processing request" });
    }
  });
}
```

**Pattern for `index.ts`:**
```typescript
export { registerYourModuleEvents } from "./yourmodule";
```

### 3. Wire to Server
**File:** `src/socket/server/index.ts`

Add import and registration:
```typescript
import { registerYourModuleEvents } from "../events/yourmodule";

// In the connection handler:
io.on("connection", (socket) => {
  // ... existing code ...
  registerYourModuleEvents(io, socket);
});
```

### 4. Export from Main Index
**File:** `src/socket/index.ts`

Add export:
```typescript
export { registerYourModuleEvents } from "./events/yourmodule";
```

## Important Files to Edit

### Core Files (Always Required)
1. **`src/types/socket.ts`** - Define event types
2. **`src/socket/events/yourmodule/yourmodule.ts`** - Event implementation
3. **`src/socket/events/yourmodule/index.ts`** - Module exports
4. **`src/socket/server/index.ts`** - Wire events to server
5. **`src/socket/index.ts`** - Main exports

### Optional Files
- **`src/socket/server/adapter.ts`** - Only if Redis configuration changes
- **`src/server.ts`** - Only if server setup changes

## Standard Patterns

### Error Handling
- Always wrap event handlers in try-catch
- Log errors with `logger.error`
- Emit error events to client: `socket.emit("error", { message: "..." })`

### Logging
- Log successful events: `logger.info("Event received", { socketId, ... })`
- Log errors: `logger.error("Error message", { error, socketId })`

### Event Naming
- Use camelCase for event names
- Be descriptive: `joinRoom`, `leaveRoom`, `sendMessage`
- Use consistent patterns: `event` for client→server, `eventResponse` for server→client

### Data Validation
- Use Zod schemas for payload validation
- Define schemas in `src/types/socket.ts`
- Parse and validate data: `YourSchema.parse(data)`

## Example: Hello Events

### Types (`src/types/socket.ts`)
```typescript
export interface ClientToServer {
  hello: () => void;
}

export interface ServerToClient {
  hello: (data: { message: string }) => void;
}
```

### Implementation (`src/socket/events/hello/hello.ts`)
```typescript
export function registerHelloEvents(io, socket) {
  socket.on("hello", () => {
    try {
      const username = socket.data.username || "Anonymous";
      logger.info("Hello event received", { socketId: socket.id, username });
      socket.emit("hello", { message: `Hello, ${username}!` });
    } catch (error) {
      logger.error("Error handling hello event", { error, socketId: socket.id });
      socket.emit("error", { message: "Error processing hello request" });
    }
  });
}
```

### Registration (`src/socket/server/index.ts`)
```typescript
import { registerHelloEvents } from "../events/hello";

io.on("connection", (socket) => {
  registerHelloEvents(io, socket);
});
```

## Best Practices

1. **Keep events focused** - One responsibility per event module
2. **Use consistent naming** - Follow established patterns
3. **Handle errors gracefully** - Always provide error responses
4. **Log everything** - Use structured logging with context
5. **Validate inputs** - Use Zod schemas for data validation
6. **Test thoroughly** - Verify both success and error cases
7. **Document events** - Add JSDoc comments for complex events

## Current Event Modules

- **chat** - Message handling, rooms, typing indicators
- **presence** - User online/offline tracking
- **hello** - Simple greeting events (example)

## Notes

- All events are automatically available to all connected clients
- Socket data (username, userId) is set during connection from auth
- Redis adapter is optional but recommended for production
- Admin UI is available at `/admin` when using Socket.IO admin
