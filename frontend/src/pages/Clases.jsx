import { useState, useEffect } from 'react';
import { clasesAPI, profesoresAPI } from '../services/api';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', profesor_id: '', precio_mensual: '',
    precio_quincenal: '', precio_diario: '', capacidad_maxima: '', horarios: []
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Preparar datos, convertir campos vacíos a null
      const dataToSend = {
        ...formData,
        capacidad_maxima: formData.capacidad_maxima ? parseInt(formData.capacidad_maxima) : null,
        horarios: formData.horarios.length > 0 ? formData.horarios : []
      };
      
      await clasesAPI.create(dataToSend);
      setShowModal(false);
      loadClases();
      setFormData({
        nombre: '', descripcion: '', profesor_id: '', precio_mensual: '',
        precio_quincenal: '', capacidad_maxima: '', horarios: []
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear clase: ' + (error.response?.data?.error || error.message));
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Clases</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
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
                <button className="text-blue-600 hover:text-blue-800">
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
                <span className="font-semibold">Mensual:</span>
                <span className="text-gold font-bold">${clase.precio_mensual}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Quincenal:</span>
                <span className="text-gold font-bold">${clase.precio_quincenal}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-primary mb-4">Nueva Clase</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input type="text" className="input-field" required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea className="input-field" rows="3"
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Precio Mensual *</label>
                  <input type="number" step="0.01" className="input-field" required
                    value={formData.precio_mensual}
                    onChange={(e) => setFormData({...formData, precio_mensual: e.target.value})} />
                </div>
                <div>
                  <label className="label">Precio Quincenal *</label>
                  <input type="number" step="0.01" className="input-field" required
                    value={formData.precio_quincenal}
                    onChange={(e) => setFormData({...formData, precio_quincenal: e.target.value})} />
                </div>
                <div>
                  <label className="label">Precio Diario</label>
                  <input type="number" step="0.01" className="input-field"
                    value={formData.precio_diario}
                    onChange={(e) => setFormData({...formData, precio_diario: e.target.value})} />
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

export default Clases;
