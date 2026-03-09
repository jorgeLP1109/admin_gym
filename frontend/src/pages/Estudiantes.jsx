import { useState, useEffect } from 'react';
import { estudiantesAPI } from '../services/api';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', identificacion: '', fecha_nacimiento: '',
    telefono: '', email: '', direccion: '', genero: '', es_menor_edad: false,
    tipo_sangre: '', alergias: '', condiciones_medicas: '', medicamentos_actuales: '',
    contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
    representante: {
      nombre_completo: '', identificacion: '', telefono: '', email: '', direccion: ''
    }
  });

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      const response = await estudiantesAPI.getAll();
      setEstudiantes(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '', apellido: '', identificacion: '', fecha_nacimiento: '',
      telefono: '', email: '', direccion: '', genero: '', es_menor_edad: false,
      tipo_sangre: '', alergias: '', condiciones_medicas: '', medicamentos_actuales: '',
      contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
      representante: {
        nombre_completo: '', identificacion: '', telefono: '', email: '', direccion: ''
      }
    });
    setIsEditing(false);
  };

  const handleView = async (id) => {
    try {
      const response = await estudiantesAPI.getById(id);
      setSelectedEstudiante(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await estudiantesAPI.getById(id);
      const data = response.data;
      setFormData({
        ...data,
        representante: data.representante || {
          nombre_completo: '', identificacion: '', telefono: '', email: '', direccion: ''
        }
      });
      setIsEditing(true);
      setShowModal(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await estudiantesAPI.update(formData.id, formData);
      } else {
        await estudiantesAPI.create(formData);
      }
      setShowModal(false);
      loadEstudiantes();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este estudiante?')) {
      try {
        await estudiantesAPI.delete(id);
        loadEstudiantes();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const filteredEstudiantes = estudiantes.filter(e =>
    `${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
    e.identificacion.includes(search)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Estudiantes</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nuevo Estudiante</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center space-x-2">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o identificación..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEstudiantes.map((estudiante) => (
          <div key={estudiante.id} className="card hover:shadow-xl transition cursor-pointer" onClick={() => handleView(estudiante.id)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {estudiante.nombre} {estudiante.apellido}
                </h3>
                <p className="text-sm text-gray-600">{estudiante.identificacion}</p>
              </div>
              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleEdit(estudiante.id)} className="text-blue-600 hover:text-blue-800" title="Editar">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(estudiante.id)} className="text-red-600 hover:text-red-800" title="Eliminar">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Teléfono:</span> {estudiante.telefono}</p>
              <p><span className="font-semibold">Email:</span> {estudiante.email}</p>
              {estudiante.es_menor_edad && (
                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                  Menor de edad
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showViewModal && selectedEstudiante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-primary mb-4">Información del Estudiante</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold">Nombre:</span> {selectedEstudiante.nombre} {selectedEstudiante.apellido}</div>
                <div><span className="font-semibold">Identificación:</span> {selectedEstudiante.identificacion}</div>
                <div><span className="font-semibold">Fecha Nacimiento:</span> {selectedEstudiante.fecha_nacimiento}</div>
                <div><span className="font-semibold">Teléfono:</span> {selectedEstudiante.telefono}</div>
                <div className="col-span-2"><span className="font-semibold">Email:</span> {selectedEstudiante.email}</div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-bold mb-2">Ficha Médica</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">Tipo Sangre:</span> {selectedEstudiante.tipo_sangre || 'N/A'}</div>
                  <div><span className="font-semibold">Alergias:</span> {selectedEstudiante.alergias || 'Ninguna'}</div>
                  <div className="col-span-2"><span className="font-semibold">Condiciones:</span> {selectedEstudiante.condiciones_medicas || 'Ninguna'}</div>
                  <div className="col-span-2"><span className="font-semibold">Medicamentos:</span> {selectedEstudiante.medicamentos_actuales || 'Ninguno'}</div>
                  <div><span className="font-semibold">Contacto Emergencia:</span> {selectedEstudiante.contacto_emergencia_nombre}</div>
                  <div><span className="font-semibold">Tel. Emergencia:</span> {selectedEstudiante.contacto_emergencia_telefono}</div>
                </div>
              </div>

              <button onClick={() => setShowViewModal(false)} className="btn-secondary w-full mt-4">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary mb-4">{isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input type="text" className="input-field" required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="label">Apellido *</label>
                  <input type="text" className="input-field" required
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
                </div>
                <div>
                  <label className="label">Identificación *</label>
                  <input type="text" className="input-field" required
                    value={formData.identificacion}
                    onChange={(e) => setFormData({...formData, identificacion: e.target.value})} />
                </div>
                <div>
                  <label className="label">Fecha de Nacimiento *</label>
                  <input type="date" className="input-field" required
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input type="tel" className="input-field"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Dirección</label>
                  <input type="text" className="input-field"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox"
                    checked={formData.es_menor_edad}
                    onChange={(e) => setFormData({...formData, es_menor_edad: e.target.checked})} />
                  <span>Es menor de edad</span>
                </label>
              </div>

              {formData.es_menor_edad && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3">Datos del Representante Legal</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Nombre Completo *</label>
                      <input type="text" className="input-field" required={formData.es_menor_edad}
                        value={formData.representante.nombre_completo}
                        onChange={(e) => setFormData({...formData, representante: {...formData.representante, nombre_completo: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Identificación *</label>
                      <input type="text" className="input-field" required={formData.es_menor_edad}
                        value={formData.representante.identificacion}
                        onChange={(e) => setFormData({...formData, representante: {...formData.representante, identificacion: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Teléfono *</label>
                      <input type="tel" className="input-field" required={formData.es_menor_edad}
                        value={formData.representante.telefono}
                        onChange={(e) => setFormData({...formData, representante: {...formData.representante, telefono: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" className="input-field"
                        value={formData.representante.email}
                        onChange={(e) => setFormData({...formData, representante: {...formData.representante, email: e.target.value}})} />
                    </div>
                    <div>
                      <label className="label">Dirección</label>
                      <input type="text" className="input-field"
                        value={formData.representante.direccion}
                        onChange={(e) => setFormData({...formData, representante: {...formData.representante, direccion: e.target.value}})} />
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3">Ficha Médica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tipo de Sangre</label>
                    <select className="input-field"
                      value={formData.tipo_sangre}
                      onChange={(e) => setFormData({...formData, tipo_sangre: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Alergias</label>
                    <input type="text" className="input-field" placeholder="Ej: Polen, medicamentos..."
                      value={formData.alergias}
                      onChange={(e) => setFormData({...formData, alergias: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Condiciones Médicas / Patologías</label>
                    <textarea className="input-field" rows="2" placeholder="Ej: Diabetes, asma, hipertensión..."
                      value={formData.condiciones_medicas}
                      onChange={(e) => setFormData({...formData, condiciones_medicas: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Medicamentos Actuales</label>
                    <textarea className="input-field" rows="2" placeholder="Medicamentos que toma regularmente..."
                      value={formData.medicamentos_actuales}
                      onChange={(e) => setFormData({...formData, medicamentos_actuales: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Contacto de Emergencia</label>
                    <input type="text" className="input-field" placeholder="Nombre completo"
                      value={formData.contacto_emergencia_nombre}
                      onChange={(e) => setFormData({...formData, contacto_emergencia_nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Teléfono de Emergencia</label>
                    <input type="tel" className="input-field"
                      value={formData.contacto_emergencia_telefono}
                      onChange={(e) => setFormData({...formData, contacto_emergencia_telefono: e.target.value})} />
                  </div>
                </div>
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

export default Estudiantes;
