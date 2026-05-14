# CompliSec

> Plataforma SaaS de gestión de seguridad de la información para Pymes, basada en la norma **ISO/IEC 27001:2022**.

CompliSec permite a pequeñas y medianas empresas implementar un Sistema de Gestión de Seguridad de la Información (SGSI) de forma guiada, sin necesidad de conocimientos avanzados en la norma. Cubre desde el inventario de activos hasta la declaración de aplicabilidad y la gestión de evidencias para auditorías.

---

## Tabla de contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints de la API](#endpoints-de-la-api)
- [Base de datos](#base-de-datos)
- [Tests](#tests)
- [Equipo](#equipo)

---

## Características

- **Onboarding guiado** — registro de la organización con diagnóstico inicial de cumplimiento
- **Inventario de activos** — clasificación con valoración C-I-A (Confidencialidad, Integridad, Disponibilidad)
- **Evaluación de riesgos** — cálculo automático del nivel de riesgo como `Probabilidad × Impacto` según ISO 27005
- **Declaración de Aplicabilidad (SoA)** — gestión de los 93 controles del Anexo A con estado de implementación
- **Gestión de evidencias** — carga y vinculación de documentos a cada control
- **Dashboard de cumplimiento** — métricas en tiempo real del estado del SGSI
- **Control de acceso RBAC** — roles `ADMIN`, `CISO` y `AUDITOR`
- **Multi-tenant** — soporte para múltiples organizaciones aisladas

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Cliente (Browser)                 │
│                  React 18 + Vite                     │
│                  localhost:3000                      │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (proxy Vite → /api)
┌──────────────────────▼──────────────────────────────┐
│              BFF — Backend for Frontend              │
│              Node.js + Express                       │
│              localhost:4000                          │
│                                                      │
│  Auth · Onboarding · Assets · Risks · SoA · Evidence│
└──────────────────────┬──────────────────────────────┘
                       │ pg (node-postgres)
┌──────────────────────▼──────────────────────────────┐
│               PostgreSQL 15                          │
│               localhost:5432                         │
│               DB: complisec                          │
└─────────────────────────────────────────────────────┘
```

Los tres servicios se orquestan con **Docker Compose** y se comunican en una red interna (`complisec_network`).

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite 5, Axios, jwt-decode |
| BFF | Node.js 18, Express 4, Zod, Multer, jsonwebtoken, bcrypt |
| Base de datos | PostgreSQL 15, extensión `uuid-ossp` |
| Infraestructura | Docker, Docker Compose |
| Testing | Karma, Jasmine, Testing Library |

---

## Estructura del proyecto

```
CompliSec/
├── docker-compose.yml
├── database/
│   └── init.sql                   # Schema inicial + seed de controles
├── bff/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js               # Entry point Express
│       ├── config/
│       │   └── db.js              # Pool de conexión PostgreSQL
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── onboardingController.js
│       │   ├── assetController.js
│       │   ├── riskController.js
│       │   ├── soaController.js
│       │   └── evidenceController.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── onboardingService.js
│       │   ├── assetService.js
│       │   ├── riskService.js
│       │   ├── soaService.js
│       │   └── evidenceService.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── onboarding.js
│       │   ├── assets.js
│       │   ├── risks.js
│       │   ├── soa.js
│       │   └── evidences.js
│       └── middlewares/
│           ├── authMiddleware.js  # Verificación JWT
│           ├── validate.js        # Validación Zod
│           └── schemas.js         # Esquemas de validación
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js             # Proxy /api → http://bff:4000
    ├── public/
    │   └── landing_final.html     # Landing page
    └── src/
        ├── main.jsx
        ├── App.jsx                # Router principal + auth state
        ├── utils/
        │   └── axiosSetup.js      # Interceptores JWT
        ├── styles/
        │   └── index.css
        └── components/
            ├── auth/Login.jsx
            ├── onboarding/OnboardingForm.jsx
            ├── dashboard/Dashboard.jsx
            ├── assets/AssetList.jsx + AssetForm.jsx
            ├── risks/RiskAssessment.jsx + RiskForm.jsx
            ├── soa/SoAList.jsx + SoAForm.jsx + EvidencesModal.jsx
            └── layout/Layout.jsx
```

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado y en ejecución
- No se requiere Node.js ni PostgreSQL instalados localmente

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/CompliSec.git
cd CompliSec
```

### 2. Crear el archivo de variables de entorno

Crear el archivo `bff/.env`:

```env
PORT=4000
DB_HOST=database
DB_PORT=5432
DB_USER=complisec_user
DB_PASSWORD=complisec_password
DB_NAME=complisec
JWT_SECRET=cambia-esto-por-una-clave-secreta
```

### 3. Levantar los contenedores

```bash
docker-compose up --build
```

La primera ejecución descarga las imágenes base y tarda aproximadamente 2-3 minutos.

### 4. Verificar que todo funciona

```bash
# El BFF responde
curl http://localhost:4000/health

# El frontend está disponible
# Abrir en el navegador: http://localhost:3000
```

### URLs disponibles

| Servicio | URL |
|---|---|
| Aplicación web | http://localhost:3000 |
| Landing page | http://localhost:3000/landing_final.html |
| API / BFF | http://localhost:4000 |
| Base de datos | localhost:5432 |

### Detener los contenedores

```bash
docker-compose down
```

Para eliminar también los datos de la base de datos:

```bash
docker-compose down -v
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del BFF | `4000` |
| `DB_HOST` | Host de PostgreSQL | `database` (nombre del servicio Docker) |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de la BD | `complisec_user` |
| `DB_PASSWORD` | Contraseña de la BD | `complisec_password` |
| `DB_NAME` | Nombre de la BD | `complisec` |
| `JWT_SECRET` | Clave para firmar tokens JWT | — (requerido) |

---

## Endpoints de la API

Todos los endpoints (excepto auth y onboarding) requieren el header:
```
Authorization: Bearer <token>
```

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Datos del usuario autenticado |

### Onboarding

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/onboarding` | Registrar organización y usuario admin |

### Activos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/assets?organization_id=:id` | Listar activos |
| `POST` | `/api/assets` | Crear activo |

### Riesgos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/risks?organization_id=:id` | Listar perfiles de riesgo |
| `POST` | `/api/risks` | Evaluar riesgo sobre un activo |

### Declaración de Aplicabilidad (SoA)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/soa?organization_id=:id` | Listar controles con estado |
| `POST` | `/api/soa` | Vincular control a la organización |
| `PUT` | `/api/soa/:id` | Actualizar estado de un control |

### Evidencias

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/evidences?soa_id=:id` | Listar evidencias de un control |
| `POST` | `/api/evidences` | Subir evidencia (multipart/form-data) |

---

## Base de datos

El schema se inicializa automáticamente al levantar Docker con el archivo `database/init.sql`.

### Tablas principales

| Tabla | Descripción |
|---|---|
| `organizations` | Pymes registradas en la plataforma |
| `users` | Usuarios con rol por organización |
| `assets` | Inventario de activos con valoración C-I-A |
| `risk_profiles` | Evaluaciones de riesgo (P × I) |
| `annex_a_controls` | Catálogo de los 93 controles ISO 27001 |
| `soa_entries` | Declaración de Aplicabilidad por organización |
| `evidences` | Documentos vinculados a controles |

### Acceso directo a la base de datos

```bash
# Desde terminal
docker exec -it complisec_db psql -U complisec_user -d complisec

# Comandos útiles dentro de psql
\dt                          -- listar tablas
SELECT * FROM organizations; -- ver organizaciones
SELECT * FROM users;         -- ver usuarios
\q                           -- salir
```

---

## Tests

El frontend incluye tests con Karma + Jasmine + Testing Library.

```bash
# Entrar al contenedor del frontend
docker exec -it complisec_frontend sh

# Ejecutar tests
npm test
```

---

## Equipo

Desarrollado como proyecto académico de ingeniería de software.

| Integrante | Rol |
|---|---|
| Sebastian E. | Backend / Infraestructura |
| Millaray M. | Frontend / UX |

---

> **Nota:** Este proyecto es un prototipo académico. Para uso en producción se recomienda configurar HTTPS, variables de entorno seguras y un servicio de almacenamiento externo para las evidencias.
