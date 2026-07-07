export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username or email');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async login(username, password) {
    await this.page.goto('/');
    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
