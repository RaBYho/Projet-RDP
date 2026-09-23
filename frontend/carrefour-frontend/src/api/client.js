/**
 * Client HTTP — Carrefour Intelligent.
 *
 * Wrapper minimal au-dessus de fetch natif :
 *  - Une seule source pour l'URL de base (env var)
 *  - Une erreur typée ApiError pour distinguer les cas d'échec
 *  - 7 fonctions nommées qui correspondent au contrat backend
 *
 * Aucune logique métier : on ne fait que transmettre, parser, lever.
 */

/* URL de base du backend. Surchargée via .env.local :
   VITE_API_URL=http://localhost:8000
   En l'absence de variable, on retombe sur la valeur par défaut. */
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * Erreur structurée pour toutes les réponses non-2xx ou échecs réseau.
 *
 * @property {number} status  - code HTTP (0 si erreur réseau, pas de réponse)
 * @property {object} payload - corps JSON parsé, ou objet de fallback
 * @property {string} code    - catégorie ('network', 'conflict', 'validation', 'server', 'unknown')
 * @property {string} message - message lisible (issu de payload.reason ou payload.error)
 */
export class ApiError extends Error {
  constructor(status, payload) {
    const message =
      payload?.reason ??
      payload?.error ??
      payload?.detail ??
      `Erreur HTTP ${status}`;

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload ?? {};
    this.code = classifyStatus(status);
  }
}

/** Convertit un status HTTP en catégorie sémantique. */
function classifyStatus(status) {
  if (status === 0) return "network";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "unknown";
}

/**
 * Helper interne : exécute une requête fetch, parse la réponse,
 * lève ApiError en cas de problème.
 */
async function request(path, { method = "GET", body } = {}) {
  const url = `${BASE_URL}${path}`;

  const init = {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };

  let response;
  try {
    response = await fetch(url, init);
  } catch {
    // Erreur réseau : le backend est injoignable (DNS, CORS, backend off…)
    throw new ApiError(0, {
      error: "network",
      reason: "Backend injoignable. Vérifie que le serveur est démarré.",
    });
  }

  // Parsing tolérant : si le corps est vide, on retourne null.
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: "invalid_json", raw: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}

/* ============================================================
   Endpoints publics — un par fonction du contrat backend.
   ============================================================ */

/**
 * GET /network — état complet du réseau (places, transitions,
 * marking_vector, step_count, timestamp).
 */
export function getNetwork() {
  return request("/network");
}

/**
 * GET /enabled-transitions — liste des transitions franchissables.
 * Format : { enabled: string[] }
 */
export function getEnabledTransitions() {
  return request("/enabled-transitions");
}

/**
 * POST /fire/{transition_id} — déclenche un tir.
 * Succès  : { fired_transition, marking_vector, timestamp }
 * Conflit : ApiError status 409 avec payload.reason
 */
export function fireTransition(transitionId) {
  return request(`/fire/${encodeURIComponent(transitionId)}`, {
    method: "POST",
  });
}

/**
 * GET /properties — état des 7 contraintes formelles.
 * Format : { constraints: [{ id, name, satisfied, formal_notation, explanation }] }
 */
export function getProperties() {
  return request("/properties");
}

/**
 * POST /reset — réinitialise le marquage.
 * Format de retour : identique à GET /network.
 */
export function resetNetwork() {
  return request("/reset", { method: "POST" });
}

/**
 * GET /timer — état du scheduler.
 * Format : { ticks_elapsed, seconds_before_forced_change, current_phase }
 */
export function getTimer() {
  return request("/timer");
}

/**
 * POST /inject/{event} — injecte un événement externe.
 * Événements valides : voiture_ns, voiture_eo, pieton, urgence, bus.
 * Format de retour : identique à POST /fire.
 */
export function injectEvent(event) {
  return request(`/inject/${encodeURIComponent(event)}`, { method: "POST" });
}
