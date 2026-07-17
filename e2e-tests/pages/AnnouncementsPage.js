export class AnnouncementsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1, h2, h3, h4, h5, h6, .MuiTypography-root').filter({ hasText: /Comunicados|Anuncios/i }).first();
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 20000 });
  }

  // POST /api/hr/announcements
  async interact({ onFormReady } = {}) {
    await this.page.getByRole('button', { name: /Nuevo Comunicado/i }).click();

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const expDate = nextMonth.toISOString().split('T')[0];

    await this.page.locator('input[name="title"]').fill('Comunicado de Prueba E2E Automatizado');

    // Type select
    await this.page.getByLabel(/Tipo/i).click();
    await this.page.getByRole('option', { name: /^HrNotice$/i }).click();

    await this.page.locator('input[name="expiresAt"]').fill(expDate);
    await this.page.locator('textarea[name="body"]').fill(
      'Este comunicado fue creado automáticamente por los tests E2E para verificar el endpoint POST /api/hr/announcements. Contiene información de prueba.'
    );

    if (onFormReady) await onFormReady();

    // Crear → POST /api/hr/announcements
    await this.page.getByRole('button', { name: /^Crear$/i }).click();
    await this.page.getByText(/Comunicado creado exitosamente/i)
      .waitFor({ state: 'visible', timeout: 15000 });

    // Verificar que aparece en la lista
    await this.page.getByText('Comunicado de Prueba E2E Automatizado').first()
      .waitFor({ state: 'visible', timeout: 8000 });
  }
}
