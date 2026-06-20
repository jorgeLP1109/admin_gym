# PROMPT DE CONTEXTO — Integración admin_gym con Ecosistema Level Up

## Objetivo
Integrar el programa de administración local (`admin_gym`) con el ecosistema de Level Up que ya está en producción, sin modificar el backend de Level Up.

---

## Arquitectura Actual

### Ecosistema Level Up (NO TOCAR)
- **Backend:** Node.js/Express + MongoDB (Render: `https://api.levelupsportctg.com/api`)
- **Panel Admin Web:** React (Vercel: `https://admin.levelupsportctg.com`)
- **App Móvil:** Flutter (Android/iOS)
- **App Conductores:** Flutter

### Programa Administrativo Local (MODIFICAR ESTE)
- **Ubicación:** `D:\proyectos\admin_gym`
- **GitHub:** `https://github.com/jorgeLP1109/admin_gym.git`
- **Backend:** Node.js/Express + PostgreSQL (Supabase)
- **Frontend:** React + Vite + Tailwind
- **DB URL:** `postgresql://postgres.dpacecgixaxpspurqbmg:b37c66c67e*@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`

---

## Lo que se necesita hacer (SOLO en admin_gym)

### 1. Actualizar modelo de Clases
El modelo actual de clases en `admin_gym` tiene una estructura básica. Debe actualizarse para coincidir con Level Up:

**Modelo Level Up (MongoDB - referencia):**
```javascript
{
  nombre: String,
  profesor: String,
  diasPorSemana: Number (1, 2, 3),
  horarios: [{ dia: 'lunes'|'martes'|etc, horaInicio: '16:00', horaFin: '17:30' }],
  precio: Number,
  inscritos: [{ user: ObjectId, fechaInscripcion: Date, fechaVencimiento: Date }],
  activa: Boolean
}
```

**Modelo actual admin_gym (PostgreSQL):**
La tabla `clases` ya tiene: `nombre`, `descripcion`, `profesor_id`, `precio`, `frecuencia_semanal`, `capacidad_maxima`, `horarios` (JSON), `activo`

**Acción:** Asegurar que los horarios se manejen con el mismo formato (día + horaInicio + horaFin) y que las inscripciones tengan fechaVencimiento individual por clase.

### 2. Sincronizar Historial de Pagos desde Level Up
Las transacciones de Wompi se registran en el backend de Level Up (MongoDB). Este programa debe poder leerlas.

**Endpoint disponible (Level Up - solo lectura):**
```
GET https://api.levelupsportctg.com/api/wompi/transacciones
Headers: Authorization: Bearer <admin_token>
```

**Respuesta:**
```json
[{
  "_id": "...",
  "alumno": { "nombre": "Jorge Pacheco", "email": "sofitech@me.com" },
  "referencia": "LVL2026-1781640486854-d48c043e",
  "monto": 40000,
  "items": [{ "tipo": "clase", "idRef": "...", "nombre": "Trampolín", "precio": 40000, "cantidad": 1 }],
  "conceptos": "1x Trampolín",
  "fecha": "2026-06-16T20:08:06.855Z",
  "estado": "APPROVED"
}]
```

**Acción:** Crear una sección en admin_gym que consuma este endpoint y muestre los pagos realizados desde la app. Puede ser polling periódico o un botón "Sincronizar".

### 3. Registrar Pagos Manuales (Efectivo) y Enviar Solvencia al Backend de Level Up
Cuando alguien paga en efectivo o por transferencia directa, el admin debe poder:
1. Registrar el pago localmente en PostgreSQL
2. Enviar la actualización de solvencia al backend de Level Up

**Endpoints de Level Up para escribir (requiere token admin):**
```
# Inscribir usuario en clase (también renueva si ya está inscrito)
POST https://api.levelupsportctg.com/api/classes/:classId/enroll
Headers: Authorization: Bearer <admin_token>
Body: { "userId": "mongoId_del_usuario" }

# Actualizar usuario (fechaVencimiento, estadoPlan)
PUT https://api.levelupsportctg.com/api/users/:userId
Headers: Authorization: Bearer <admin_token>
Body: { "fechaVencimiento": "2026-07-20T00:00:00.000Z", "estadoPlan": "ACTIVO" }
```

**Credenciales admin para Level Up:**
- Email: `admin@level.com`
- Password: `admin123`
- Login: `POST https://api.levelupsportctg.com/api/auth/login`

**Acción:** Agregar un botón "Registrar Pago Manual" que:
1. Guarda el pago en PostgreSQL local
2. Llama al backend de Level Up para hacer `enroll` en la clase (renueva 30 días)
3. Muestra confirmación

### 4. Obtener Lista de Usuarios de Level Up
Para poder seleccionar a qué alumno registrarle el pago manual:

```
GET https://api.levelupsportctg.com/api/users?role=client
Headers: Authorization: Bearer <admin_token>
```

Y las clases disponibles:
```
GET https://api.levelupsportctg.com/api/classes
Headers: Authorization: Bearer <admin_token>
```

---

## Estructura actual de admin_gym

```
admin_gym/
├── backend/
│   ├── src/
│   │   ├── config/database.js          → Pool PostgreSQL (Supabase)
│   │   ├── controllers/
│   │   │   ├── clasesController.js     → CRUD clases
│   │   │   ├── pagosController.js      → Pagos locales
│   │   │   ├── inscripcionesController.js → Inscripciones
│   │   │   ├── estudiantesController.js
│   │   │   ├── profesoresController.js
│   │   │   ├── contabilidadController.js
│   │   │   └── asistenciasController.js
│   │   ├── middleware/auth.js
│   │   ├── routes/                     → Todas las rutas
│   │   └── index.js                    → Entry point Express
│   ├── .env                            → DATABASE_URL + JWT_SECRET
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                            → VITE_API_URL
│   └── package.json
```

---

## Tablas PostgreSQL existentes (Supabase)

### clases
- id, nombre, descripcion, profesor_id, precio, frecuencia_semanal, capacidad_maxima, horarios (JSONB), activo, created_at, updated_at

### inscripciones
- id, estudiante_id, clase_id, modalidad_pago, dia_pago, dia_pago_secundario, activo, fecha_inscripcion

### pagos
- id, inscripcion_id, monto, fecha_pago, fecha_vencimiento, metodo_pago, referencia, notas

### estudiantes
- id, nombre, apellido, telefono, email, activo

### profesores
- id, nombre, apellido, especialidad, telefono

### transacciones_contables
- id, tipo, categoria, concepto, monto, fecha, metodo_pago, referencia, pago_id

---

## Reglas importantes

1. **NO MODIFICAR** el backend de Level Up (`D:\proyectos\level2026`)
2. **NO MODIFICAR** la app Flutter (`D:\proyectos\Level_app`)
3. **NO MODIFICAR** el panel admin (`D:\proyectos\panel_admin_level2026`)
4. **SOLO MODIFICAR** `D:\proyectos\admin_gym`
5. El sistema admin_gym debe LEER del backend Level Up y ESCRIBIR a él mediante sus APIs públicas
6. Los pagos manuales deben sincronizar solvencia con Level Up via API

---

## Modelo de cobro Level Up (mensualidad por clase)

- Cada clase tiene su propia fecha de vencimiento POR ALUMNO
- Al pagar (Wompi o manual), se renueva 30 días desde la fecha de pago
- Si la clase vence, el alumno ve banner "clase vencida" en la app
- El enroll renueva automáticamente si el alumno ya está inscrito
- Precios están en COP (pesos colombianos)

---

## Resumen de acciones a implementar

1. ✅ Actualizar tabla/vista de clases con horarios (día + hora inicio + hora fin)
2. ✅ Crear sección "Pagos desde App" que sincronice transacciones de Level Up
3. ✅ Crear botón "Pago Manual" que registre en PostgreSQL Y envíe enroll a Level Up
4. ✅ Mostrar estado de solvencia de cada alumno consultando Level Up
5. ✅ No romper funcionalidades existentes del admin_gym
