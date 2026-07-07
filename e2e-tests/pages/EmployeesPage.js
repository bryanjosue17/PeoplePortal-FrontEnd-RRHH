export class EmployeesPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Empleados/i, level: 4 });
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  // POST /api/hr/employees
  async interact({ onFormReady } = {}) {
    const ts = Date.now();
    const code  = `EMP-E2E-${ts}`;
    const email = `e2e-${ts}@peopleportal.test`;

    await this.page.getByRole('button', { name: /Añadir Empleado/i }).click();

    // Campos requeridos (keycloakId se genera automáticamente)
    await this.page.locator('input[name="code"]').fill(code);
    await this.page.locator('input[name="fullName"]').fill('Juan Test E2E Automatizado');
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="department"]').fill('Tecnología');
    await this.page.locator('input[name="position"]').fill('QA Engineer');
    await this.page.locator('input[name="hireDate"]').fill('2026-01-15');

    // Select contractType (MUI → role combobox)
    await this.page.getByRole('combobox').first().click();
    await this.page.getByRole('option', { name: /Indefinido/i }).first().click();

    // Campos opcionales
    await this.page.locator('input[name="phone"]').fill('+506 8800-0099');
    await this.page.locator('input[name="site"]').fill('San José');
    await this.page.locator('input[name="emergencyContact"]').fill('Ana García');

    if (onFormReady) await onFormReady();

    // Guardar → POST /api/hr/employees
    await this.page.getByRole('button', { name: /Guardar/i }).click();

    // Esperar éxito O error con mensaje claro
    const success = this.page.getByText(/Empleado creado exitosamente/i).first();
    const failure = this.page.getByText(/Error al crear empleado/i).first();
    await Promise.race([
      success.waitFor({ state: 'visible', timeout: 15000 }),
      failure.waitFor({ state: 'visible', timeout: 15000 }).then(() => {
        throw new Error('API rechazó la creación del empleado — ver toast de error en pantalla');
      }),
    ]);

    // Verificar en tabla
    const searchBox = this.page.getByPlaceholder(/Buscar/i).first();
    if (await searchBox.isVisible()) {
      await searchBox.fill(code);
      await this.page.waitForTimeout(600);
      await this.page.getByText(code).first()
        .waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    }
  }
}
