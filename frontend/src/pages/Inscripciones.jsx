import { useState, useEffect } from 'react';
import { inscripcionesAPI, estudiantesAPI, clasesAPI } from '../services/api';
import { Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

const Inscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [clases, setClases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClase, setSelectedClase] = useState(null);
  const [formData, setFormData] = useState({
    estudiante_id: '', clase_id: '', dia_pago: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [inscripRes, estudRes, clasesRes] = await Promise.all([
        inscripcionesAPI.getAll(),
        estudiantesAPI.getAll(),
        clasesAPI.getAll()
      ]);
      setInscripciones(inscripRes.data);
      setEstudiantes(estudRes.data);
      setClases(clasesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClaseSelect = (e) => {
    const claseId = e.target.value;
    const clase = clases.find(c => c.id == claseId);
    setSelectedClase(clase);
    setFormData({ ...formData, clase_id: claseId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inscripcionesAPI.create({
        ...formData,
        modalidad_pago: 'mensual'
      });
      setShowModal(false);
      loadData();
      resetForm();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta inscripción?')) {
      try {
        await inscripcionesAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ estudiante_id: '', clase_id: '', dia_pago: '' });
    setSelectedClase(null);
  };

  const getEstadoPago = (insc) => {
    if (!insc.ultima_fecha_vencimiento) return { texto: 'Sin pagos', color: 'bg-yellow-100 text-yellow-800' };
    const venc = new Date(insc.ultima_fecha_vencimiento);
    if (venc >= new Date()) return { texto: 'Al día', color: 'bg-green-100 text-green-800' };
    const diasMora = Math.floor((new Date() - venc) / (1000 * 60 * 60 * 24));
    return { texto: `Vencido (${diasMora} días)`, color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Inscripciones</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nueva Inscripción</span>
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Inscripciones Activas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Clase</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Horarios</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Día Cobro</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((insc) => {
                const estado = getEstadoPago(insc);
                return (
                  <tr key={insc.id} className="border-t">
                    <td className="px-4 py-3">{insc.estudiante_nombre}</td>
                    <td className="px-4 py-3 font-medium">{insc.clase_nombre}</td>
                    <td className="px-4 py-3 text-xs">
                      {(insc.horarios || []).map((h, i) => (
                        <span key={i} className="inline-block bg-gray-100 px-2 py-0.5 rounded mr-1 mb-1 capitalize">
                          {h.dia} {h.horaInicio}-{h.horaFin}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3 font-bold text-gold">${Number(insc.precio || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">Día {insc.dia_pago}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${estado.color}`}>{estado.texto}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(insc.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
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
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-primary mb-4">Nueva Inscripción</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Estudiante *</label>
                <select className="input-field" required
                  value={formData.estudiante_id}
                  onChange={(e) => setFormData({...formData, estudiante_id: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {estudiantes.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Clase *</label>
                <select className="input-field" required
                  value={formData.clase_id}
                  onChange={handleClaseSelect}>
                  <option value="">Seleccionar clase...</option>
                  {clases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} - ${Number(c.precio || 0).toLocaleString()}/mes - {c.frecuencia_semanal}x semana
                    </option>
                  ))}
                </select>
              </div>

              {selectedClase && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock size={16} className="text-primary" />
                    <span className="font-bold text-primary">Horarios de {selectedClase.nombre}</span>
                  </div>
                  <div className="space-y-1">
                    {(selectedClase.horarios || []).length > 0 ? (
                      selectedClase.horarios.map((h, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm">
                          <span className="capitalize font-medium w-24">{h.dia}</span>
                          <span>{h.horaInicio} - {h.horaFin}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Sin horarios configurados</p>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200 text-sm">
                    <span className="font-semibold">Precio mensual:</span> ${Number(selectedClase.precio || 0).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Frecuencia:</span> {selectedClase.frecuencia_semanal} día(s) por semana
                  </div>
                </div>
              )}

              <div>
                <label className="label">Día de cobro mensual (1-31) *</label>
                <input type="number" min="1" max="31" className="input-field" required
                  value={formData.dia_pago}
                  onChange={(e) => setFormData({...formData, dia_pago: e.target.value})}
                  placeholder="Ej: 15" />
                <p className="text-xs text-gray-500 mt-1">
                  El estudiante deberá pagar cada mes en este día. Si no paga, se marcará como vencido.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    Al inscribir, el estudiante tendrá 30 días para realizar su primer pago. Después deberá pagar mensualmente en el día indicado.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Inscribir</button>
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

export default Inscripciones;
