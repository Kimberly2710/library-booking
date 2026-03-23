import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          active
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-gray-900 px-6 py-3 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📚</span>
        <span className="font-bold text-white text-lg mr-4">LibraryMS</span>
        {navLink('/dashboard', 'Dashboard')}
        {navLink('/books', 'Books')}
        {user?.role === 'admin' && navLink('/members', 'Members')}
        {navLink('/reservations', 'Reservations')}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-white text-sm font-medium">{user?.name}</p>
          <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;