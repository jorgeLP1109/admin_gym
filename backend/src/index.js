import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import estudiantesRoutes from './routes/estudiantes.js';
import profesoresRoutes from './routes/profesores.js';
import clasesRoutes from './routes/clases.js';
import inscripcionesRoutes from './routes/inscripciones.js';
import pagosRoutes from './routes/pagos.js';
import contabilidadRoutes from './routes/contabilidad.js';
import asistenciasRoutes from './routes/asistencias.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/contabilidad', contabilidadRoutes);
app.use('/api/asistencias', asistenciasRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'LEVEL UP S&A CENTER API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
