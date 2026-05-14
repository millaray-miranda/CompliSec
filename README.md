# CompliSec

**CompliSec** es una plataforma web que ayuda a pequeñas y medianas empresas a gestionar su seguridad de la información de forma ordenada y sin complicaciones, siguiendo los lineamientos de la norma internacional **ISO/IEC 27001:2022**.

---

## ¿Qué problema resuelve?

Muchas Pymes saben que necesitan mejorar su seguridad, pero no saben por dónde empezar. La norma ISO 27001 es compleja, y las herramientas existentes son demasiado costosas o están pensadas para grandes empresas.

CompliSec simplifica ese proceso: guía a la empresa paso a paso, desde el diagnóstico inicial hasta tener todo listo para una auditoría.

---

## ¿Qué puedes hacer con CompliSec?

- **Registrar tu organización** y obtener un diagnóstico de seguridad inicial
- **Inventariar tus activos** de información (sistemas, datos, equipos) y evaluar qué tan críticos son
- **Identificar riesgos** sobre cada activo y decidir cómo tratarlos
- **Gestionar los controles** de seguridad que exige la norma y registrar su estado
- **Subir evidencias** que respalden cada control implementado
- **Visualizar el avance** de tu cumplimiento en un dashboard en tiempo real

---

## ¿Cómo se ejecuta?

Solo necesitas tener **Docker Desktop** instalado y en ejecución.

### 1. Crea el archivo de configuración

Dentro de la carpeta `bff/`, crea un archivo llamado `.env` con el siguiente contenido:

```
PORT=4000
DB_HOST=database
DB_PORT=5432
DB_USER=complisec_user
DB_PASSWORD=complisec_password
DB_NAME=complisec
JWT_SECRET=cambia-esto-por-una-clave-secreta
```

### 2. Levanta la aplicación

Abre una terminal en la carpeta raíz del proyecto y ejecuta:

```bash
docker-compose up --build
```

La primera vez tarda unos 2-3 minutos. Las siguientes veces es mucho más rápido.

### 3. Abre en el navegador

| Qué | Dónde |
|---|---|
| Aplicación | http://localhost:3000 |
| Landing page | http://localhost:3000/landing_final.html |

### 4. Para detener la aplicación

```bash
docker-compose down
```

---

## Primeros pasos dentro de la app

1. Haz clic en **"Registra tu organización"**
2. Completa el formulario de onboarding con los datos de tu empresa
3. Accede al dashboard y comienza registrando tus activos más importantes
4. A partir de ahí, el sistema te guía por los módulos en el orden correcto

---

## Equipo

Desarrollado como proyecto académico por:

- **Sebastian E.**
- **Millaray M.**

---

> Este proyecto es un prototipo académico desarrollado en Chile, basado en la norma ISO/IEC 27001:2022.
