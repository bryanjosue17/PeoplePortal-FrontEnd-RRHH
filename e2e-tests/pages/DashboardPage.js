export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Dashboard/i });
  }

  async navigateTo(moduleName) {
    await this.page.locator(`nav >> text=/${moduleName}/i`).first().click();
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 15000 });
  }
}
