# 🚀 Guía de Instalación y Despliegue - LEVEL UP S&A CENTER

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta en Supabase (gratuita)
- Git instalado

## 🔧 Instalación Local

### 1. Instalar Dependencias

```bash
# Desde la raíz del proyecto
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configurar Base de Datos (Supabase)

1. Crear cuenta en https://supabase.com
2. Crear nuevo proyecto
3. En SQL Editor, ejecutar el archivo `backend/src/config/schema.sql`
4. Copiar la Connection String de Settings > Database

### 3. Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=tu_connection_string_de_supabase
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=7d
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Ejecutar en Desarrollo

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Backend en http://localhost:5000
- Frontend en http://localhost:3000

## 🌐 Despliegue en Producción (GRATIS)

### Backend - Railway.app

1. Crear cuenta en https://railway.app
2. New Project > Deploy from GitHub
3. Seleccionar carpeta `backend`
4. Agregar variables de entorno:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Deploy automático

### Frontend - Vercel

1. Crear cuenta en https://vercel.com
2. Import Project desde GitHub
3. Root Directory: `frontend`
4. Framework Preset: Vite
5. Agregar variable de entorno:
   - `VITE_API_URL=https://tu-backend.railway.app/api`
6. Deploy

### Base de Datos - Supabase (Ya configurada)

Ya está en la nube, solo usar la connection string.

## 👤 Usuario por Defecto

```
Email: admin@levelup.com
Password: admin123
```

**IMPORTANTE**: Cambiar la contraseña después del primer login.

## 📱 Acceso desde Cualquier Dispositivo

Una vez desplegado:
- Acceder desde cualquier navegador
- Funciona en móviles, tablets y computadoras
- URL única: `https://tu-proyecto.vercel.app`

## 🎨 Paleta de Colores del Brand

- Azul Principal: `#2B4C9F`
- Dorado: `#D4AF37`
- Fondo: `#F9FAFB`

## 📞 Soporte

Para dudas o problemas, revisar la documentación en el README.md
