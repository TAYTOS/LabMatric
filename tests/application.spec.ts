import { test, expect, Page } from '@playwright/test';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Cuenta de estudiante' }).click();
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
}
async function session(page: Page, role = 'u1') {
  await page.goto('/login');
  await page.evaluate((id) => localStorage.setItem('courselab_session_user_id', JSON.stringify(id)), role);
  await page.goto('/home');
}
async function enroll(page: Page, path = '/cursos/c1/grupos/g1a') {
  await page.goto(path);
  await page.getByRole('button', { name: 'Matricularme', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar matrícula', exact: true }).click();
}
async function snapshot(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('courselab_academic_v1') || 'null'));
}

test('onboarding steps and welcome navigation are interactive', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole('button', { name: 'Paso 2:' }).click();
  await expect(page.getByRole('heading', { name: 'Consulta grupos y horarios' })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await expect(page).toHaveURL(/\/welcome$/);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByRole('link', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('invalid capacity and partial legacy data recover a coherent seed', async ({ page }) => {
  await page.goto('/login');
  const result = await page.evaluate(async () => {
    const service = await import('/src/services/enrollmentService.ts');
    const initial = service.loadAcademicState();
    const broken = structuredClone(initial);
    broken.groups[0].capacity = -1;
    localStorage.setItem('courselab_academic_v1', JSON.stringify(broken));
    const recovered = service.loadAcademicState();
    localStorage.removeItem('courselab_academic_v1');
    const added = service.enrollStudent(initial, 'test-student', 'c1', 'g1a');
    localStorage.setItem('courselab_enrollments', JSON.stringify(added.state.enrollments));
    const partial = service.loadAcademicState();
    return { valid: service.validAcademicState(recovered), capacity: recovered.groups[0].capacity, partialValid: service.validAcademicState(partial), enrollmentCount: partial.enrollments.length, initialCount: initial.enrollments.length };
  });
  expect(result.valid).toBe(true);
  expect(result.capacity).toBe(20);
  expect(result.partialValid).toBe(true);
  expect(result.enrollmentCount).toBe(result.initialCount);
});

test('login validation, password visibility, persisted session and logout', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByText('Ingresa tu correo institucional.', { exact: true })).toBeVisible();
  await expect(page.getByText('Ingresa tu contraseña.', { exact: true })).toBeVisible();
  await page.getByLabel('Correo institucional').fill('estudiante@unsa.edu.pe');
  await page.getByLabel('Contraseña', { exact: false }).first().fill('incorrecta');
  await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).click();
  await expect(page.locator('input[autocomplete="current-password"]')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('incorrectos');
  await signIn(page);
  await page.reload();
  await expect(page).toHaveURL(/\/home$/);
  await page.getByRole('link', { name: 'Perfil', exact: true }).click();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('courselab_session_user_id'))).toBeNull();
  await page.goto('/matriculas');
  await expect(page).toHaveURL(/\/login$/);
});

test('registration validates all requirements and creates a usable isolated account', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByText('Ingresa tus nombres.')).toBeVisible();
  await expect(page.getByText('Debes aceptar los términos y condiciones.')).toBeVisible();
  await page.getByLabel('Nombres').fill('Ana');
  await page.getByLabel('Apellidos').fill('Torres');
  await page.getByLabel('Código de estudiante').fill('20269999');
  await page.getByLabel('Correo institucional').fill('ana@example.com');
  await page.getByLabel('Contraseña', { exact: false }).filter({ visible: true }).first().fill('Prueba2026*');
  await page.getByLabel('Confirmar contraseña').fill('diferente');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByText('Usa tu correo institucional (@unsa.edu.pe).')).toBeVisible();
  await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
  await page.getByLabel('Correo institucional').fill('ana@unsa.edu.pe');
  await page.getByLabel('Confirmar contraseña').fill('Prueba2026*');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await page.goto('/matriculas/e1');
  await expect(page).toHaveURL(/\/matriculas$/);
  await expect(page.getByText('Todavía no tienes matrículas')).toBeVisible();
  await page.goto('/notificaciones');
  await expect(page.getByText('Tu matrícula en Ingeniería de Software II – Grupo B fue registrada correctamente.')).toHaveCount(0);
  await page.goto('/login');
  await page.getByLabel('Correo institucional').fill('ana@unsa.edu.pe');
  await page.locator('input[autocomplete="current-password"]').fill('Prueba2026*');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
});

test('search, combined filters, empty state, clear and course/group navigation', async ({ page }) => {
  await session(page);
  await page.getByRole('link', { name: 'Cursos', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(4);
  await page.getByRole('searchbox').fill('1703234');
  await expect(page.locator('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Ver grupos' }).click();
  await expect(page).toHaveURL(/\/cursos\/c1$/);
  await expect(page.getByText('Grupo A', { exact: true })).toBeVisible();
  await expect(page.getByText('Grupo B', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ver detalle' }).first().click();
  await expect(page).toHaveURL(/g1a$/);
  await page.getByRole('button', { name: 'Volver', exact: true }).first().click();
  await expect(page).toHaveURL(/\/cursos\/c1$/);
  await page.goto('/cursos');
  await page.getByRole('searchbox').fill('ninguno');
  await expect(page.getByText('No se encontraron cursos')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  await page.getByRole('button', { name: 'Lunes', exact: true }).click();
  await page.getByRole('button', { name: 'Disponible', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ver 0 resultados' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
  await page.getByRole('button', { name: 'Ver 4 resultados' }).click();
  await expect(page.locator('article')).toHaveCount(4);
});

test('enrollment updates seats, rejects duplicates, persists and cancellation restores exactly one seat', async ({ page }) => {
  await session(page);
  await enroll(page);
  await expect(page.getByRole('dialog')).toContainText('Tu matrícula se registró correctamente');
  let data = await snapshot(page);
  expect(data.groups.find((g: { id: string }) => g.id === 'g1a').enrolled).toBe(16);
  const id = data.enrollments[0].id;
  await page.getByRole('button', { name: 'Ver mis matrículas' }).click();
  await expect(page.locator('article').filter({ hasText: 'Plataformas Emergentes' })).toBeVisible();
  await page.reload();
  await expect(page.locator('article').filter({ hasText: 'Plataformas Emergentes' })).toBeVisible();
  await enroll(page, '/cursos/c1/grupos/g1b');
  await expect(page.getByRole('dialog')).toContainText('Ya tienes una matrícula activa');
  await page.goto(`/matriculas/${id}`);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar constancia' }).click();
   expect((await download).suggestedFilename()).toContain('.pdf');
  await page.getByRole('button', { name: 'Cancelar matrícula', exact: true }).click();
  await page.getByRole('button', { name: 'Conservar matrícula' }).click();
  expect((await snapshot(page)).groups.find((g: { id: string }) => g.id === 'g1a').enrolled).toBe(16);
  await page.getByRole('button', { name: 'Cancelar matrícula', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, cancelar matrícula' }).click();
  await expect(page.getByRole('dialog')).toContainText('Tu matrícula fue cancelada');
  data = await snapshot(page);
  expect(data.groups.find((g: { id: string }) => g.id === 'g1a').enrolled).toBe(15);
  expect(data.enrollments.find((e: { id: string }) => e.id === id).status).toBe('cancelada');
  await page.goto('/matriculas');
  await expect(page.locator('article').filter({ hasText: 'Plataformas Emergentes' })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Historial' }).click();
  await expect(page.locator('article').filter({ hasText: 'Plataformas Emergentes' })).toHaveCount(2);
  await page.reload();
  expect((await snapshot(page)).groups.find((g: { id: string }) => g.id === 'g1a').enrolled).toBe(15);
});

test('full groups, schedule conflicts and mismatched course URLs', async ({ page }) => {
  await session(page);
  await page.goto('/cursos/c2/grupos/g2a');
  await expect(page.getByRole('button', { name: 'Sin vacantes disponibles' })).toBeDisabled();
  await enroll(page, '/cursos/c4/grupos/g4b');
  await expect(page.getByRole('dialog')).toContainText('Cruce de horario');
  await page.goto('/cursos/c1/grupos/g2a');
  await expect(page).toHaveURL(/\/cursos$/);
});

test('theme, comparison, favorites, waitlist and weekly schedule are available to a student', async ({ page }) => {
  await session(page);
  await page.goto('/cursos/c1');
  await page.getByRole('button', { name: 'Comparar grupos' }).click();
  await expect(page.getByRole('table')).toContainText('Grupo A');
  await expect(page.getByRole('table')).toContainText('Grupo B');
  await page.getByRole('button', { name: 'Activar modo oscuro' }).click();
  expect(await page.locator('html').evaluate((element) => element.classList.contains('dark'))).toBe(true);
  await page.goto('/cursos/c2/grupos/g2a');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await page.getByRole('button', { name: 'Unirme a lista de espera', exact: true }).click();
  await page.goto('/guardados');
  await expect(page.getByText('Calidad de Software', { exact: true })).toBeVisible();
  await expect(page.getByText('Estás en lista de espera simulada.')).toBeVisible();
  await page.goto('/calendario');
  await expect(page.getByText('Ingeniería de Software II', { exact: true })).toBeVisible();
});

test('service rejects full capacity, repeated cancellation, duplicate calls and invalid associations', async ({ page }) => {
  await page.goto('/login');
  const result = await page.evaluate(async () => {
    // Exercise the same service used by the UI, including cases blocked by disabled controls.
    const service = await import('/src/services/enrollmentService.ts');
    const initial = service.loadAcademicState();
    const full = service.enrollStudent(initial, 'test-student', 'c2', 'g2a');
    const wrong = service.enrollStudent(initial, 'test-student', 'c1', 'g2a');
    const first = service.enrollStudent(initial, 'test-student', 'c1', 'g1a');
    const duplicate = service.enrollStudent(first.state, 'test-student', 'c1', 'g1b');
    const cancelled = service.cancelStudentEnrollment(first.state, first.result.enrollment.id);
    const repeated = service.cancelStudentEnrollment(cancelled, first.result.enrollment.id);
    return { full: full.result.error, wrong: wrong.result.error, duplicate: duplicate.result.error, repeated, restored: cancelled.groups.find((g: { id: string }) => g.id === 'g1a').enrolled };
  });
  expect(result).toEqual({ full: 'full', wrong: 'unknown', duplicate: 'already_enrolled', repeated: null, restored: 15 });
});

for (const corrupt of ['{broken', 'null', '{"groups":[]}', '[{"id":"broken"}]']) {
  test(`safe recovery from invalid persistence: ${corrupt}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/login');
    await page.evaluate((value) => {
      for (const key of ['courselab_users', 'courselab_groups', 'courselab_enrollments', 'courselab_notifications', 'courselab_academic_v1']) localStorage.setItem(key, value);
    }, corrupt);
    await signIn(page);
    await page.goto('/cursos');
    await expect(page.locator('article')).toHaveCount(4);
    expect(errors).toEqual([]);
  });
}

test('dialog keyboard focus is trapped and restored', async ({ page }) => {
  await session(page);
  await page.goto('/cursos/c1/grupos/g1a');
  const trigger = page.getByRole('button', { name: 'Matricularme', exact: true });
  await trigger.click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

for (const width of [375, 768, 1440]) {
  test(`responsive screens and navigation at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await session(page);
    for (const path of ['/home', '/cursos', '/cursos/c1', '/cursos/c1/grupos/g1a', '/matriculas', '/matriculas/e1', '/perfil', '/notificaciones']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await expect(page.getByRole('navigation', { name: 'Navegación principal' }).filter({ visible: true })).toBeVisible();
      if (width < 1024) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        expect(await page.evaluate(() => {
          const main = document.querySelector('main > div');
          const nav = Array.from(document.querySelectorAll('nav')).find((n) => getComputedStyle(n).position === 'fixed');
          return !main || !nav || main.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top;
        })).toBe(true);
      }
    }
    await page.goto('/cursos');
    await expect(page.locator('article')).toHaveCount(4);
    await page.screenshot({ path: testInfo.outputPath(`courses-${width}.png`), fullPage: true });
    if (width === 1440) {
      await page.getByRole('button', { name: 'Colapsar barra lateral' }).click();
      await page.getByRole('button', { name: 'Expandir barra lateral' }).click();
    }
    await page.getByRole('link', { name: 'Matrículas', exact: true }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/matriculas$/);
    expect(errors).toEqual([]);
  });
}

test('profile validation, persistence, help and truthful recovery information', async ({ page }) => {
  await signIn(page);
  await page.goto('/perfil');
  await page.getByRole('button', { name: 'Editar información' }).click();
  await page.getByLabel('Correo institucional').fill('persona@example.com');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('alert')).toContainText('@unsa.edu.pe');
  await page.getByLabel('Correo institucional').fill('estudiante@unsa.edu.pe');
  await page.getByLabel('Nombres').fill('José');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'José Cusilayme García' })).toBeVisible();
  await page.getByRole('button', { name: 'Ayuda', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('¿Cómo me matriculo');
  await page.keyboard.press('Escape');
  await page.goto('/notificaciones');
  await page.getByRole('button', { name: 'Marcar todas como leídas' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Marcar todas como leídas' })).toHaveCount(0);
  await page.goto('/login');
  await page.getByRole('button', { name: 'Olvidé mi contraseña' }).click();
  await expect(page.getByRole('dialog')).toContainText('no envía correos');
  await page.getByRole('button', { name: 'Usar cuenta de estudiante' }).click();
  await expect(page.getByLabel('Correo institucional')).toHaveValue('estudiante@unsa.edu.pe');
});

test('blocked storage still supports in-memory login and enrollment', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.removeItem = () => { throw new Error('Storage unavailable'); };
  });
  await signIn(page);
  await page.getByRole('link', { name: 'Cursos', exact: true }).click();
  await page.locator('article').filter({ hasText: 'Plataformas Emergentes' }).getByRole('button', { name: 'Ver grupos' }).click();
  await page.getByRole('button', { name: 'Ver detalle' }).first().click();
  await page.getByRole('button', { name: 'Matricularme', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar matrícula', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Tu matrícula se registró correctamente');
  await page.getByRole('button', { name: 'Ver mis matrículas' }).click();
  await expect(page.locator('article').filter({ hasText: 'Plataformas Emergentes' })).toBeVisible();
});

test('admin course/group controls, capacity validation and correct student details', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Cuenta de administrador' }).click();
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('tab', { name: 'Grupos', exact: true }).click();
  await page.getByLabel('Filtrar grupos por curso').selectOption('c1');
  await page.getByRole('button', { name: 'Editar Grupo A', exact: true }).click();
  await page.getByLabel('Capacidad').fill('14');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Capacidad').fill('21');
  await page.getByLabel(/^Fin/).fill('09:00');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('alert')).toContainText('posterior');
  await page.getByLabel(/^Fin/).fill('12:20');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  expect((await snapshot(page)).groups.find((g: { id: string }) => g.id === 'g1a').capacity).toBe(21);
  await page.getByRole('tab', { name: 'Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Nuevo curso' }).click();
  await page.getByRole('dialog').getByLabel('Código', { exact: false }).fill('1703999');
  await page.getByLabel('Nombre del curso').fill('Arquitectura de Software');
  await page.getByLabel('Descripción').fill('Diseño de arquitecturas de software y evaluación de atributos de calidad.');
  await page.getByLabel('Docente titular').fill('Ing. María Torres');
  await page.getByRole('button', { name: 'Crear curso' }).click();
  await expect(page.getByRole('cell', { name: /Curso Arquitectura de Software/ })).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar Arquitectura de Software', exact: true }).click();
  await page.getByRole('button', { name: 'Sí, eliminar curso' }).click();
  await expect(page.getByRole('cell', { name: /Curso Arquitectura de Software/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Eliminar Ingeniería de Software II', exact: true })).toBeDisabled();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const tab of ['Resumen', 'Cursos', 'Grupos', 'Matrículas']) {
      await page.getByRole('tab', { name: tab, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await page.getByRole('row').filter({ hasText: 'MAT-2026-0912' }).getByRole('button', { name: 'Ver', exact: true }).click();
  await expect(page.locator('main')).toContainText('José Luis Cusilayme García');
  await expect(page.locator('main')).not.toContainText('Mariana Delgado');
});
