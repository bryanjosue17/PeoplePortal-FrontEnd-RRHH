export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h3, h4').filter({ hasText: /¡Hola|Bienvenido|Dashboard/i }).first();
  }

  async navigateTo(moduleName) {
    if (/perfil|profile/i.test(moduleName)) {
      await this.page.locator('.MuiAvatar-root').first().click();
      await this.page.getByText('Mi Perfil').first().click();
      return;
    }
    const listItem = this.page.locator('.MuiListItemButton-root').filter({ hasText: new RegExp(moduleName, 'i') }).first();
    if (await listItem.isVisible()) {
      await listItem.click();
      return;
    }
    const navItem = this.page.locator(`nav >> text=/${moduleName}/i`).first();
    if (await navItem.isVisible()) {
      await navItem.click();
    } else {
      await this.page.getByText(new RegExp(moduleName, 'i')).first().click();
    }
  }

  async verifyLoaded() {
    await this.heading.waitFor({ state: 'visible', timeout: 20000 });
  }
}
