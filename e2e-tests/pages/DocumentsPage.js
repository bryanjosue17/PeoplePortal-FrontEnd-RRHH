export class DocumentsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1, h2, h3, h4, h5, h6, .MuiTypography-root').filter({ hasText: /Documentos/i }).first();
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 20000 });
  }

  // GET /api/hr/documents + POST /api/hr/documents
  async interact({ onFormReady } = {}) {
    await this.page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});

    // Buscar en la tabla
    const searchBox = this.page.getByPlaceholder(/Buscar/i).first();
    if (await searchBox.isVisible()) {
      await searchBox.fill('contrato');
      await this.page.waitForTimeout(500);
      await searchBox.clear();
    }

    // Subir un nuevo documento \u2192 POST /api/hr/documents
    const uploadBtn = this.page.getByRole('button', { name: /Subir|Nuevo Documento/i }).first();
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadBtn.click();

      // Seleccionar empleado
      const empInput = this.page.getByLabel(/Empleado/i).first();
      if (await empInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await empInput.click();
        await this.page.waitForTimeout(500);
        const firstEmpOption = this.page.getByRole('option').first();
        if (await firstEmpOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await firstEmpOption.click();
        }
      }

      await this.page.locator('input[name="name"]').fill('Contrato Prueba E2E');

      // Type select
      const typeField = this.page.getByLabel(/Tipo/i);
      if (await typeField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await typeField.click();
        await this.page.getByRole('option', { name: /Contract/i }).first().click();
      }

      await this.page.locator('input[name="fileUrl"]').fill('https://storage.example.com/contrato-e2e-test.pdf');

      if (onFormReady) await onFormReady();

      await this.page.getByRole('button', { name: /Guardar|Subir/i }).first().click();
      await this.page.getByText(/Documento subido exitosamente/i)
        .waitFor({ state: 'visible', timeout: 15000 });
    }
  }
}
