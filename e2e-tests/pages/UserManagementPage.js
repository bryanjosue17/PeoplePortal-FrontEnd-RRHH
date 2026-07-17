export class UserManagementPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1, h2, h3, h4, h5, h6, .MuiTypography-root').filter({ hasText: /Usuarios/i }).first();
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 20000 });
  }

  // POST /api/hr/users
  async interact({ onFormReady } = {}) {
    const uid = `e2e.${Date.now()}`;
    await this.page.getByRole('button', { name: /Nuevo Usuario/i }).click();

    // Llenar todos los campos del formulario
    await this.page.getByLabel('Username *').fill(uid);
    await this.page.getByLabel('Email *').fill(`${uid}@peopleportal.test`);
    await this.page.getByLabel('Nombre').fill('Test');
    await this.page.getByLabel('Apellido').fill('E2E');
    await this.page.getByLabel(/Contraseña temporal/i).fill('TestE2E2026!');

    if (onFormReady) await onFormReady();

    // Crear → POST /api/hr/users
    await this.page.getByRole('button', { name: /Crear Usuario/i }).click();
    await this.page.getByText(/Usuario creado|creado exitosamente/i)
      .waitFor({ state: 'visible', timeout: 15000 });
  }
}
