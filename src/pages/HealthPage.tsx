import { useEffect, useState } from 'react'
import { getHealth } from '../api/health'
import type { HealthStatus } from '../types'

export default function HealthPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const check = () => {
    setLoading(true)
    setError(null)
    getHealth()
      .then(setHealth)
      .catch(() => setError('Unable to reach the API.'))
      .finally(() => setLoading(false))
  }

  useEffect(check, [])

  return (
    <div className="page">
      <h1>Service status</h1>
      {loading && <p className="page-status">Checking…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {health && (
        <div className="card">
          <div className="field-row">
            <span className="field-label">Status</span>
            <span className="badge badge-ok">{health.status}</span>
          </div>
          <div className="field-row">
            <span className="field-label">Uptime</span>
            <span className="field-value">{Math.round(health.uptime)}s</span>
          </div>
          <div className="field-row">
            <span className="field-label">Timestamp</span>
            <span className="field-value">{health.timestamp}</span>
          </div>
        </div>
      )}
      <button type="button" className="btn btn-secondary" onClick={check}>
        Refresh
      </button>
    </div>
  )
}
