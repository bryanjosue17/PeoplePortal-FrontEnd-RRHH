export class ReportsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1, h2, h3, h4, h5, h6, .MuiTypography-root, .MuiAlert-root').filter({ hasText: /Reportes|Estadísticas|Gerenciales/i }).first();
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 25000 });
  }
}
