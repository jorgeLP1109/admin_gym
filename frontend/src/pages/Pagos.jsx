import { useState, useEffect } from 'react';
import { pagosAPI, estudiantesAPI, clasesAPI, inscripcionesAPI } from '../services/api';
import { Plus, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [solventes, setSolventes] = useState([]);
  const [morosos, setMorosos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [clases, setClases] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [selectedClase, setSelectedClase] = useState('');
  const [formData, setFormData] = useState({
    inscripcion_id: '',
    estudiante_id: '',
    clase_id: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    metodo_pago: 'efectivo',
    modalidad: 'mensual',
    referencia: '',
    notas: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEstudiante && selectedClase) {
      loadInscripcion();
    }
  }, [selectedEstudiante, selectedClase]);

  useEffect(() => {
    if (selectedClase && formData.modalidad) {
      const clase = clases.find(c => c.id == selectedClase);
      if (clase) {
        const monto = formData.modalidad === 'mensual' ? clase.precio_mensual : 
                      formData.modalidad === 'quincenal' ? clase.precio_quincenal : 
                      clase.precio_diario || 0;
        setFormData(prev => ({...prev, monto}));
      }
    }
  }, [selectedClase, formData.modalidad, clases]);

  const loadData = async () => {
    try {
      const [pagosRes, solventesRes, morososRes, estudRes, clasesRes, inscripRes] = await Promise.all([
        pagosAPI.getAll(),
        pagosAPI.getSolventes(),
        pagosAPI.getMorosos(),
        estudiantesAPI.getAll(),
        clasesAPI.getAll(),
        inscripcionesAPI.getAll()
      ]);
      setPagos(pagosRes.data);
      setSolventes(solventesRes.data);
      setMorosos(morososRes.data);
      setEstudiantes(estudRes.data);
      setClases(clasesRes.data);
      setInscripciones(inscripRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadInscripcion = async () => {
    const inscripcion = inscripciones.find(
      i => i.estudiante_id == selectedEstudiante && i.clase_id == selectedClase
    );
    
    if (inscripcion) {
      setFormData(prev => ({
        ...prev,
        inscripcion_id: inscripcion.id
      }));
    }
  };

  const handleEstudianteChange = (e) => {
    setSelectedEstudiante(e.target.value);
    setFormData({...formData, estudiante_id: e.target.value, inscripcion_id: '', monto: ''});
  };

  const handleClaseChange = (e) => {
    setSelectedClase(e.target.value);
    setFormData({...formData, clase_id: e.target.value, inscripcion_id: '', monto: ''});
  };

  const handleModalidadChange = (e) => {
    const modalidad = e.target.value;
    setFormData({...formData, modalidad});
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pagosAPI.create(formData);
      setShowModal(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      inscripcion_id: '',
      estudiante_id: '',
      clase_id: '',
      monto: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      fecha_vencimiento: '',
      metodo_pago: 'efectivo',
      modalidad: 'mensual',
      referencia: '',
      notas: ''
    });
    setSelectedEstudiante('');
    setSelectedClase('');
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
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="text-green-500" size={32} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Estudiantes Solventes</h2>
              <p className="text-3xl font-bold text-green-600">{solventes.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <XCircle className="text-red-500" size={32} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Estudiantes Morosos</h2>
              <p className="text-3xl font-bold text-red-600">{morosos.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Últimos Pagos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Clase</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha Pago</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Método</th>
              </tr>
            </thead>
            <tbody>
              {pagos.slice(0, 10).map((pago) => (
                <tr key={pago.id} className="border-t">
                  <td className="px-4 py-3">{pago.estudiante_nombre}</td>
                  <td className="px-4 py-3">{pago.clase_nombre}</td>
                  <td className="px-4 py-3 font-bold text-gold">${pago.monto}</td>
                  <td className="px-4 py-3">{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize">{pago.metodo_pago}</td>
                </tr>
              ))}
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
                <label className="label">Estudiante *</label>
                <select className="input-field" required value={selectedEstudiante} onChange={handleEstudianteChange}>
                  <option value="">Seleccionar...</option>
                  {estudiantes.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">Clase *</label>
                <select className="input-field" required value={selectedClase} onChange={handleClaseChange}>
                  <option value="">Seleccionar...</option>
                  {clases.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Modalidad de Pago *</label>
                <select className="input-field" required value={formData.modalidad} onChange={handleModalidadChange}>
                  <option value="mensual">Mensual</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="diario">Diario</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Monto</label>
                  <input type="text" className="input-field bg-gray-100" readOnly
                    value={formData.monto ? `$${parseFloat(formData.monto).toFixed(2)}` : ''} />
                </div>
                <div>
                  <label className="label">Método de Pago *</label>
                  <select className="input-field" required
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="nequi">Nequi</option>
                  </select>
                </div>
                {(formData.metodo_pago === 'transferencia' || formData.metodo_pago === 'nequi') && (
                  <div className="col-span-2">
                    <label className="label">
                      {formData.metodo_pago === 'nequi' ? 'Código de Transacción Nequi *' : 'Referencia'}
                    </label>
                    <input type="text" className="input-field" 
                      required={formData.metodo_pago === 'nequi'}
                      placeholder={formData.metodo_pago === 'nequi' ? 'Ej: NEQ123456789' : 'Número de referencia'}
                      value={formData.referencia}
                      onChange={(e) => setFormData({...formData, referencia: e.target.value})} />
                  </div>
                )}
                <div>
                  <label className="label">Fecha de Pago *</label>
                  <input type="date" className="input-field" required
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})} />
                </div>
                <div>
                  <label className="label">Fecha Vencimiento *</label>
                  <input type="date" className="input-field" required
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})} />
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

export default Pagos;
