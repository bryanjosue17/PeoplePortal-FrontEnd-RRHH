export class ProfilePage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1, h2, h3, h4, h5, h6, .MuiTypography-root').filter({ hasText: /Información de Contacto|Detalles de Cuenta|Mi Perfil|Cuenta Administrativa/i }).first();
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 20000 });
  }

  // PUT /api/employees/me
  async interact({ onFormReady } = {}) {
    const editBtn = this.page.getByRole('button', { name: /Editar/i }).first();
    if (!(await editBtn.isVisible())) return;
    await editBtn.click();

    // Llenar todos los campos editables
    await this.page.locator('input[name="phone"]').fill('+506 8800-0001');
    await this.page.locator('input[name="site"]').fill('San José, Costa Rica');
    await this.page.locator('input[name="emergencyContact"]').fill('María García');
    await this.page.locator('input[name="emergencyPhone"]').fill('+506 8900-0000');

    if (onFormReady) await onFormReady();

    // Guardar → PUT /api/employees/me
    await this.page.getByRole('button', { name: /Guardar/i }).first().click();
    await this.page.getByText(/Perfil actualizado exitosamente/i).first()
      .waitFor({ state: 'visible', timeout: 15000 });
  }
}
