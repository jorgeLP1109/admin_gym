import { useState, useEffect } from 'react';
import { profesoresAPI } from '../services/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', identificacion: '', telefono: '',
    email: '', especialidad: ''
  });

  useEffect(() => {
    loadProfesores();
  }, []);

  const loadProfesores = async () => {
    try {
      const response = await profesoresAPI.getAll();
      setProfesores(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profesoresAPI.create(formData);
      setShowModal(false);
      loadProfesores();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este profesor?')) {
      try {
        await profesoresAPI.delete(id);
        loadProfesores();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Profesores</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nuevo Profesor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profesores.map((profesor) => (
          <div key={profesor.id} className="card hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {profesor.nombre} {profesor.apellido}
                </h3>
                <p className="text-sm text-gold font-semibold">{profesor.especialidad}</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(profesor.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">ID:</span> {profesor.identificacion}</p>
              <p><span className="font-semibold">Teléfono:</span> {profesor.telefono}</p>
              <p><span className="font-semibold">Email:</span> {profesor.email}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-primary mb-4">Nuevo Profesor</h2>
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
                <div>
                  <label className="label">Especialidad</label>
                  <input type="text" className="input-field"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({...formData, especialidad: e.target.value})} />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
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

export default Profesores;
