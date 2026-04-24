# **Sistema de Gestión Veterinaria — Frontend (React + Vite)**

## Descripción del Proyecto

El **SGV Frontend** es la interfaz web del *Sistema de Gestión Veterinaria*, diseñada para proporcionar una experiencia moderna, intuitiva y optimizada para los distintos roles del sistema (Administrador, Recepcionista, Veterinario y Cliente).

Está desarrollado con **React + Vite**, bajo una arquitectura **multicapas y modular**, alineada a buenas prácticas de ingeniería, escalabilidad y separación de responsabilidades.

Este frontend consume las APIs del backend en Django REST Framework y ofrece una experiencia UI/UX dinámica, segura y basada en componentes reutilizables.

---

## Objetivos del Frontend

* Brindar una interfaz clara y profesional para gestionar usuarios, mascotas, citas, inventario, historias clínicas y facturas.
* Consumir los endpoints del backend mediante servicios desacoplados.
* Garantizar usabilidad, accesibilidad, modularidad y mantenibilidad.
* Implementar un diseño multicapas:

```
UI → Componentes → Servicios → API → Backend
```

---

## Tecnologías y Herramientas

| Categoría        | Herramienta / Librería             |
| ---------------- | ---------------------------------- |
| Framework UI     | React + Vite                       |
| Lenguaje         | TypeScript (opcional)              |
| State Management | Context API (propuesto)            |
| Estilos          | TailwindCSS (opcional)             |
| Llamadas API     | Axios                              |
| Rutas            | React Router                       |
| Versionamiento   | Git + GitHub                       |
| Arquitectura     | Multicapas & Modular               |

---

## Estructura del Proyecto (Arquitectura Multicapas)

```
src/
├── api/               # Axios instance, interceptores y endpoints
├── assets/            # Logos e imágenes
├── components/        # UI reutilizable
├── core/              # Config, constantes, guards, contextos base
├── hooks/             # Custom hooks
├── layout/            # Layouts principales
├── modules/           # Módulos del dominio (usuarios, citas, etc.)
│   ├── auth/
│   ├── usuarios/
│   ├── mascotas/
│   ├── citas/
│   ├── facturacion/
│   ├── notificaciones/
│   └── inventario/
├── pages/             # Páginas principales
├── router/            # Sistema de rutas
├── services/          # Lógica del frontend (AuthService, UserService)
└── styles/            # Estilos globales
```

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/isairey/SisVet-FrontEnd.git
cd SisVet-FrontEnd
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env`:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

**Nunca subir el archivo `.env`.**

### 4. Ejecutar servidor de desarrollo

```bash
npm run dev
```

---

## Scripts disponibles

| Script            | Descripción                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Ejecuta el servidor de desarrollo |
| `npm run build`   | Genera la build de producción     |
| `npm run preview` | Previsualiza la build             |

---

## Comunicación con el Backend

Todo el manejo de API se realiza desde:

```
src/api/
```

Con un `axiosInstance` configurado con interceptores para:

* Token JWT (Authorization)
* Manejo centralizado de errores
* Refresh automático (opcional)

---

## Estrategia de Ramas (Branching Strategy)

| Rama         | Descripción                           |
| ------------ | ------------------------------------- |
| **main**     | Versión estable lista para despliegue |
| **develop**  | Código en integración continua        |
| **feature/** | Desarrollo por módulo                 |
| **hotfix/**  | Correcciones rápidas                  |

Ejemplo:

```bash
git checkout develop
git checkout -b feature/citas
# Realizar cambios...
git commit -m "feat(citas): vista para agendar citas"
git push origin feature/citas
```

---

## Testing (Próximamente)

En futuras iteraciones se incluirá:

* Jest
* React Testing Library

---

## Estado Actual del Frontend

| Elemento                 | Estado |
| ------------------------ | ------ |
| Vite + React configurado | ✅      |
| Estructura multicapas    | ✅      |
| Config API Axios         | ⏳      |
| Módulos del dominio      | ⏳      |
| Auth + JWT               | ⏳      |
| Integración UI/UX        | 🔄     |
| Testing                  | 🔄     |

---

© 2026 — Sistema de Gestión Veterinaria (SGV)
Frontend desarrollado con React + Vite
Arquitectura limpia, modular y escalable.

---
