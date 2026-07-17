export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#login-username, #login-username-rrhh, input[name="username"]').or(page.getByLabel('Username or email')).or(page.getByLabel(/Usuario/i)).first();
    this.passwordInput = page.locator('#login-password, #login-password-rrhh, input[name="password"]').or(page.getByLabel(/Contraseña/i)).first();
    this.signInButton = page.locator('#login-submit-btn, #login-submit-btn-rrhh, button[type="submit"]').or(page.getByRole('button', { name: /Iniciar Sesión|Sign In/i })).first();
  }

  async login(username, password) {
    await this.page.goto('/');
    await this.usernameInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
