export { useSocket } from "./hook";
export { createSocketConnection, type IOSocket } from "./connection";
export { validateMessageContent, formatMessageContent } from "./messages";
export { setupConnectionEvents, setupMessageEvents, emitMessageEvent, emitGenericEvent } from "./events";

export type { ChatMessage } from "@/types";
