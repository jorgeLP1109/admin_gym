import { useState, useEffect } from 'react';
import { cortesiaAPI, clasesAPI } from '../services/api';
import { Plus, UserCheck, Trash2, BarChart3 } from 'lucide-react';

const Cortesia = () => {
  const [activeTab, setActiveTab] = useState('registro');
  const [cortesias, setCortesias] = useState([]);
  const [clases, setClases] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '', email: '', clase_id: '', notas: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cortRes, clasesRes, statsRes] = await Promise.all([
        cortesiaAPI.getAll(),
        clasesAPI.getAll(),
        cortesiaAPI.getEstadisticas()
      ]);
      setCortesias(cortRes.data || []);
      setClases(clasesRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cortesiaAPI.create(formData);
      setShowModal(false);
      setFormData({ nombre: '', apellido: '', telefono: '', email: '', clase_id: '', notas: '' });
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleConvertir = async (id) => {
    if (!confirm('¿Convertir a estudiante formal? Se agregará a la lista de estudiantes.')) return;
    try {
      const res = await cortesiaAPI.convertir(id);
      alert('✅ ' + res.data.message);
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await cortesiaAPI.delete(id);
      loadData();
    } catch (error) {
      alert('Error');
    }
  };

  const getPeriodoLabel = (fecha, tipo) => {
    const d = new Date(fecha);
    if (tipo === 'semana') return `Sem ${d.toLocaleDateString('es', { day: '2-digit', month: 'short' })}`;
    if (tipo === 'mes') return d.toLocaleDateString('es', { month: 'short', year: '2-digit' });
    if (tipo === 'trimestre') return `T${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
    return d.getFullYear().toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Clases de Cortesía</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus size={20} /><span>Registrar Cortesía</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab('registro')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'registro' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
          Registros
        </button>
        <button onClick={() => setActiveTab('estadisticas')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'estadisticas' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
          Estadísticas
        </button>
      </div>

      {activeTab === 'registro' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Clase</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cortesias.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-3 text-sm">{new Date(c.fecha_cortesia).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{c.nombre} {c.apellido}</td>
                    <td className="px-4 py-3 text-sm">{c.telefono || '-'}</td>
                    <td className="px-4 py-3 text-sm">{c.clase_nombre || '-'}</td>
                    <td className="px-4 py-3">
                      {c.convertido ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">✓ Inscrito</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {!c.convertido && (
                          <button onClick={() => handleConvertir(c.id)} className="text-green-600 hover:text-green-800" title="Convertir a formal">
                            <UserCheck size={18} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cortesias.length === 0 && <p className="text-center text-gray-500 py-8">Sin registros de cortesía</p>}
          </div>
        </div>
      )}

      {activeTab === 'estadisticas' && stats && (
        <div className="space-y-6">
          {/* Resumen general */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50 text-center">
              <p className="text-sm text-gray-600">Total Cortesías</p>
              <p className="text-4xl font-bold text-primary">{stats.resumen.total}</p>
            </div>
            <div className="card bg-green-50 text-center">
              <p className="text-sm text-gray-600">Convertidos a Formal</p>
              <p className="text-4xl font-bold text-green-600">{stats.resumen.convertidos}</p>
            </div>
            <div className="card text-center" style={{ background: 'linear-gradient(135deg, #2B4C9F11, #D4AF3711)' }}>
              <p className="text-sm text-gray-600">Tasa de Conversión</p>
              <p className="text-4xl font-bold text-gold">{stats.resumen.tasa}%</p>
            </div>
          </div>

          {/* Gráfico de conversión (donut) */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Tasa de Conversión General</h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#D4AF37" strokeWidth="3"
                    strokeDasharray={`${stats.resumen.tasa}, 100`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{stats.resumen.tasa}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-gold" />
                  <span>Convertidos ({stats.resumen.convertidos})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <span>No convertidos ({stats.resumen.total - stats.resumen.convertidos})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas por período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semanal */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Semanal (últimas 4 semanas)</h3>
              {stats.semanal.length > 0 ? (
                <div className="space-y-3">
                  {stats.semanal.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm w-24">{getPeriodoLabel(s.semana, 'semana')}</span>
                      <div className="flex-1 mx-3 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="bg-primary h-full" style={{ width: `${(s.total / Math.max(...stats.semanal.map(x => x.total))) * 70}%` }} />
                        <div className="bg-gold h-full" style={{ width: `${s.total > 0 ? (s.convertidos / s.total) * 30 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{s.convertidos}/{s.total}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">Sin datos</p>}
            </div>

            {/* Mensual */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Mensual (últimos 6 meses)</h3>
              {stats.mensual.length > 0 ? (
                <div className="space-y-3">
                  {stats.mensual.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm w-24 capitalize">{getPeriodoLabel(m.mes, 'mes')}</span>
                      <div className="flex-1 mx-3 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="bg-primary h-full" style={{ width: `${(m.total / Math.max(...stats.mensual.map(x => x.total))) * 70}%` }} />
                        <div className="bg-gold h-full" style={{ width: `${m.total > 0 ? (m.convertidos / m.total) * 30 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{m.convertidos}/{m.total}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">Sin datos</p>}
            </div>

            {/* Trimestral */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Trimestral</h3>
              {stats.trimestral.length > 0 ? (
                <div className="space-y-3">
                  {stats.trimestral.map((t, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm w-24">{getPeriodoLabel(t.trimestre, 'trimestre')}</span>
                      <div className="flex-1 mx-3 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="bg-primary h-full" style={{ width: `${(t.total / Math.max(...stats.trimestral.map(x => x.total))) * 70}%` }} />
                        <div className="bg-gold h-full" style={{ width: `${t.total > 0 ? (t.convertidos / t.total) * 30 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{t.convertidos}/{t.total}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">Sin datos</p>}
            </div>

            {/* Por clase */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Por Clase</h3>
              {stats.porClase.length > 0 ? (
                <div className="space-y-3">
                  {stats.porClase.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm w-24 truncate">{c.clase || 'Sin clase'}</span>
                      <div className="flex-1 mx-3 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="bg-primary h-full" style={{ width: `${(c.total / Math.max(...stats.porClase.map(x => x.total))) * 70}%` }} />
                        <div className="bg-gold h-full" style={{ width: `${c.total > 0 ? (c.convertidos / c.total) * 30 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{c.convertidos}/{c.total}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">Sin datos</p>}
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded bg-primary" /><span>Total cortesías</span></div>
            <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded bg-gold" /><span>Convertidos</span></div>
            <span className="text-xs">Formato: convertidos/total</span>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-primary mb-4">Registrar Clase de Cortesía</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input type="text" className="input-field" required value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="label">Apellido</label>
                  <input type="text" className="input-field" value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Teléfono</label>
                  <input type="tel" className="input-field" value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Clase de Prueba *</label>
                <select className="input-field" required value={formData.clase_id}
                  onChange={(e) => setFormData({ ...formData, clase_id: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {clases.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea className="input-field" rows="2" value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Registrar</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cortesia;
