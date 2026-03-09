import { useState, useEffect } from 'react';
import { contabilidadAPI } from '../services/api';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';

const Contabilidad = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [resumen, setResumen] = useState({ total_ingresos: 0, total_gastos: 0, balance: 0 });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'ingreso', categoria: '', concepto: '', monto: '',
    fecha: new Date().toISOString().split('T')[0], metodo_pago: '', referencia: '', notas: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transRes, resumenRes] = await Promise.all([
        contabilidadAPI.getTransacciones({}),
        contabilidadAPI.getResumen({})
      ]);
      setTransacciones(transRes.data || []);
      setResumen({
        total_ingresos: resumenRes.data?.total_ingresos || 0,
        total_gastos: resumenRes.data?.total_gastos || 0,
        balance: resumenRes.data?.balance || 0
      });
    } catch (error) {
      console.error('Error:', error);
      setTransacciones([]);
      setResumen({ total_ingresos: 0, total_gastos: 0, balance: 0 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contabilidadAPI.createTransaccion(formData);
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Contabilidad</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Nueva Transacción</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-green-50">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-green-600" size={32} />
            <div>
              <p className="text-sm text-gray-600">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">${Number(resumen.total_ingresos || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50">
          <div className="flex items-center space-x-3">
            <TrendingDown className="text-red-600" size={32} />
            <div>
              <p className="text-sm text-gray-600">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">${Number(resumen.total_gastos || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-full">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-2xl font-bold text-primary">${Number(resumen.balance || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transacciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Concepto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">{new Date(t.fecha).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.categoria}</td>
                  <td className="px-4 py-3">{t.concepto}</td>
                  <td className={`px-4 py-3 font-bold ${t.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                    ${t.monto}
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
            <h2 className="text-2xl font-bold text-primary mb-4">Nueva Transacción</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Tipo *</label>
                <select className="input-field" required
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}>
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoría *</label>
                  <input type="text" className="input-field" required
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})} />
                </div>
                <div>
                  <label className="label">Monto *</label>
                  <input type="number" step="0.01" className="input-field" required
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Concepto *</label>
                <textarea className="input-field" rows="2" required
                  value={formData.concepto}
                  onChange={(e) => setFormData({...formData, concepto: e.target.value})} />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-900 mb-3">Información del Tercero</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Nombre o Negocio</label>
                    <input type="text" className="input-field" placeholder="Nombre de la persona o empresa"
                      value={formData.tercero_nombre}
                      onChange={(e) => setFormData({...formData, tercero_nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Cédula o NIT</label>
                    <input type="text" className="input-field"
                      value={formData.tercero_identificacion}
                      onChange={(e) => setFormData({...formData, tercero_identificacion: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Teléfono</label>
                    <input type="tel" className="input-field"
                      value={formData.tercero_telefono}
                      onChange={(e) => setFormData({...formData, tercero_telefono: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Dirección</label>
                    <input type="text" className="input-field"
                      value={formData.tercero_direccion}
                      onChange={(e) => setFormData({...formData, tercero_direccion: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="label">Fecha *</label>
                <input type="date" className="input-field" required
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
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

export default Contabilidad;
