import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { EmployeesPage } from './pages/EmployeesPage.js';
import { ApprovalsPage } from './pages/ApprovalsPage.js';
import { AnnouncementsPage } from './pages/AnnouncementsPage.js';
import { BenefitsPage } from './pages/BenefitsPage.js';
import { NominaPage } from './pages/NominaPage.js';
import { UserManagementPage } from './pages/UserManagementPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';

// Configurar resolución 1080p y ejecución lenta
test.use({
  viewport: { width: 1920, height: 1080 },
  launchOptions: { slowMo: 600, args: ['--disable-gpu', '--no-sandbox'] },
});

test.describe('Portal RRHH - Full Flows (POM based)', () => {

  test('debe recorrer todos los flujos de administración de forma secuencial y estructurada', async ({ page }) => {
    test.setTimeout(240000); // Flujos completos con llamadas a API reales
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const employeesPage = new EmployeesPage(page);
    const approvalsPage = new ApprovalsPage(page);
    const announcementsPage = new AnnouncementsPage(page);
    const benefitsPage = new BenefitsPage(page);
    const nominaPage = new NominaPage(page);
    const userManagementPage = new UserManagementPage(page);
    const reportsPage = new ReportsPage(page);
    const documentsPage = new DocumentsPage(page);

    const shot = async (label) => {
      const buf = await page.screenshot({ fullPage: false });
      await test.info().attach(label, { body: buf, contentType: 'image/png' });
      await page.screenshot({ path: `../docs/rrhh/screenshots/${label}.png`, fullPage: false });
    };

    await test.step('1. Inicio de Sesión Admin (Keycloak)', async () => {
      await loginPage.login('admin', 'admin123');
      await dashboardPage.verifyLoaded();
      await shot('01-dashboard');
    });

    await test.step('2. Módulo de Empleados', async () => {
      await dashboardPage.navigateTo('empleados');
      await employeesPage.verifyLoaded();
      await employeesPage.interact({ onFormReady: () => shot('02-empleados-form') });
      await shot('02-empleados');
    });

    await test.step('3. Módulo de Documentos', async () => {
      await dashboardPage.navigateTo('documentos');
      await documentsPage.verifyLoaded();
      await documentsPage.interact({ onFormReady: () => shot('03-documentos-form') }); // GET /api/hr/documents + POST /api/hr/documents
      await shot('03-documentos');
    });

    await test.step('4. Módulo de Aprobaciones / Solicitudes', async () => {
      await dashboardPage.navigateTo('solicitudes');
      await approvalsPage.verifyLoaded();
      await approvalsPage.interact({ onFormReady: () => shot('04-solicitudes-form') }); // PATCH /api/hr/requests/{id}/status
      await shot('04-solicitudes');
    });

    await test.step('5. Módulo de Comunicados', async () => {
      await dashboardPage.navigateTo('comunicados');
      await announcementsPage.verifyLoaded();
      await announcementsPage.interact({ onFormReady: () => shot('05-comunicados-form') }); // POST /api/hr/announcements
      await shot('05-comunicados');
    });

    await test.step('6. Módulo de Beneficios', async () => {
      await dashboardPage.navigateTo('beneficios');
      await benefitsPage.verifyLoaded();
      await benefitsPage.interact({ onFormReady: () => shot('06-beneficios-form') }); // POST /api/hr/benefits
      await shot('06-beneficios');
    });

    await test.step('7. Módulo de Nómina', async () => {
      await dashboardPage.navigateTo('Nómina');
      await nominaPage.verifyLoaded();
      await nominaPage.interact({ onFormReady: () => shot('07-nomina-form') }); // POST /api/hr/nomina
      await shot('07-nomina');
    });

    await test.step('8. Módulo de Usuarios', async () => {
      await dashboardPage.navigateTo('usuarios');
      await userManagementPage.verifyLoaded();
      await userManagementPage.interact({ onFormReady: () => shot('08-usuarios-form') }); // POST /api/hr/users
      await shot('08-usuarios');
    });

    await test.step('9. Módulo de Reportes', async () => {
      await dashboardPage.navigateTo('reportes');
      await reportsPage.verifyLoaded();
      await shot('09-reportes');
    });

    await test.step('10. Volver al Dashboard', async () => {
      await dashboardPage.navigateTo('dashboard');
      await dashboardPage.verifyLoaded();
      await shot('10-dashboard-final');
    });
  });
});
