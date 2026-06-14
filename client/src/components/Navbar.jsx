import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/build-pizza', label: 'Build Pizza' },
    { to: '/my-orders', label: 'My Orders' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/orders', label: 'Orders' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-logo">
            <span className="logo-icon">🍕</span>
            <span className="logo-accent">PizzaCraft</span>
          </Link>

          <div className="navbar-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`navbar-link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            <div className="navbar-user">
              <div className="navbar-user-avatar">{getInitials(user?.name)}</div>
              <span>{user?.name}</span>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout} title="Logout">
              <FiLogOut size={18} />
            </button>
            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar-link ${isActive(link.to) ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <button
          className="btn btn-secondary btn-block mt-lg"
          onClick={() => {
            handleLogout();
            setMobileOpen(false);
          }}
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </>
  );
};

export default Navbar;
