import { useState, useEffect } from 'react';
import { pagosAPI, contabilidadAPI, asistenciasAPI } from '../services/api';
import { FileText, DollarSign, Users, Calendar, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const Reportes = () => {
  const [activeTab, setActiveTab] = useState('solvencia');
  const [solventes, setSolventes] = useState([]);
  const [morosos, setMorosos] = useState([]);
  const [resumenContable, setResumenContable] = useState({ total_ingresos: 0, total_gastos: 0, balance: 0 });
  const [transacciones, setTransacciones] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      const [solventesRes, morososRes, contableRes, transaccionesRes] = await Promise.all([
        pagosAPI.getSolventes(),
        pagosAPI.getMorosos(),
        contabilidadAPI.getResumen({}),
        contabilidadAPI.getTransacciones({})
      ]);
      setSolventes(solventesRes.data || []);
      setMorosos(morososRes.data || []);
      setResumenContable({
        total_ingresos: contableRes.data?.total_ingresos || 0,
        total_gastos: contableRes.data?.total_gastos || 0,
        balance: contableRes.data?.balance || 0
      });
      setTransacciones(transaccionesRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      setSolventes([]);
      setMorosos([]);
      setResumenContable({ total_ingresos: 0, total_gastos: 0, balance: 0 });
      setTransacciones([]);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('LEVEL UP S&A CENTER', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Reporte de Contabilidad', 105, 22, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
    
    // Resumen Financiero en una línea
    doc.setFontSize(10);
    doc.text('RESUMEN:', 14, 38);
    doc.text(`Ingresos: $${Number(resumenContable.total_ingresos || 0).toFixed(2)}`, 40, 38);
    doc.text(`Gastos: $${Number(resumenContable.total_gastos || 0).toFixed(2)}`, 90, 38);
    doc.text(`Balance: $${Number(resumenContable.balance || 0).toFixed(2)}`, 135, 38);
    
    // Línea separadora
    doc.line(14, 42, 196, 42);
    
    // Encabezados de tabla
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('Fecha', 14, 48);
    doc.text('Tipo', 35, 48);
    doc.text('Categoría', 52, 48);
    doc.text('Concepto', 80, 48);
    doc.text('Monto', 130, 48);
    doc.text('Estudiante/ID', 150, 48);
    doc.line(14, 50, 196, 50);
    
    // Transacciones
    let y = 55;
    doc.setFont(undefined, 'normal');
    
    transacciones.forEach((t, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        // Repetir encabezados
        doc.setFont(undefined, 'bold');
        doc.text('Fecha', 14, y);
        doc.text('Tipo', 35, y);
        doc.text('Categoría', 52, y);
        doc.text('Concepto', 80, y);
        doc.text('Monto', 130, y);
        doc.text('Estudiante/ID', 150, y);
        doc.line(14, y + 2, 196, y + 2);
        y += 7;
        doc.setFont(undefined, 'normal');
      }
      
      // Datos en una línea
      doc.text(new Date(t.fecha).toLocaleDateString('es', {day:'2-digit', month:'2-digit'}), 14, y);
      doc.text(t.tipo === 'ingreso' ? 'ING' : 'GAS', 35, y);
      doc.text(t.categoria.substring(0, 12), 52, y);
      doc.text(t.concepto.substring(0, 25), 80, y);
      doc.text(`$${Number(t.monto).toFixed(2)}`, 130, y);
      
      if (t.estudiante_nombre) {
        doc.text(t.estudiante_nombre.substring(0, 20), 150, y);
        y += 4;
        doc.setFontSize(7);
        doc.text(`ID: ${t.estudiante_identificacion} Tel: ${t.estudiante_telefono}`, 150, y);
        y += 3;
        doc.text(`Dir: ${(t.estudiante_direccion || 'N/A').substring(0, 35)}`, 150, y);
        doc.setFontSize(8);
        y += 3;
      } else if (t.tercero_nombre) {
        doc.text(t.tercero_nombre.substring(0, 20), 150, y);
        y += 4;
        doc.setFontSize(7);
        doc.text(`ID: ${t.tercero_identificacion || 'N/A'} Tel: ${t.tercero_telefono || 'N/A'}`, 150, y);
        y += 3;
        doc.text(`Dir: ${(t.tercero_direccion || 'N/A').substring(0, 35)}`, 150, y);
        doc.setFontSize(8);
        y += 3;
      }
      
      y += 6;
    });
    
    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`reporte-contabilidad-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const loadAsistencias = async () => {
    try {
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      
      const response = await asistenciasAPI.getAll(params);
      setAsistencias(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">Reportes</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('solvencia')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'solvencia' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
          Solvencia
        </button>
        <button
          onClick={() => setActiveTab('contabilidad')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'contabilidad' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
          Contabilidad
        </button>
        <button
          onClick={() => { setActiveTab('asistencias'); loadAsistencias(); }}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === 'asistencias' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
          Asistencias
        </button>
      </div>

      {activeTab === 'solvencia' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-green-50">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="text-green-600" size={32} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Estudiantes Solventes</h2>
                  <p className="text-3xl font-bold text-green-600">{solventes.length}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {solventes.map((est) => (
                  <div key={est.id} className="bg-white p-3 rounded-lg">
                    <p className="font-semibold">{est.nombre} {est.apellido}</p>
                    <p className="text-sm text-gray-600">{est.telefono}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-red-50">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="text-red-600" size={32} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Estudiantes Morosos</h2>
                  <p className="text-3xl font-bold text-red-600">{morosos.length}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {morosos.map((est) => (
                  <div key={est.id} className="bg-white p-3 rounded-lg">
                    <p className="font-semibold">{est.nombre} {est.apellido}</p>
                    <p className="text-sm text-gray-600">{est.telefono}</p>
                    {est.dias_mora && (
                      <p className="text-xs text-red-600">Mora: {est.dias_mora} días</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contabilidad' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Reporte Contable</h2>
            <button onClick={exportarPDF} className="btn-primary flex items-center space-x-2">
              <Download size={20} />
              <span>Exportar Reporte</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-green-50">
              <div className="flex items-center space-x-3">
                <DollarSign className="text-green-600" size={32} />
                <div>
                  <p className="text-sm text-gray-600">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">${Number(resumenContable.total_ingresos || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card bg-red-50">
              <div className="flex items-center space-x-3">
                <DollarSign className="text-red-600" size={32} />
                <div>
                  <p className="text-sm text-gray-600">Total Gastos</p>
                  <p className="text-2xl font-bold text-red-600">${Number(resumenContable.total_gastos || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card bg-blue-50">
              <div className="flex items-center space-x-3">
                <DollarSign className="text-primary" size={32} />
                <div>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="text-2xl font-bold text-primary">${Number(resumenContable.balance || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'asistencias' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Filtrar Asistencias por Fecha</h2>
            <div className="flex space-x-4 mb-4">
              <div>
                <label className="label">Fecha Inicio</label>
                <input type="date" className="input-field"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)} />
              </div>
              <div>
                <label className="label">Fecha Fin</label>
                <input type="date" className="input-field"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)} />
              </div>
              <div className="flex items-end">
                <button onClick={loadAsistencias} className="btn-primary">
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Asistencias</h2>
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
                  {asistencias.map((asistencia) => (
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
              {asistencias.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay asistencias en el rango seleccionado</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
