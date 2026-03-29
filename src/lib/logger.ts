const isDev = import.meta.env.DEV

export const logger = {
  debug: (msg: string, data?: unknown) => {
    if (isDev) console.debug(`[DEBUG] ${msg}`, ...(data !== undefined ? [data] : []))
  },
  info: (msg: string, data?: unknown) => {
    if (isDev) console.info(`[INFO] ${msg}`, ...(data !== undefined ? [data] : []))
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(`[WARN] ${msg}`, ...(data !== undefined ? [data] : []))
  },
  error: (msg: string, error?: unknown) => {
    console.error(`[ERROR] ${msg}`, ...(error !== undefined ? [error] : []))
  },
}
