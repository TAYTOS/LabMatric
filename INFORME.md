# Informe del Proyecto — CourseLabEnroll

**Curso:** Plataformas Emergentes
**Autor:** José Luis Cusilayme García
**Escuela Profesional de Ingeniería de Sistemas — Universidad Nacional de San Agustín de Arequipa**
**Fecha:** 20 de septiembre de 2026

## 1. Descripción del proyecto

CourseLabEnroll es una aplicación web progresiva (PWA) instalable para la matrícula de laboratorios de la Escuela Profesional de Ingeniería de Sistemas. Permite a un estudiante consultar el catálogo de cursos, revisar los grupos de laboratorio disponibles con su horario, docente, aula y vacantes, matricularse o cancelar su matrícula, y hacer seguimiento de su historial académico. Un rol de administración gestiona el catálogo de cursos y grupos. La aplicación no requiere backend ni servicios de pago: es una demostración funcional completa con persistencia local en el navegador.

Está construida con React 18, TypeScript, Vite y Tailwind CSS, y conserva la identidad visual borgoña de la institución.

## 2. Objetivos

### 2.1 Objetivo general

Desarrollar una aplicación web móvil, instalable como PWA, que resuelva el flujo completo de matrícula en laboratorios: autenticación, exploración de cursos y grupos, matrícula, cancelación y seguimiento del historial, aplicando las capacidades de las plataformas web emergentes (Service Workers, Web App Manifest, instalación nativa y funcionamiento sin conexión).

### 2.2 Objetivos específicos

- Implementar autenticación y registro de cuentas con dominio institucional `@unsa.edu.pe`, con sesión persistente en el navegador.
- Modelar cursos, grupos de laboratorio y matrículas con reglas de negocio reales: cupos, cruce de horario, duplicados y cancelación.
- Construir una interfaz responsive (375–1440 px) con navegación diferenciada para escritorio y móvil.
- Configurar la aplicación como PWA instalable: manifest, iconos, `service worker` y funcionamiento sin conexión tras la primera carga.
- Diferenciar los roles de estudiante y administración, con permisos verificados a nivel de lógica de negocio y no solo de interfaz.
- Verificar el comportamiento de la aplicación mediante pruebas automatizadas end-to-end y pruebas específicas de PWA.

## 3. Tecnologías utilizadas

| Categoría | Tecnología |
| --- | --- |
| Framework de interfaz | React 18 + TypeScript |
| Empaquetador / dev server | Vite 5 |
| Estilos | Tailwind CSS |
| Enrutamiento | React Router DOM 6 |
| PWA (manifest + service worker) | `vite-plugin-pwa` (estrategia `generateSW`, Workbox) |
| Animaciones | Framer Motion |
| Iconografía | lucide-react |
| Pruebas end-to-end | Playwright |
| Persistencia | `localStorage` del navegador (sin backend) |

## 4. Arquitectura del proyecto

La aplicación sigue una organización por responsabilidad dentro de `src/`:

- **`src/data/mockData.ts`** — catálogo inicial: cuatro cursos, ocho grupos de laboratorio, dos usuarios de demostración (estudiante y administración) y matrículas precargadas para el periodo académico `2026-B`.
- **`src/services/enrollmentService.ts`** — reglas de matrícula y cancelación: verificación de cupos, cruce de horario, matrícula duplicada, y escritura atómica de matrícula/cupo en una sola instantánea de estado (`courselab_academic_v1`).
- **`src/services/validators.ts`** — validación de la estructura de los datos recuperados de `localStorage`, para tolerar almacenamiento corrupto o incompleto.
- **`src/utils/storage.ts`** — acceso a `localStorage` tolerante a fallos (modo en memoria si el navegador bloquea el almacenamiento).
- **`src/contexts/`** — `AuthContext` (sesión y roles), `EnrollmentContext` (cursos, grupos, matrículas y permisos por rol) y `ToastContext` (notificaciones).
- **`src/components/`** — componentes reutilizables: tarjetas, formularios, diálogos accesibles (`BottomSheet`), navegación inferior móvil y barra lateral de escritorio.
- **`src/components/PwaProvider.tsx`** e **`InstallApp.tsx`** — instalación, detección de PWA instalada, actualizaciones del `service worker` y estado de conexión.
- **`src/pages/`** — pantallas de la aplicación: incorporación, bienvenida, autenticación, catálogo de cursos, detalle de grupo, matrículas, perfil, notificaciones y panel de administración.
- **`vite.config.ts`** — configuración del manifest de la PWA y generación del `service worker`.

## 5. Roles y control de acceso

La aplicación define dos roles con permisos verificados en la capa de lógica de negocio (`EnrollmentContext`), no solo ocultos en la interfaz:

| Acción | Estudiante | Administración |
| --- | :---: | :---: |
| Consultar catálogo de cursos y grupos | Sí | Sí (panel propio) |
| Matricularse en un grupo | Sí | No |
| Cancelar su propia matrícula | Sí | — |
| Cancelar la matrícula de cualquier estudiante | No | Sí |
| Crear, editar o eliminar cursos y grupos | No | Sí |

Solo el estudiante puede matricularse (`EnrollmentContext.tsx`, función `enroll`); un intento de matrícula con un usuario administrador es rechazado por la lógica de negocio, independientemente de la interfaz.

## 6. Progressive Web App

- **Manifest**: nombre, iconos de 192 y 512 px, icono *maskable*, color institucional borgoña (`#7A1F2B`) y modo `standalone`.
- **Service worker**: generado con Workbox mediante `vite-plugin-pwa`, habilitado también en desarrollo para probar registro e instalación en `localhost`.
- **Instalación**: botón "Instalar aplicación" disponible en Bienvenida, Login y Perfil, que invoca el diálogo nativo del navegador cuando está disponible o muestra instrucciones para Android, iOS y computadora en caso contrario.
- **Funcionamiento sin conexión**: tras la primera visita y compilación (`npm run build` + `npm run preview`), la aplicación puede recargarse sin conexión a internet; páginas, estilos, iconos y fuentes quedan cacheados, y la sesión/matrículas siguen disponibles vía `localStorage`.
- **Actualizaciones**: cuando hay una nueva versión, se muestra un aviso con las opciones **Actualizar** / **Más tarde**, evitando recargar un formulario en uso.
- **Publicación**: la PWA está configurada para servirse en la raíz `/` de su dominio; el alojamiento debe redirigir las rutas de la aplicación a `index.html`, y la instalación requiere HTTPS (con la excepción de `localhost`).

## 7. Verificación de requisitos

| Área | Evidencia |
| --- | --- |
| Autenticación | Login y registro con validación de campos, dominio institucional, contraseña visible/oculta, sesión persistente tras recarga y cierre de sesión probados en navegador. |
| Cursos | Cuatro cursos iniciales con dos grupos cada uno; búsqueda por código y nombre, filtros combinados por día/disponibilidad y estado vacío verificados por interacción. |
| Grupos | Docente, horario, aula, capacidad, matriculados y vacantes visibles con estado textual además de color; grupos llenos deshabilitan la matrícula. |
| Matrícula | Confirmación, éxito, aparición inmediata en "Mis matrículas", decremento de una vacante y persistencia tras recarga probados. Cruce de horario y matrícula duplicada rechazados por el servicio. |
| Cancelación | Confirmación con opción de conservar la matrícula, cambio a estado cancelado, restitución exacta de la vacante y bloqueo de una segunda cancelación sobre el mismo registro. |
| Persistencia | Estado académico centralizado en una sola instantánea de `localStorage`; probado ante JSON corrupto, `null`, estructuras inválidas y almacenamiento bloqueado, con recuperación a un estado coherente. |
| Navegación | Rutas protegidas, navegación inferior en móvil, barra lateral en escritorio y aislamiento de datos entre cuentas. |
| Interfaz | Ocho vistas principales verificadas en 375, 768 y 1440 px sin desbordamiento horizontal. |
| Accesibilidad | Campos etiquetados, foco visible, diálogos con foco contenido y restaurado, navegación por teclado (Tab/Shift+Tab, Escape) en diálogos. |
| PWA | Manifest, iconos, registro del `service worker`, criterios de instalación de Chromium, y matrícula/cancelación tras recarga sin conexión, verificados con pruebas automatizadas. |

## 8. Ejecución y pruebas

```sh
npm install
npm run dev          # servidor de desarrollo
npm run dev:mobile    # ventana en modo app, tamaño y agente de usuario móvil
```

Verificación reproducible:

```sh
npx playwright install chromium
npm run build         # tsc --noEmit + build de Vite
npm run lint           # ESLint sobre src/**/*.{ts,tsx}
npm run test:e2e       # pruebas funcionales end-to-end (Playwright)
npm run test:pwa       # manifest, iconos, registro e instalación de la PWA
```

`npm run test:e2e` ejecuta 19 pruebas en Chromium sobre interacciones reales (autenticación, matrícula, cancelación, validación de almacenamiento y diseño responsive en 375/768/1440 px). `npm run test:pwa` usa la compilación de `dist/` para comprobar el manifest, el registro del `service worker`, los criterios de instalación y el flujo de matrícula/cancelación tras recargar sin conexión.

## 9. Credenciales de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Estudiante | estudiante@unsa.edu.pe | Unsa2026* |
| Administración | admin.sistemas@unsa.edu.pe | Admin2026* |

También se puede registrar una cuenta nueva con correo `@unsa.edu.pe` y un código de ocho dígitos; la autenticación es local y no representa un sistema de seguridad de producción.

## 10. Limitaciones

- Autenticación de demostración: las credenciales se guardan en el navegador, sin verificación de correo ni seguridad de servidor.
- Sin sincronización remota ni concurrencia real entre pestañas o dispositivos; la protección contra operaciones repetidas usa el estado de la instancia actual de la aplicación.
- Los cupos iniciales de otros estudiantes son datos agregados ficticios; las matrículas precargadas son escenarios de demostración, sin proceso externo de aprobación.
- Los plazos de matrícula son informativos, sin bloqueo automático por fecha. No hay envío de correos, notificaciones push ni constancias oficiales.
- Validación visual y automatizada realizada en Chromium de escritorio con tamaños responsive; no se probó en Safari, Firefox ni dispositivos físicos.

## 11. Conclusiones

El proyecto cumple el flujo completo de matrícula de laboratorios solicitado —autenticación, catálogo, matrícula, cancelación e historial— con reglas de negocio verificadas (cupos, cruce de horario, duplicados) y una interfaz responsive accesible desde 375 a 1440 px. La aplicación funciona además como PWA instalable: dispone de manifest, iconos, `service worker` con Workbox y modo sin conexión verificado tras la compilación de producción. Los roles de estudiante y administración están separados tanto en la interfaz como en la lógica de negocio, de modo que solo el estudiante puede matricularse. La cobertura de pruebas automatizadas (19 pruebas end-to-end más pruebas específicas de PWA) respalda el comportamiento descrito en este informe.
