export const createIdempotencyKey = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const getStoredIdempotencyKey = (storageKey: string) => {
  if (typeof window === "undefined") return createIdempotencyKey();

  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const next = createIdempotencyKey();
  sessionStorage.setItem(storageKey, next);
  return next;
};

export const clearStoredIdempotencyKey = (storageKey: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(storageKey);
};
