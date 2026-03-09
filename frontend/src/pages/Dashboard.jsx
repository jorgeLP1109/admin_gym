import { useEffect, useState } from 'react';
import { Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';
import { estudiantesAPI, profesoresAPI, clasesAPI, contabilidadAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    estudiantes: 0,
    profesores: 0,
    clases: 0,
    balance: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [estudiantes, profesores, clases, resumen] = await Promise.all([
        estudiantesAPI.getAll(),
        profesoresAPI.getAll(),
        clasesAPI.getAll(),
        contabilidadAPI.getResumen({})
      ]);

      setStats({
        estudiantes: estudiantes.data?.length || 0,
        profesores: profesores.data?.length || 0,
        clases: clases.data?.length || 0,
        balance: Number(resumen.data?.balance || 0)
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setStats({
        estudiantes: 0,
        profesores: 0,
        clases: 0,
        balance: 0
      });
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon size={32} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Bienvenido a <span className="text-gold">LEVEL UP</span>
        </h1>
        <p className="text-gray-600">Panel de control administrativo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Estudiantes Activos"
          value={stats.estudiantes}
          color="bg-blue-500"
        />
        <StatCard
          icon={GraduationCap}
          title="Profesores"
          value={stats.profesores}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Clases Disponibles"
          value={stats.clases}
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Balance General"
          value={`$${Number(stats.balance || 0).toFixed(2)}`}
          color="bg-gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="space-y-3">
            <a href="/estudiantes" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <h3 className="font-semibold text-primary">Gestión de Estudiantes</h3>
              <p className="text-sm text-gray-600">Registrar y administrar estudiantes</p>
            </a>
            <a href="/pagos" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <h3 className="font-semibold text-primary">Control de Pagos</h3>
              <p className="text-sm text-gray-600">Registrar pagos y consultar solvencia</p>
            </a>
            <a href="/contabilidad" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <h3 className="font-semibold text-primary">Contabilidad</h3>
              <p className="text-sm text-gray-600">Ingresos, gastos y reportes</p>
            </a>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-primary">
              <h3 className="font-semibold text-primary mb-1">Sistema Completo</h3>
              <p className="text-sm text-gray-700">
                Gestiona estudiantes, profesores, clases, pagos y contabilidad desde un solo lugar.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-gold">
              <h3 className="font-semibold text-gold mb-1">Raise your limits</h3>
              <p className="text-sm text-gray-700">
                Sistema diseñado para optimizar la administración de LEVEL UP S&A CENTER.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
