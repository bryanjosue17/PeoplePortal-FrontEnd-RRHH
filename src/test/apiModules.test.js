import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiClientMock = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../api/client', () => ({
  default: apiClientMock,
}));

describe('API modules - FrontEnd RRHH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('announcements usa endpoints correctos', async () => {
    const { getActiveAnnouncements, createAnnouncement } = await import('../api/announcements');
    const payload = { title: 'Comunicado', body: 'Texto', type: 'General' };

    getActiveAnnouncements();
    createAnnouncement(payload);

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/announcements');
    expect(apiClientMock.post).toHaveBeenCalledWith('/api/hr/announcements', payload);
  });

  it('benefits usa endpoints correctos', async () => {
    const { getAllBenefits, createBenefit, updateBenefit, deactivateBenefit } = await import('../api/benefits');
    const payload = { name: 'Seguro', description: 'Seguro medico', type: 'Salud' };

    getAllBenefits();
    createBenefit(payload);
    updateBenefit('b-1', payload);
    deactivateBenefit('b-1');

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/benefits');
    expect(apiClientMock.post).toHaveBeenCalledWith('/api/hr/benefits', payload);
    expect(apiClientMock.put).toHaveBeenCalledWith('/api/hr/benefits/b-1', payload);
    expect(apiClientMock.delete).toHaveBeenCalledWith('/api/hr/benefits/b-1');
  });

  it('dashboard usa endpoint correcto', async () => {
    const { getDashboard } = await import('../api/dashboard');
    getDashboard();
    expect(apiClientMock.get).toHaveBeenCalledWith('/api/dashboard');
  });

  it('employees usa endpoints correctos', async () => {
    const { getAllEmployees, getEmployeeById, createEmployee, updateEmployee } = await import('../api/employees');
    const payload = { fullName: 'Ana Perez', email: 'ana@corp.com' };

    getAllEmployees();
    getEmployeeById('e-1');
    createEmployee(payload);
    updateEmployee('e-1', payload);

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/employees');
    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/employees/e-1');
    expect(apiClientMock.post).toHaveBeenCalledWith('/api/hr/employees', payload);
    expect(apiClientMock.put).toHaveBeenCalledWith('/api/hr/employees/e-1', payload);
  });

  it('hrDocuments usa endpoints correctos', async () => {
    const { getAllDocuments, uploadDocument, updateDocumentStatus } = await import('../api/hrDocuments');
    const payload = { employeeId: 'e-1', name: 'Contrato' };
    const statusPayload = { status: 'Approved' };

    getAllDocuments();
    uploadDocument(payload);
    updateDocumentStatus('d-1', statusPayload);

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/documents');
    expect(apiClientMock.post).toHaveBeenCalledWith('/api/hr/documents', payload);
    expect(apiClientMock.patch).toHaveBeenCalledWith('/api/hr/documents/d-1/status', statusPayload);
  });

  it('hrRequests usa endpoints correctos', async () => {
    const { getAllRequests, updateRequestStatus } = await import('../api/hrRequests');
    const payload = { status: 'Approved', comment: 'OK' };

    getAllRequests();
    updateRequestStatus('r-1', payload);

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/requests');
    expect(apiClientMock.patch).toHaveBeenCalledWith('/api/hr/requests/r-1/status', payload);
  });

  it('reports usa endpoints correctos', async () => {
    const {
      getRequestsByStatus,
      getRequestsByType,
      getRequestsOverTime,
      getActiveEmployees,
      getPendingDocuments,
    } = await import('../api/reports');

    getRequestsByStatus();
    getRequestsByType();
    getRequestsOverTime();
    getActiveEmployees();
    getPendingDocuments();

    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/reports/requests-by-status');
    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/reports/requests-by-type');
    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/reports/requests-over-time');
    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/reports/active-employees');
    expect(apiClientMock.get).toHaveBeenCalledWith('/api/hr/reports/pending-documents');
  });
});
