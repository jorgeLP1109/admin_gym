import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Profesores from './pages/Profesores';
import Clases from './pages/Clases';
import Inscripciones from './pages/Inscripciones';
import Pagos from './pages/Pagos';
import Contabilidad from './pages/Contabilidad';
import Asistencias from './pages/Asistencias';
import Reportes from './pages/Reportes';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Dashboard />
          </>
        </PrivateRoute>
      } />
      <Route path="/estudiantes" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Estudiantes />
          </>
        </PrivateRoute>
      } />
      <Route path="/profesores" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Profesores />
          </>
        </PrivateRoute>
      } />
      <Route path="/clases" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Clases />
          </>
        </PrivateRoute>
      } />
      <Route path="/inscripciones" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Inscripciones />
          </>
        </PrivateRoute>
      } />
      <Route path="/pagos" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Pagos />
          </>
        </PrivateRoute>
      } />
      <Route path="/contabilidad" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Contabilidad />
          </>
        </PrivateRoute>
      } />
      <Route path="/asistencias" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Asistencias />
          </>
        </PrivateRoute>
      } />
      <Route path="/reportes" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Reportes />
          </>
        </PrivateRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
