/**
 * Normalize text for accent-insensitive search
 * Removes diacritics (accents) and converts to lowercase
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Check if a search term matches text (accent-insensitive)
 */
export function matchesSearch(text: string, searchTerm: string): boolean {
  return normalizeText(text).includes(normalizeText(searchTerm));
}
