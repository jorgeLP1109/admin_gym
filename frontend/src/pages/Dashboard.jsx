import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Calendar, TrendingUp, DollarSign, UserCheck, UserX, Zap } from 'lucide-react';
import { estudiantesAPI, profesoresAPI, clasesAPI, contabilidadAPI, pagosAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    estudiantes: 0, profesores: 0, clases: 0, balance: 0,
    ingresos: 0, gastos: 0, solventes: 0, morosos: 0
  });
  const [ultimosIngresos, setUltimosIngresos] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [estudiantes, profesores, clases, resumen, solventes, morosos, transacciones] = await Promise.all([
        estudiantesAPI.getAll(),
        profesoresAPI.getAll(),
        clasesAPI.getAll(),
        contabilidadAPI.getResumen({}),
        pagosAPI.getSolventes(),
        pagosAPI.getMorosos(),
        contabilidadAPI.getTransacciones({})
      ]);

      setStats({
        estudiantes: estudiantes.data?.length || 0,
        profesores: profesores.data?.length || 0,
        clases: clases.data?.length || 0,
        balance: Number(resumen.data?.balance || 0),
        ingresos: Number(resumen.data?.total_ingresos || 0),
        gastos: Number(resumen.data?.total_gastos || 0),
        solventes: solventes.data?.length || 0,
        morosos: morosos.data?.length || 0
      });

      // Últimos 7 ingresos para el gráfico
      const ingresos = (transacciones.data || [])
        .filter(t => t.tipo === 'ingreso')
        .slice(0, 7)
        .reverse();
      setUltimosIngresos(ingresos);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const maxIngreso = Math.max(...ultimosIngresos.map(i => Number(i.monto || 0)), 1);

  const porcentajeSolventes = stats.solventes + stats.morosos > 0
    ? Math.round((stats.solventes / (stats.solventes + stats.morosos)) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Bienvenido a <span className="text-gold">LEVEL UP</span>
        </h1>
        <p className="text-gray-600">Panel de control administrativo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-blue-100">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Estudiantes</p>
              <p className="text-2xl font-bold">{stats.estudiantes}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-green-100">
              <GraduationCap size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Profesores</p>
              <p className="text-2xl font-bold">{stats.profesores}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Clases</p>
              <p className="text-2xl font-bold">{stats.clases}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-yellow-100">
              <TrendingUp size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-2xl font-bold">${stats.balance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de barras - Últimos ingresos */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Últimos Ingresos</h2>
          <div className="flex items-end space-x-2 h-48">
            {ultimosIngresos.map((ingreso, i) => {
              const altura = (Number(ingreso.monto) / maxIngreso) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-xs text-gray-600 mb-1">${Number(ingreso.monto).toLocaleString()}</span>
                  <div
                    className="w-full bg-primary rounded-t-md transition-all hover:bg-blue-700"
                    style={{ height: `${altura}%`, minHeight: '8px' }}
                    title={`${ingreso.concepto}: $${Number(ingreso.monto).toLocaleString()}`}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(ingreso.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
            {ultimosIngresos.length === 0 && (
              <p className="text-gray-400 text-sm w-full text-center">Sin ingresos registrados</p>
            )}
          </div>
        </div>

        {/* Gráfico circular - Solvencia */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Estado de Solvencia</h2>
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#fee2e2" strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${porcentajeSolventes}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{porcentajeSolventes}%</span>
              </div>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Solventes ({stats.solventes})</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-200" />
                <span>Morosos ({stats.morosos})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen financiero + Accesos rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen financiero */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen Financiero</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign size={20} className="text-green-600" />
                <span className="font-medium">Ingresos Totales</span>
              </div>
              <span className="text-lg font-bold text-green-600">${stats.ingresos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign size={20} className="text-red-600" />
                <span className="font-medium">Gastos Totales</span>
              </div>
              <span className="text-lg font-bold text-red-600">${stats.gastos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-primary">
              <div className="flex items-center space-x-2">
                <TrendingUp size={20} className="text-primary" />
                <span className="font-bold">Balance Neto</span>
              </div>
              <span className="text-xl font-bold text-primary">${stats.balance.toLocaleString()}</span>
            </div>
            {/* Barra de proporción */}
            <div className="mt-2">
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                <div className="bg-green-500 transition-all" style={{ width: `${stats.ingresos + stats.gastos > 0 ? (stats.ingresos / (stats.ingresos + stats.gastos)) * 100 : 50}%` }} />
                <div className="bg-red-400 transition-all" style={{ width: `${stats.ingresos + stats.gastos > 0 ? (stats.gastos / (stats.ingresos + stats.gastos)) * 100 : 50}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Ingresos</span>
                <span>Gastos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/estudiantes" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center">
              <Users size={28} className="text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Estudiantes</p>
            </Link>
            <Link to="/pagos" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center">
              <DollarSign size={28} className="text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Pagos</p>
            </Link>
            <Link to="/inscripciones" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center">
              <UserCheck size={28} className="text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Inscripciones</p>
            </Link>
            <Link to="/contabilidad" className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center">
              <TrendingUp size={28} className="text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Contabilidad</p>
            </Link>
            <Link to="/levelup" className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition text-center">
              <Zap size={28} className="text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Level Up</p>
            </Link>
            <Link to="/reportes" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-center">
              <UserX size={28} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Reportes</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
