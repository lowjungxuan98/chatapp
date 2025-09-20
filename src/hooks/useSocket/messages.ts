export function validateMessageContent(content: string): boolean {
  return content.trim().length > 0;
}

export function formatMessageContent(content: string): string {
  return content.trim();
}
