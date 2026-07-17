export class NominaPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1, h2, h3, h4, h5, h6, .MuiTypography-root').filter({ hasText: /Nómina|Recibos/i }).first();
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 20000 });
  }

  // POST /api/hr/nomina
  async interact({ onFormReady } = {}) {
    await this.page.getByRole('button', { name: /Nuevo Registro/i }).click();

    // Seleccionar empleado del Autocomplete
    const empInput = this.page.getByLabel(/Empleado/i).first();
    await empInput.click();
    await this.page.waitForTimeout(600);
    const firstOption = this.page.getByRole('option').first();
    if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstOption.click();
    }

    // Tipo de registro
    await this.page.getByLabel(/Tipo de registro/i).click();
    await this.page.getByRole('option', { name: /Comprobante de Pago/i }).click();
    await this.page.waitForTimeout(500);

    // Mes
    await this.page.locator('[role="dialog"] [role="combobox"]').nth(2).click();
    await this.page.waitForTimeout(600);
    await this.page.getByRole('option', { name: /^Junio$/i }).click();

    // Año
    await this.page.getByLabel(/^Año/i).fill('2026');

    // Notas
    await this.page.getByLabel(/Notas/i)
      .fill('Comprobante de prueba E2E — Junio 2026');

    if (onFormReady) await onFormReady();

    // Crear → POST /api/hr/nomina
    await this.page.getByRole('button', { name: /Crear Registro/i }).click();
    await this.page.getByText(/Registro de nómina creado/i)
      .waitFor({ state: 'visible', timeout: 15000 });
  }
}
