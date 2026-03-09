import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, GraduationCap, Calendar, DollarSign, BarChart3, ClipboardCheck, FileText, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl font-bold">
              <span className="text-gold">LEVEL UP</span>
              <span className="text-sm block text-gray-200">S&A CENTER</span>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/estudiantes" className="flex items-center space-x-2 hover:text-gold transition">
              <Users size={20} />
              <span>Estudiantes</span>
            </Link>
            <Link to="/profesores" className="flex items-center space-x-2 hover:text-gold transition">
              <GraduationCap size={20} />
              <span>Profesores</span>
            </Link>
            <Link to="/clases" className="flex items-center space-x-2 hover:text-gold transition">
              <Calendar size={20} />
              <span>Clases</span>
            </Link>
            <Link to="/inscripciones" className="flex items-center space-x-2 hover:text-gold transition">
              <UserPlus size={20} />
              <span>Inscripciones</span>
            </Link>
            <Link to="/asistencias" className="flex items-center space-x-2 hover:text-gold transition">
              <ClipboardCheck size={20} />
              <span>Asistencias</span>
            </Link>
            <Link to="/pagos" className="flex items-center space-x-2 hover:text-gold transition">
              <DollarSign size={20} />
              <span>Pagos</span>
            </Link>
            <Link to="/reportes" className="flex items-center space-x-2 hover:text-gold transition">
              <FileText size={20} />
              <span>Reportes</span>
            </Link>
            <Link to="/contabilidad" className="flex items-center space-x-2 hover:text-gold transition">
              <BarChart3 size={20} />
              <span>Contabilidad</span>
            </Link>
            
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-blue-700">
              <span className="text-sm">{user?.nombre}</span>
              <button onClick={handleLogout} className="hover:text-gold transition">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
