export class BenefitsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Beneficios/i, level: 5 });
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  // POST /api/hr/benefits
  async interact({ onFormReady } = {}) {
    await this.page.getByRole('button', { name: /Nuevo Beneficio/i }).click();

    await this.page.locator('input[name="name"]').fill('Beneficio Test E2E Automatizado');

    // Type select
    await this.page.getByLabel(/Tipo/i).click();
    await this.page.getByRole('option', { name: /Salud/i }).click();

    await this.page.locator('textarea[name="description"], input[name="description"]').first()
      .fill('Cobertura médica de prueba creada por los tests E2E para verificar POST /api/hr/benefits.');

    if (onFormReady) await onFormReady();

    // Guardar → POST /api/hr/benefits
    await this.page.getByRole('button', { name: /^Guardar$/i }).click();
    await this.page.getByText(/Beneficio creado exitosamente/i)
      .waitFor({ state: 'visible', timeout: 15000 });

    // Verificar que aparece en la lista
    await this.page.getByText('Beneficio Test E2E Automatizado').first()
      .waitFor({ state: 'visible', timeout: 8000 });
  }
}
