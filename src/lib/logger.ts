/* eslint-disable @typescript-eslint/no-explicit-any */
import { appendFileSync } from 'node:fs';

const tzOffset = (new Date()).getTimezoneOffset() * 60000;

const COLORS = Object.freeze({
  reset: '\u001b[0m',
  gray: '\u001b[90m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
});

const LEVELS = Object.freeze({
  default: {
    id: COLORS.blue,
    datetime: COLORS.green,
    message: COLORS.white,
    level: COLORS.white
  },
  info: {
    id: COLORS.blue,
    datetime: COLORS.white,
    message: COLORS.blue,
    level: COLORS.blue
  },
  warn: {
    id: COLORS.blue,
    datetime: COLORS.white,
    message: COLORS.yellow,
    level: COLORS.yellow
  },
  error: {
    id: COLORS.blue,
    datetime: COLORS.red,
    message: COLORS.red,
    level: COLORS.red
  },
  debug: {
    id: COLORS.blue,
    datetime: COLORS.green,
    message: COLORS.white,
    level: COLORS.magenta
  }
});

function formatArgs(args: unknown[]): string {
  return args
    .map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    })
    .join(' ');
}

function messageFactory({ 
  id = '', 
  level, 
  args = [], 
  colors 
}: {
  id?: string;
  level?: string;
  args?: unknown[];
  colors?: any;
}): string {
  const timestamp = (new Date(Date.now() - tzOffset))
    .toISOString()
    .replace("T", " ")
    .replace('Z', '');
  
  let message = `${COLORS.reset}${colors?.datetime}[${timestamp}]${COLORS.reset}`;
  
  if (id) {
    message += `${COLORS.reset} - ${colors?.id}[id:${id}]${COLORS.reset}`;
  }
  
  if (level) {
    message += `${COLORS.reset} - ${colors?.level}[${level.length === 4 ? level + ' ' : level}]${COLORS.reset}`;
  }
  
  message += `${COLORS.reset} - ${colors?.message}${formatArgs(args)}${COLORS.reset}`;
  
  return message;
}

function stripAnsiCodes(text: string): string {
  return text.replace(/\u001b\[\d{1,2}m|\u001b\[0m/g, '');
}

function writeToStdout(message: string): void {
  console.log(message);
}

function writeToFile(message: string, path: string): void {
  appendFileSync(path, stripAnsiCodes(message) + '\n', 'utf8');
}

interface Logger {
  (...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  id(newId: string): Logger;
}

function logFactory({ 
  id, 
  path, 
  colors, 
  toStdout = true 
}: {
  id?: string;
  path?: string;
  colors?: any;
  toStdout?: boolean;
}): Logger {
  let currentId = id;

  const createLogHandler = (colors: any, level?: string) => 
    (...args: unknown[]) => {
      const message = messageFactory({
        id: currentId || undefined,
        colors,
        level,
        args
      });
      
      if (toStdout !== false) {
        writeToStdout(message);
      }
      
      if (path) {
        writeToFile(message, path);
      }
    };

  const logger = createLogHandler(colors || LEVELS.default) as Logger;
  
  Object.keys(LEVELS)
    .filter(level => level !== 'default')
    .forEach(level => {
      (logger as unknown as Record<string, unknown>)[level] = createLogHandler(LEVELS[level as keyof typeof LEVELS], level);
    });

  logger.id = (newId: string) => {
    currentId = newId;
    return logger;
  };

  return logger;
}

export const logger = logFactory({ 
  toStdout: true
});

export { logFactory };
