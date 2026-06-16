async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  }
  if (body !== undefined) options.body = JSON.stringify(body)
  const res = await fetch(`/api${path}`, options)
  if (res.status === 401 && window.location.pathname !== '/login') {
    window.location.href = '/login'
    return
  }
  const data = res.status !== 204 ? await res.json() : null
  if (!res.ok) {
    const err = new Error(data?.detail || 'Request failed')
    err.response = { data, status: res.status }
    throw err
  }
  return data
}

export default {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
