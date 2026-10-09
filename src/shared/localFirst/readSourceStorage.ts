import { ReadSource } from './createLocalFirstContext';

const READ_SOURCE_STORAGE_KEY = 'journal-read-source';

export function loadReadSource(): ReadSource {
  try {
    return localStorage.getItem(READ_SOURCE_STORAGE_KEY) === 'v2' ? 'v2' : 'v1';
  } catch {
    return 'v1';
  }
}

export function saveReadSource(source: ReadSource) {
  try {
    localStorage.setItem(READ_SOURCE_STORAGE_KEY, source);
  } catch (error) {
    console.error(`Couldn't save the read source "${source}"`, error);
  }
}
