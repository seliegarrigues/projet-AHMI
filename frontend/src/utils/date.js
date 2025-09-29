// src/utils/date.js
import { format as dfFormat, isValid, parseISO } from 'date-fns'

// Détecte "YYYY-MM-DDTHH:mm" (format attendu par <input type="datetime-local">, sans timezone)
const RE_INPUT_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

// Convertit diverses entrées en Date valide OU null (NE JETTE PAS)
function coerceToDate(value) {
  if (!value) return null

  // Déjà une Date ?
  if (value instanceof Date) return isValid(value) ? value : null

  // "YYYY-MM-DDTHH:mm" => interprétation locale
  if (typeof value === 'string' && RE_INPUT_LOCAL.test(value)) {
    const [datePart, timePart] = value.split('T')
    const [y, m, d] = datePart.split('-').map(Number)
    const [H, M] = timePart.split(':').map(Number)
    const local = new Date(y, m - 1, d, H, M, 0, 0)
    return isValid(local) ? local : null
  }

  // ISO complète ? (parseISO ne jette pas, renvoie Invalid Date si échec)
  if (typeof value === 'string') {
    const iso = parseISO(value)
    if (isValid(iso)) return iso
  }

  // Ultime tentative
  const d = new Date(value)
  return isValid(d) ? d : null
}

/**
 * formatDateForInput
 * Transforme une date (Date | string) en "yyyy-MM-dd'T'HH:mm" pour <input type="datetime-local">.
 * Retourne '' si invalide / absente (pas d’exception).
 */
export function formatDateForInput(value) {
  const d = coerceToDate(value)
  if (!d) return ''
  try {
    return dfFormat(d, "yyyy-MM-dd'T'HH:mm")
  } catch {
    return ''
  }
}

/**
 * toISOStringFromInput
 * Transforme une valeur venant d’un <input type="datetime-local"> (ou une date quelconque)
 * en ISO string (UTC) pour l’API. Retourne null si invalide (pas d’exception).
 */
export function toISOStringFromInput(value) {
  const d = coerceToDate(value)
  return d ? d.toISOString() : null
}
