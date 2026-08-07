import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Ecommerce</Link>
      </div>
      <div className="navbar-links">
        <Link to="/health">Status</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            {isAdmin && <Link to="/admin/users">Users</Link>}
            <span className="navbar-user">{user?.email}</span>
            <button type="button" onClick={handleLogout} className="btn btn-secondary">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
