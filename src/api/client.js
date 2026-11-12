// One small helper to call the backend.
// - adds the token (if any)
// - turns every error into an ApiError with a French message
//   and, for form errors, one message per field: { email: "Email invalide", ... }

const TOKEN_KEY = 'xperience.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Le serveur ne répond pas. Réessayez dans un instant.', 0)
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (response.ok) return data

  throw toApiError(response.status, data)
}

function toApiError(status, data) {
  // our backend: { status, error, message } or, for validation, { field: message }
  if (data && typeof data.message === 'string') {
    return new ApiError(data.message, status)
  }
  if (data && typeof data === 'object' && status === 400) {
    return new ApiError('Vérifiez les champs indiqués.', status, data)
  }
  const messages = {
    401: 'Votre session a expiré. Reconnectez-vous.',
    403: "Vous n'avez pas accès à cette page.",
    404: 'Introuvable.',
  }
  return new ApiError(messages[status] ?? 'Une erreur est survenue. Réessayez.', status)
}
