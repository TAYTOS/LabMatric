# LabMatric

PWA académica de demostración para consultar y gestionar matrículas de laboratorios. Todo funciona localmente en el navegador: no hay backend, pagos, autenticación real ni sincronización remota.

## Stack

- React 18, TypeScript estricto, Vite y Tailwind CSS.
- React Router, Framer Motion, vite-plugin-pwa/Workbox y jsPDF.
- Persistencia tolerante a fallos mediante `localStorage`.
- Vitest para reglas de negocio y Playwright para flujos E2E/PWA.

## Funcionalidades

- Roles simulados de estudiante y administración.
- Validación centralizada de cupos, duplicados, cruces de horario y restitución de vacantes al cancelar.
- Tema claro/oscuro persistente, transiciones entre vistas, skeletons y búsqueda con debounce y resaltado.
- Calendario semanal de matrículas activas, comparador de grupos y favoritos.
- Lista de espera simulada para grupos llenos: al liberarse una vacante se notifica a la primera persona en espera.
- Constancia e historial en PDF del lado cliente, con Web Share API cuando el navegador permite compartir archivos.
- Recordatorio local de prueba mediante Notification API mientras la PWA está activa.
- Cola local de matrículas offline: al recuperar conexión, vuelve a validar y aplica o rechaza la acción.
- Instalación nativa, modo offline, actualización controlada y shortcuts para Matrículas y Horario.

## Estructura

```text
src/
  components/     UI reutilizable, calendario, cursos, PWA y layout
  contexts/       sesión, matrícula, preferencias, PWA y avisos
  data/           catálogo y cuentas de demostración
  hooks/          comportamiento reutilizable de interfaz
  pages/          rutas y composición de pantallas
  services/       reglas puras, PDF, compartir y notificaciones
  types/          modelos discriminados y contratos
  utils/          horario, almacenamiento y utilidades
tests/
  unit/           reglas de matrícula, horario y almacenamiento
  application.spec.ts
  pwa.spec.ts
public/icons/     identidad e iconos de instalación
```

## Prioridad De Implementación

1. Reglas de negocio tipadas y pruebas unitarias.
2. Persistencia local tolerante a fallos y cola offline.
3. Identidad, temas, accesibilidad y estados de carga.
4. Calendario, comparador, favoritos y lista de espera.
5. PDF, compartir, notificaciones y pulido PWA.
6. Cobertura E2E/PWA y verificación reproducible.

## Ejecutar

```sh
npm install
npm run dev
```

Credenciales locales de demostración:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Estudiante | `estudiante@unsa.edu.pe` | `Unsa2026*` |
| Administración | `admin.sistemas@unsa.edu.pe` | `Admin2026*` |

## Verificación

```sh
npx playwright install chromium
npm run build
npm run lint
npm run test:unit
npm run test:e2e
npm run test:pwa
```

`npm run test:pwa` usa la compilación de `dist`, por lo que debe ejecutarse después de `npm run build`. `npm run verify` ejecuta build, lint y pruebas unitarias.

## Alcance De La Simulación

La cola offline no envía peticiones HTTP ni usa un servidor: conserva acciones en la instantánea local y las procesa al evento `online`. Si las condiciones cambiaron, deja la acción como rechazada y muestra una notificación local dentro de la app.

Los recordatorios no son Push Notifications programadas. La aplicación solicita permiso explícito y puede mostrar un recordatorio de prueba mientras está activa. Por eso no garantiza avisos cuando el navegador o la PWA están cerrados.

`src/utils/storage.ts` encapsula errores por modo privado, cuota, almacenamiento bloqueado o JSON corrupto. Si falla, la aplicación continúa en memoria durante la sesión. La clave académica histórica `courselab_academic_v1` se conserva únicamente para no descartar demostraciones locales existentes.
