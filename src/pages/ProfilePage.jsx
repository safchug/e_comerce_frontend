import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="page">
      <h1>My profile</h1>
      <div className="card">
        <div className="field-row">
          <span className="field-label">ID</span>
          <span className="field-value">{user.id}</span>
        </div>
        <div className="field-row">
          <span className="field-label">Email</span>
          <span className="field-value">{user.email}</span>
        </div>
        <div className="field-row">
          <span className="field-label">Role</span>
          <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-customer'}`}>
            {user.role}
          </span>
        </div>
      </div>
    </div>
  )
}
