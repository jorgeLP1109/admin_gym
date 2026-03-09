import { useState, useEffect } from 'react';
import { inscripcionesAPI, estudiantesAPI, clasesAPI } from '../services/api';
import { Plus, Trash2, Calendar } from 'lucide-react';

const Inscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [clases, setClases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    clase_id: '',
    modalidad_pago: 'mensual',
    dia_pago: '',
    dia_pago_secundario: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inscripcionesAPI.create(formData);
      setShowModal(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
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
    setFormData({
      estudiante_id: '',
      clase_id: '',
      modalidad_pago: 'mensual',
      dia_pago: '',
      dia_pago_secundario: ''
    });
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
                <th className="px-4 py-3 text-left text-sm font-semibold">Modalidad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Día(s) de Pago</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((insc) => (
                <tr key={insc.id} className="border-t">
                  <td className="px-4 py-3">{insc.estudiante_nombre}</td>
                  <td className="px-4 py-3">{insc.clase_nombre}</td>
                  <td className="px-4 py-3 capitalize">{insc.modalidad_pago}</td>
                  <td className="px-4 py-3">
                    {insc.modalidad_pago === 'quincenal' && insc.dia_pago_secundario
                      ? `Día ${insc.dia_pago} y ${insc.dia_pago_secundario}`
                      : `Día ${insc.dia_pago}`}
                  </td>
                  <td className="px-4 py-3 font-bold text-gold">
                    ${insc.modalidad_pago === 'mensual' ? insc.precio_mensual : insc.precio_quincenal}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(insc.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
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
                  onChange={(e) => setFormData({...formData, clase_id: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {clases.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Modalidad de Pago *</label>
                <select className="input-field" required
                  value={formData.modalidad_pago}
                  onChange={(e) => setFormData({...formData, modalidad_pago: e.target.value, dia_pago_secundario: ''})}>
                  <option value="mensual">Mensual</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="diario">Diario</option>
                </select>
              </div>

              {formData.modalidad_pago === 'mensual' && (
                <div>
                  <label className="label">Día de Pago del Mes (1-31) *</label>
                  <input type="number" min="1" max="31" className="input-field" required
                    value={formData.dia_pago}
                    onChange={(e) => setFormData({...formData, dia_pago: e.target.value})}
                    placeholder="Ej: 28 (paga cada 28 del mes)" />
                  <p className="text-xs text-gray-500 mt-1">El estudiante pagará cada día {formData.dia_pago || '__'} de cada mes</p>
                </div>
              )}

              {formData.modalidad_pago === 'quincenal' && (
                <div className="space-y-3">
                  <div>
                    <label className="label">Primer Día de Pago (1-31) *</label>
                    <input type="number" min="1" max="31" className="input-field" required
                      value={formData.dia_pago}
                      onChange={(e) => setFormData({...formData, dia_pago: e.target.value})}
                      placeholder="Ej: 5" />
                  </div>
                  <div>
                    <label className="label">Segundo Día de Pago (1-31) *</label>
                    <input type="number" min="1" max="31" className="input-field" required
                      value={formData.dia_pago_secundario}
                      onChange={(e) => setFormData({...formData, dia_pago_secundario: e.target.value})}
                      placeholder="Ej: 20" />
                  </div>
                  <p className="text-xs text-gray-500">El estudiante pagará cada día {formData.dia_pago || '__'} y {formData.dia_pago_secundario || '__'} de cada mes</p>
                </div>
              )}

              {formData.modalidad_pago === 'diario' && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <Calendar className="inline mr-2" size={16} />
                    Modalidad diaria: El estudiante paga por cada día de asistencia
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Guardar</button>
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
