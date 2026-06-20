import { useState, useEffect } from 'react';
import { pagosAPI, inscripcionesAPI } from '../services/api';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [solventes, setSolventes] = useState([]);
  const [morosos, setMorosos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInscripcion, setSelectedInscripcion] = useState(null);
  const [formData, setFormData] = useState({
    inscripcion_id: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    referencia: '',
    notas: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  // Calcular fecha de vencimiento automáticamente (30 días después del pago)
  useEffect(() => {
    if (formData.fecha_pago) {
      const d = new Date(formData.fecha_pago);
      d.setDate(d.getDate() + 30);
      setFormData(prev => ({ ...prev, fecha_vencimiento: d.toISOString().split('T')[0] }));
    }
  }, [formData.fecha_pago]);

  const loadData = async () => {
    try {
      const [pagosRes, solventesRes, morososRes, inscripRes] = await Promise.all([
        pagosAPI.getAll(),
        pagosAPI.getSolventes(),
        pagosAPI.getMorosos(),
        inscripcionesAPI.getAll()
      ]);
      setPagos(pagosRes.data || []);
      setSolventes(solventesRes.data || []);
      setMorosos(morososRes.data || []);
      setInscripciones(inscripRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInscripcionChange = (e) => {
    const inscId = e.target.value;
    const insc = inscripciones.find(i => i.id == inscId);
    setSelectedInscripcion(insc);
    setFormData({
      ...formData,
      inscripcion_id: inscId,
      monto: insc ? String(insc.precio) : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.inscripcion_id) {
      alert('Selecciona una inscripción');
      return;
    }
    try {
      await pagosAPI.create(formData);
      setShowModal(false);
      loadData();
      resetForm();
      alert('✅ Pago registrado correctamente en pagos y contabilidad');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      inscripcion_id: '',
      monto: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: 'efectivo',
      referencia: '',
      notas: ''
    });
    setSelectedInscripcion(null);
  };

  const getEstadoVencimiento = (pago) => {
    if (!pago.fecha_vencimiento) return null;
    const venc = new Date(pago.fecha_vencimiento);
    const hoy = new Date();
    if (venc >= hoy) {
      const diasRestantes = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
      return { texto: `${diasRestantes}d restantes`, color: 'text-green-600' };
    }
    const diasVencido = Math.ceil((hoy - venc) / (1000 * 60 * 60 * 24));
    return { texto: `Vencido ${diasVencido}d`, color: 'text-red-600' };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Control de Pagos</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Registrar Pago</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-green-50">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-500" size={32} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Estudiantes Solventes</h2>
              <p className="text-3xl font-bold text-green-600">{solventes.length}</p>
            </div>
          </div>
          <div className="mt-3 max-h-40 overflow-y-auto">
            {solventes.map(e => (
              <p key={e.id} className="text-sm text-gray-700">{e.nombre} {e.apellido}</p>
            ))}
          </div>
        </div>

        <div className="card bg-red-50">
          <div className="flex items-center space-x-3">
            <XCircle className="text-red-500" size={32} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Estudiantes Morosos</h2>
              <p className="text-3xl font-bold text-red-600">{morosos.length}</p>
            </div>
          </div>
          <div className="mt-3 max-h-40 overflow-y-auto">
            {morosos.map(e => (
              <p key={e.id} className="text-sm text-gray-700">
                {e.nombre} {e.apellido}
                {e.dias_mora && <span className="text-red-600 ml-2">({e.dias_mora} días)</span>}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Pagos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Clase</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Método</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Vencimiento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => {
                const estado = getEstadoVencimiento(pago);
                return (
                  <tr key={pago.id} className="border-t">
                    <td className="px-4 py-3 text-sm">{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{pago.estudiante_nombre}</td>
                    <td className="px-4 py-3">{pago.clase_nombre}</td>
                    <td className="px-4 py-3 font-bold text-gold">${Number(pago.monto || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize text-sm">{pago.metodo_pago}</td>
                    <td className="px-4 py-3 text-sm">{pago.fecha_vencimiento ? new Date(pago.fecha_vencimiento).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {estado && <span className={`font-semibold ${estado.color}`}>{estado.texto}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary mb-4">Registrar Pago</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="label">Inscripción (Estudiante - Clase) *</label>
                <select className="input-field" required value={formData.inscripcion_id} onChange={handleInscripcionChange}>
                  <option value="">Seleccionar inscripción...</option>
                  {inscripciones.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.estudiante_nombre} → {i.clase_nombre} (${Number(i.precio || 0).toLocaleString()}/mes)
                    </option>
                  ))}
                </select>
              </div>

              {selectedInscripcion && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p><span className="font-semibold">Estudiante:</span> {selectedInscripcion.estudiante_nombre}</p>
                  <p><span className="font-semibold">Clase:</span> {selectedInscripcion.clase_nombre}</p>
                  <p><span className="font-semibold">Precio mensual:</span> ${Number(selectedInscripcion.precio || 0).toLocaleString()}</p>
                  <p><span className="font-semibold">Frecuencia:</span> {selectedInscripcion.frecuencia_semanal}x semana</p>
                  {selectedInscripcion.ultima_fecha_vencimiento && (
                    <p><span className="font-semibold">Último vencimiento:</span> {new Date(selectedInscripcion.ultima_fecha_vencimiento).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Monto (COP) *</label>
                  <input type="number" className="input-field bg-gray-50" required
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})} />
                </div>
                <div>
                  <label className="label">Método de Pago *</label>
                  <select className="input-field" required value={formData.metodo_pago}
                    onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha de Pago *</label>
                  <input type="date" className="input-field" required
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})} />
                </div>
                <div>
                  <label className="label">Vencimiento (auto 30 días)</label>
                  <input type="date" className="input-field bg-gray-100" readOnly
                    value={formData.fecha_vencimiento || ''} />
                </div>
              </div>

              {(formData.metodo_pago !== 'efectivo') && (
                <div>
                  <label className="label">Referencia / Comprobante</label>
                  <input type="text" className="input-field" placeholder="Número de transacción"
                    value={formData.referencia}
                    onChange={(e) => setFormData({...formData, referencia: e.target.value})} />
                </div>
              )}

              <div>
                <label className="label">Notas</label>
                <input type="text" className="input-field" placeholder="Observaciones (opcional)"
                  value={formData.notas}
                  onChange={(e) => setFormData({...formData, notas: e.target.value})} />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                ✅ Este pago se registrará automáticamente en la contabilidad como ingreso.
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Registrar Pago</button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagos;
