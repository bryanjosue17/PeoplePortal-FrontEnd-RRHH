export class ApprovalsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Solicitudes|Aprobaciones/i, level: 4 });
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  // PATCH /api/hr/requests/{id}/status
  async interact({ onFormReady } = {}) {
    await this.page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

    // Usar filtro de tipo para probar el filtrado
    const typeSelect = this.page.getByLabel(/Tipo/i).first();
    if (await typeSelect.isVisible()) {
      await typeSelect.click();
      const vacOption = this.page.getByRole('option', { name: /Vacaciones/i });
      if (await vacOption.count() > 0) await vacOption.first().click();
      await this.page.waitForTimeout(400);
    }

    // Si hay solicitudes enviadas, aprobar la primera
    const approveBtn = this.page.getByRole('button', { name: /Aprobar/i }).first();
    if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      if (onFormReady) await onFormReady();
      await approveBtn.click();
      await this.page.getByText(/aprobada exitosamente/i)
        .waitFor({ state: 'visible', timeout: 10000 });
    }

    // Resetear filtro
    const allOption = this.page.getByRole('option', { name: /Todos los tipos/i });
    if (await allOption.isVisible({ timeout: 1000 }).catch(() => false)) {
      await allOption.click();
    }
  }
}
