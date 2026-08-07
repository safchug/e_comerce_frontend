import { useEffect, useState } from 'react'
import { getUsers } from '../api/auth'
import { extractErrorMessage } from '../context/AuthContext'

export default function AdminUsersPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getUsers()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page">
      <h1>Users (admin)</h1>
      {loading && <p className="page-status">Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && (
        <div className="card">
          <pre className="json-block">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
