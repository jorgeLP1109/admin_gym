import { useState, useEffect } from 'react';
import { clasesAPI, profesoresAPI } from '../services/api';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', profesor_id: '', precio: '',
    frecuencia_semanal: '1', capacidad_maxima: '', horarios: []
  });

  useEffect(() => {
    loadClases();
    loadProfesores();
  }, []);

  const loadClases = async () => {
    try {
      const response = await clasesAPI.getAll();
      setClases(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadProfesores = async () => {
    try {
      const response = await profesoresAPI.getAll();
      setProfesores(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '', descripcion: '', profesor_id: '', precio: '',
      frecuencia_semanal: '1', capacidad_maxima: '', horarios: []
    });
    setIsEditing(false);
  };

  const handleFrecuenciaChange = (freq) => {
    const numDias = parseInt(freq);
    const horarios = Array.from({ length: numDias }, (_, i) => ({
      dia: formData.horarios[i]?.dia || '',
      horaInicio: formData.horarios[i]?.horaInicio || '16:00',
      horaFin: formData.horarios[i]?.horaFin || '17:30'
    }));
    setFormData({ ...formData, frecuencia_semanal: freq, horarios });
  };

  const updateHorario = (index, field, value) => {
    const horarios = [...formData.horarios];
    horarios[index] = { ...horarios[index], [field]: value };
    setFormData({ ...formData, horarios });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : null,
        frecuencia_semanal: parseInt(formData.frecuencia_semanal),
        horarios: formData.horarios
      };

      if (isEditing) {
        await clasesAPI.update(formData.id, dataToSend);
      } else {
        await clasesAPI.create(dataToSend);
      }
      setShowModal(false);
      loadClases();
      resetForm();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (clase) => {
    const horarios = clase.horarios || [];
    setFormData({
      id: clase.id,
      nombre: clase.nombre,
      descripcion: clase.descripcion || '',
      profesor_id: clase.profesor_id || '',
      precio: clase.precio,
      frecuencia_semanal: String(clase.frecuencia_semanal || 1),
      capacidad_maxima: clase.capacidad_maxima || '',
      horarios: horarios.length > 0 ? horarios : [{ dia: '', horaInicio: '16:00', horaFin: '17:30' }]
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta clase?')) {
      try {
        await clasesAPI.delete(id);
        loadClases();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const formatHorarios = (horarios) => {
    if (!horarios || horarios.length === 0) return 'Sin horario';
    return horarios.map(h => `${h.dia || '?'} ${h.horaInicio}-${h.horaFin}`).join(' | ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Clases</h1>
        <button onClick={() => { resetForm(); handleFrecuenciaChange('1'); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nueva Clase</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clases.map((clase) => (
          <div key={clase.id} className="card hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{clase.nombre}</h3>
                <p className="text-sm text-gray-600">{clase.profesor_nombre}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(clase)} className="text-blue-600 hover:text-blue-800">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(clase.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">{clase.descripcion}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Precio:</span>
                <span className="text-gold font-bold">${Number(clase.precio || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Frecuencia:</span>
                <span>{clase.frecuencia_semanal}x semana</span>
              </div>
              <div className="text-sm">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock size={14} />
                  <span className="font-semibold">Horarios:</span>
                </div>
                <div className="mt-1 space-y-1">
                  {(clase.horarios || []).map((h, i) => (
                    <div key={i} className="bg-gray-100 px-2 py-1 rounded text-xs capitalize">
                      {h.dia}: {h.horaInicio} - {h.horaFin}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary mb-4">{isEditing ? 'Editar Clase' : 'Nueva Clase'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input type="text" className="input-field" required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="input-field" rows="2"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})} />
              </div>
              <div>
                <label className="label">Profesor *</label>
                <select className="input-field" required
                  value={formData.profesor_id}
                  onChange={(e) => setFormData({...formData, profesor_id: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {profesores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Precio (COP) *</label>
                  <input type="number" className="input-field" required
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})} />
                </div>
                <div>
                  <label className="label">Días por Semana *</label>
                  <select className="input-field" required
                    value={formData.frecuencia_semanal}
                    onChange={(e) => handleFrecuenciaChange(e.target.value)}>
                    <option value="1">1 día</option>
                    <option value="2">2 días</option>
                    <option value="3">3 días</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3">Horarios</h3>
                {formData.horarios.map((horario, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="label text-xs">Día {index + 1} *</label>
                      <select className="input-field" required value={horario.dia}
                        onChange={(e) => updateHorario(index, 'dia', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {DIAS_SEMANA.map(d => (
                          <option key={d} value={d} className="capitalize">{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Hora Inicio *</label>
                      <input type="time" className="input-field" required value={horario.horaInicio}
                        onChange={(e) => updateHorario(index, 'horaInicio', e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Hora Fin *</label>
                      <input type="time" className="input-field" required value={horario.horaFin}
                        onChange={(e) => updateHorario(index, 'horaFin', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="label">Capacidad Máxima</label>
                <input type="number" className="input-field"
                  value={formData.capacidad_maxima}
                  onChange={(e) => setFormData({...formData, capacidad_maxima: e.target.value})} />
              </div>

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

export default Clases;
