# **Guía de Integración — SGV Frontend**

## Propósito

Esta guía describe el flujo completo para integrar nuevas funcionalidades en el frontend bajo la arquitectura modular por capas, asegurando mantenibilidad y escalabilidad del proyecto.

---

## Arquitectura Multicapas

```
UI (React Components)
      ↓
Pages (Páginas principales)
      ↓
Modules (Agrupación por dominio)
      ↓
Services (Lógica de negocio frontend)
      ↓
API (axios + endpoints)
      ↓
Backend (DRF)
```

---

## Flujo de Trabajo para Crear un Nuevo Módulo

Ejemplo: **Gestión de Mascotas**

### 1. Crear rama feature

```bash
git checkout develop
git checkout -b feature/mascotas
```

### 2. Crear estructura del módulo

```
src/modules/mascotas/
├── components/
├── pages/
├── services/
└── hooks/
```

### 3. Crear servicio

`services/MascotasService.js`

```js
import api from "../../api/axiosInstance";

export const MascotasService = {
  listar() {
    return api.get("/mascotas/");
  },
  crear(data) {
    return api.post("/mascotas/", data);
  },
};
```

### 4. Crear páginas UI

`pages/ListaMascotas.jsx`
`pages/CrearMascota.jsx`

### 5. Conectar rutas

`router/index.jsx`

```jsx
<Route path="/mascotas" element={<ListaMascotas />} />
```

### 6. Commit y push

```bash
git add .
git commit -m "feat(mascotas): módulo de gestión de mascotas"
git push origin feature/mascotas
```

### 7. Crear Pull Request → hacia develop

---

## Estilos y Componentes Reutilizables

Crear componentes UI en:

```
src/components/
```

Ejemplo:

`Button.jsx`, `Card.jsx`, `Modal.jsx`

---

## Integración con Autenticación (JWT)

Todos los servicios deben incluir el token:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Manejo de errores global

Crear un interceptor:

```
src/api/interceptors/errorInterceptor.js
```

---

## Conexión con Backend

Asegurar CORS en backend:

```
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---
