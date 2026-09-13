// Typed-ish fetch wrapper for the API core. Every method takes a Clerk auth
// token (from getToken()) and attaches it as a Bearer token, matching the
// JWT verification middleware in services/api-core.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

async function request(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const payload = await res.json()
      if (payload && payload.error) message = payload.error
    } catch {
      // Non-JSON error body; keep the status-based message.
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // The userId path segment is required by the route but ignored server-side
  // (the API always uses the authenticated user from the token), so "me" is
  // used as a placeholder.
  getProjects: (token) => request("/api/projects/user/me", { token }),
  getProject: (id, token) => request(`/api/projects/${id}`, { token }),
  createProject: (data, token) =>
    request("/api/projects", { method: "POST", token, body: data }),
  updateProject: (id, data, token) =>
    request(`/api/projects/${id}`, { method: "PUT", token, body: data }),
  deleteProject: (id, token) =>
    request(`/api/projects/${id}`, { method: "DELETE", token }),
  getBuilds: (projectId, token) =>
    request(`/api/builds/project/${projectId}`, { token }),
  getAudit: (projectId, token) =>
    request(`/api/audits/project/${projectId}`, { token }),
  getSubscription: (token) => request("/api/subscriptions", { token }),
}

export default api