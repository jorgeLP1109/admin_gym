import { useState, useEffect } from 'react';
import { asistenciasAPI, estudiantesAPI, clasesAPI } from '../services/api';
import { Plus, Calendar } from 'lucide-react';

const Asistencias = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [clases, setClases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mesActual] = useState(new Date().getMonth() + 1);
  const [anioActual] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    estudiante_id: '',
    clase_id: '',
    fecha: new Date().toISOString().split('T')[0],
    presente: true,
    notas: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar solo asistencias del mes actual
      const primerDia = new Date(anioActual, mesActual - 1, 1).toISOString().split('T')[0];
      const ultimoDia = new Date(anioActual, mesActual, 0).toISOString().split('T')[0];
      
      const [asistRes, estudRes, clasesRes] = await Promise.all([
        asistenciasAPI.getAll({ fecha_inicio: primerDia, fecha_fin: ultimoDia }),
        estudiantesAPI.getAll(),
        clasesAPI.getAll()
      ]);
      setAsistencias(asistRes.data);
      setEstudiantes(estudRes.data);
      setClases(clasesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await asistenciasAPI.create(formData);
      setShowModal(false);
      loadData();
      setFormData({
        estudiante_id: '',
        clase_id: '',
        fecha: new Date().toISOString().split('T')[0],
        presente: true,
        notas: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Control de Asistencias</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Registrar Asistencia</span>
        </button>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Asistencias del Mes Actual</h2>
          <span className="text-sm text-gray-600">
            {new Date(anioActual, mesActual - 1).toLocaleString('es', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Clase</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.slice(0, 20).map((asistencia) => (
                <tr key={asistencia.id} className="border-t">
                  <td className="px-4 py-3">{new Date(asistencia.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{asistencia.estudiante_nombre}</td>
                  <td className="px-4 py-3">{asistencia.clase_nombre}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      asistencia.presente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {asistencia.presente ? 'Presente' : 'Ausente'}
                    </span>
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
            <h2 className="text-2xl font-bold text-primary mb-4">Registrar Asistencia</h2>
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
                <label className="label">Fecha *</label>
                <input type="date" className="input-field" required
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox"
                    checked={formData.presente}
                    onChange={(e) => setFormData({...formData, presente: e.target.checked})} />
                  <span>Presente</span>
                </label>
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

export default Asistencias;
