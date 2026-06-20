import { useState, useEffect } from 'react';
import { levelupAPI } from '../services/api';
import { RefreshCw, DollarSign, Users, CheckCircle, XCircle } from 'lucide-react';

const LevelUpSync = () => {
  const [activeTab, setActiveTab] = useState('transacciones');
  const [transacciones, setTransacciones] = useState([]);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoForm, setPagoForm] = useState({
    userId: '', classId: '', monto: '', metodo_pago: 'efectivo', referencia: '', notas: '', alumno_nombre: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, classesRes] = await Promise.all([
        levelupAPI.getUsers(),
        levelupAPI.getClasses()
      ]);
      setUsers(usersRes.data || []);
      setClasses(classesRes.data || []);
    } catch (error) {
      console.error('Error cargando datos Level Up:', error);
    }
    setLoading(false);
  };

  const syncTransacciones = async () => {
    setLoading(true);
    try {
      const res = await levelupAPI.getTransacciones();
      setTransacciones(res.data || []);
    } catch (error) {
      alert('Error al sincronizar transacciones');
    }
    setLoading(false);
  };

  const handlePagoManual = async (e) => {
    e.preventDefault();
    try {
      await levelupAPI.registrarPagoManual(pagoForm);
      alert('✅ Pago registrado y solvencia actualizada en Level Up');
      setShowPagoModal(false);
      setPagoForm({ userId: '', classId: '', monto: '', metodo_pago: 'efectivo', referencia: '', notas: '', alumno_nombre: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUserSelect = (e) => {
    const user = users.find(u => u._id === e.target.value);
    setPagoForm({ ...pagoForm, userId: e.target.value, alumno_nombre: user?.nombre || '' });
  };

  const handleClassSelect = (e) => {
    const clase = classes.find(c => c._id === e.target.value);
    setPagoForm({ ...pagoForm, classId: e.target.value, monto: clase?.precio || '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Integración Level Up</h1>

      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab('transacciones')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'transacciones' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
          Pagos desde App
        </button>
        <button onClick={() => setActiveTab('pago-manual')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'pago-manual' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
          Pago Manual
        </button>
        <button onClick={() => setActiveTab('solvencia')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'solvencia' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
          Estado Solvencia
        </button>
      </div>

      {activeTab === 'transacciones' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Transacciones Wompi (App)</h2>
            <button onClick={syncTransacciones} disabled={loading}
              className="btn-primary flex items-center space-x-2">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Sincronizar</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Alumno</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Concepto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((t) => (
                  <tr key={t._id || t.referencia} className="border-t">
                    <td className="px-4 py-3">{new Date(t.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{t.alumno?.nombre || 'N/A'}</td>
                    <td className="px-4 py-3">{t.conceptos || t.items?.map(i => i.nombre).join(', ')}</td>
                    <td className="px-4 py-3 font-bold">${Number(t.monto || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${t.estado === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {t.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.referencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transacciones.length === 0 && (
              <p className="text-center text-gray-500 py-8">Click "Sincronizar" para cargar transacciones</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pago-manual' && (
        <div className="card max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Registrar Pago Manual</h2>
          <p className="text-sm text-gray-600 mb-4">Registra pagos en efectivo/transferencia y actualiza solvencia en Level Up automáticamente.</p>
          <form onSubmit={handlePagoManual} className="space-y-4">
            <div>
              <label className="label">Alumno (Level Up) *</label>
              <select className="input-field" required value={pagoForm.userId} onChange={handleUserSelect}>
                <option value="">Seleccionar alumno...</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.nombre} - {u.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Clase *</label>
              <select className="input-field" required value={pagoForm.classId} onChange={handleClassSelect}>
                <option value="">Seleccionar clase...</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre} - ${Number(c.precio || 0).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Monto (COP) *</label>
                <input type="number" className="input-field" required
                  value={pagoForm.monto}
                  onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })} />
              </div>
              <div>
                <label className="label">Método de Pago *</label>
                <select className="input-field" value={pagoForm.metodo_pago}
                  onChange={(e) => setPagoForm({ ...pagoForm, metodo_pago: e.target.value })}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Referencia</label>
              <input type="text" className="input-field" placeholder="Número de transferencia, etc."
                value={pagoForm.referencia}
                onChange={(e) => setPagoForm({ ...pagoForm, referencia: e.target.value })} />
            </div>
            <div>
              <label className="label">Notas</label>
              <textarea className="input-field" rows="2"
                value={pagoForm.notas}
                onChange={(e) => setPagoForm({ ...pagoForm, notas: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary w-full">
              Registrar Pago y Actualizar Solvencia
            </button>
          </form>
        </div>
      )}

      {activeTab === 'solvencia' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Estado de Solvencia (Level Up)</h2>
            <button onClick={loadData} disabled={loading} className="btn-primary flex items-center space-x-2">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Alumno</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Estado Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Vencimiento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Solvente</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const vencimiento = u.fechaVencimiento ? new Date(u.fechaVencimiento) : null;
                  const solvente = vencimiento && vencimiento >= new Date();
                  return (
                    <tr key={u._id} className="border-t">
                      <td className="px-4 py-3 font-medium">{u.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${u.estadoPlan === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.estadoPlan || 'SIN PLAN'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {vencimiento ? vencimiento.toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {solvente ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-gray-500 py-8">Cargando usuarios...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelUpSync;
