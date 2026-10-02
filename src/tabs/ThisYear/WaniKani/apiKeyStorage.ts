const API_KEY_STORAGE_KEY = 'wanikaniApiKey';

export function readApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveApiKey(apiKey: string) {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

export function forgetApiKey() {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}
