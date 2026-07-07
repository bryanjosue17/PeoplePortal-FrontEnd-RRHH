export class UserManagementPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Usuarios/i, level: 4 });
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible' });
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
