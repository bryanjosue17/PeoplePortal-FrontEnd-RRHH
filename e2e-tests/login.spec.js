import { test, expect } from '@playwright/test';

test.describe('Login Flow - Portal RRHH', () => {
  test('debe iniciar sesión exitosamente a través de Keycloak y redirigir al Dashboard de RRHH', async ({ page }) => {
    await test.step('1. Navegar a la aplicación', async () => {
      await page.goto('/');
    });

    await test.step('2. Validar redirección a Keycloak', async () => {
      await expect(page).toHaveURL(/.*localhost:30080.*realms.*/);
      await expect(page.getByLabel('Username or email')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    await test.step('3. Completar credenciales de RRHH', async () => {
      await page.getByLabel('Username or email').fill('admin');
      await page.locator('input[name="password"]').fill('admin123');
      await page.getByRole('button', { name: 'Sign In' }).click();
    });

    await test.step('4. Validar acceso exitoso al Dashboard', async () => {
      // El dashboard puede tardar en cargar dependiendo del AuthGuard, usamos auto-waiting con locators
      await expect(page).toHaveURL(/.*localhost:30082.*/);
      await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({ timeout: 10000 });
      // Verificar que el usuario está logueado como Admin
      await expect(page.locator('body')).toContainText(/Admin/i);
    });
  });
});
