export class ReportsPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Reportes/i, level: 4 });
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }
}
