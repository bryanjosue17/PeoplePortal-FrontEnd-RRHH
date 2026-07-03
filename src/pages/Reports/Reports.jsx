import AssessmentIcon from '@mui/icons-material/Assessment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Alert, Box, Button, Card, CardContent, Chip,
  CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography
} from '@mui/material';
import { Document, PDFDownloadLink, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useCallback, useEffect, useState } from 'react';
import {
  getActiveEmployees, getPendingDocuments, getRequestsByStatus,
  getRequestsByType, getRequestsOverTime
} from '../../api/reports';

const pdfStyles = StyleSheet.create({
  cell: { flex: 1, paddingHorizontal: 4 },
  footer: { color: '#888', fontSize: 9, marginTop: 30, textAlign: 'center' },
  headerRow: { borderBottom: '2 solid #333', flexDirection: 'row', fontWeight: 'bold', paddingVertical: 4 },
  page: { fontFamily: 'Helvetica', fontSize: 11, padding: 30 },
  row: { borderBottom: '1 solid #ccc', flexDirection: 'row', paddingVertical: 4 },
  subtitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 15 },
  summaryLabel: { fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  table: { marginTop: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});

function ReportTable({ data, columns }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => <TableCell key={col.key} sx={{ fontWeight: 600 }}>{col.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PdfDocument({ title, children }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>{title}</Text>
        <Text style={pdfStyles.footer}>Generado por PeoplePortal - {new Date().toLocaleDateString()}</Text>
        {children}
      </Page>
    </Document>
  );
}

const statusLabels = { Approved: 'Aprobado', Cancelled: 'Cancelado', InReview: 'En Revisión', Rejected: 'Rechazado', Submitted: 'Enviado' };

function RequestsByStatusPDF({ data }) {
  return (
    <PdfDocument title="Solicitudes por Estado">
      <Text style={pdfStyles.subtitle}>Distribución de solicitudes por estado</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.cell}>Estado</Text>
          <Text style={pdfStyles.cell}>Cantidad</Text>
        </View>
        {data.map((row, i) => (
          <View key={i} style={pdfStyles.row}>
            <Text style={pdfStyles.cell}>{statusLabels[row.status] ?? row.status}</Text>
            <Text style={pdfStyles.cell}>{row.count}</Text>
          </View>
        ))}
      </View>
      <View style={pdfStyles.summaryRow}>
        <Text style={pdfStyles.summaryLabel}>Total:</Text>
        <Text>{data.reduce((s, r) => s + r.count, 0)}</Text>
      </View>
    </PdfDocument>
  );
}

function RequestsByTypePDF({ data }) {
  return (
    <PdfDocument title="Solicitudes por Tipo">
      <Text style={pdfStyles.subtitle}>Distribución de solicitudes por tipo</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.cell}>Tipo</Text>
          <Text style={pdfStyles.cell}>Cantidad</Text>
        </View>
        {data.map((row, i) => (
          <View key={i} style={pdfStyles.row}>
            <Text style={pdfStyles.cell}>{row.type}</Text>
            <Text style={pdfStyles.cell}>{row.count}</Text>
          </View>
        ))}
      </View>
    </PdfDocument>
  );
}

function RequestsOverTimePDF({ data }) {
  return (
    <PdfDocument title="Solicitudes en el Tiempo">
      <Text style={pdfStyles.subtitle}>Evolución mensual de solicitudes</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.cell}>Período</Text>
          <Text style={pdfStyles.cell}>Cantidad</Text>
        </View>
        {data.map((row, i) => (
          <View key={i} style={pdfStyles.row}>
            <Text style={pdfStyles.cell}>{row.period}</Text>
            <Text style={pdfStyles.cell}>{row.count}</Text>
          </View>
        ))}
      </View>
    </PdfDocument>
  );
}

function ActiveEmployeesPDF({ data }) {
  return (
    <PdfDocument title="Empleados Activos">
      <Text style={pdfStyles.subtitle}>Resumen de empleados</Text>
      <View style={{ marginTop: 20 }}>
        <View style={pdfStyles.summaryRow}><Text style={pdfStyles.summaryLabel}>Total:</Text><Text>{data.total}</Text></View>
        <View style={pdfStyles.summaryRow}><Text style={pdfStyles.summaryLabel}>Activos:</Text><Text>{data.active}</Text></View>
        <View style={pdfStyles.summaryRow}><Text style={pdfStyles.summaryLabel}>En Licencia:</Text><Text>{data.onLeave}</Text></View>
        <View style={pdfStyles.summaryRow}><Text style={pdfStyles.summaryLabel}>Inactivos:</Text><Text>{data.inactive}</Text></View>
        <View style={pdfStyles.summaryRow}><Text style={pdfStyles.summaryLabel}>Terminados:</Text><Text>{data.terminated}</Text></View>
      </View>
    </PdfDocument>
  );
}

function PendingDocumentsPDF({ data }) {
  return (
    <PdfDocument title="Documentos Pendientes">
      <Text style={pdfStyles.subtitle}>Documentos pendientes y vencidos por empleado</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.cell}>Empleado</Text>
          <Text style={pdfStyles.cell}>Depto</Text>
          <Text style={pdfStyles.cell}>Pendientes</Text>
          <Text style={pdfStyles.cell}>Vencidos</Text>
        </View>
        {data.map((row, i) => (
          <View key={i} style={pdfStyles.row}>
            <Text style={pdfStyles.cell}>{row.employeeName}</Text>
            <Text style={pdfStyles.cell}>{row.department}</Text>
            <Text style={pdfStyles.cell}>{row.pendingCount}</Text>
            <Text style={pdfStyles.cell}>{row.expiredCount}</Text>
          </View>
        ))}
      </View>
    </PdfDocument>
  );
}

function DownloadButton({ label, document }) {
  return (
    <PDFDownloadLink document={document} fileName={`reporte-${label.toLowerCase().replace(/\s+/g, '-')}.pdf`}>
      {({ loading }) => (
        <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} disabled={loading}>
          {loading ? 'Generando...' : 'PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [overTimeData, setOverTimeData] = useState([]);
  const [employeesData, setEmployeesData] = useState(null);
  const [pendingDocsData, setPendingDocsData] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, typeRes, timeRes, empRes, docsRes] = await Promise.all([
        getRequestsByStatus(), getRequestsByType(), getRequestsOverTime(),
        getActiveEmployees(), getPendingDocuments(),
      ]);
      setStatusData(Array.isArray(statusRes.data) ? statusRes.data : []);
      setTypeData(Array.isArray(typeRes.data) ? typeRes.data : []);
      setOverTimeData(Array.isArray(timeRes.data) ? timeRes.data : []);
      setEmployeesData(empRes.data || null);
      setPendingDocsData(Array.isArray(docsRes.data) ? docsRes.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Box><Typography variant="h5" fontWeight={600} gutterBottom>Reportes</Typography><Alert severity="error">{error}</Alert></Box>;
  }

  return (
    <Box>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 3 }}>
        <AssessmentIcon color="primary" />
        <Typography variant="h4" fontWeight={700}>Reportes</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ md: 6, xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Solicitudes por Estado</Typography>
                {statusData.length > 0 && (
                  <DownloadButton label="solicitudes-por-estado" document={<RequestsByStatusPDF data={statusData} />} />
                )}
              </Box>
              <ReportTable data={statusData} columns={[
                { key: 'status', label: 'Estado' },
                { key: 'count', label: 'Cantidad' },
              ]} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ md: 6, xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Solicitudes por Tipo</Typography>
                {typeData.length > 0 && (
                  <DownloadButton label="solicitudes-por-tipo" document={<RequestsByTypePDF data={typeData} />} />
                )}
              </Box>
              <ReportTable data={typeData} columns={[
                { key: 'type', label: 'Tipo' },
                { key: 'count', label: 'Cantidad' },
              ]} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ md: 6, xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Solicitudes en el Tiempo</Typography>
                {overTimeData.length > 0 && (
                  <DownloadButton label="solicitudes-en-el-tiempo" document={<RequestsOverTimePDF data={overTimeData} />} />
                )}
              </Box>
              <ReportTable data={overTimeData} columns={[
                { key: 'period', label: 'Período' },
                { key: 'count', label: 'Cantidad' },
              ]} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ md: 6, xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Empleados Activos</Typography>
                {employeesData && (
                  <DownloadButton label="empleados-activos" document={<ActiveEmployeesPDF data={employeesData} />} />
                )}
              </Box>
              {employeesData && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {Object.entries({ Activos: 'active', 'En Licencia': 'onLeave', Inactivos: 'inactive', Terminados: 'terminated', Total: 'total' }).map(([label, key]) => (
                    <Box key={key} sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Chip label={employeesData[key]} size="small" color={key === 'active' ? 'success' : key === 'total' ? 'primary' : 'default'} />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Documentos Pendientes por Empleado</Typography>
                {pendingDocsData.length > 0 && (
                  <DownloadButton label="documentos-pendientes" document={<PendingDocumentsPDF data={pendingDocsData} />} />
                )}
              </Box>
              <ReportTable data={pendingDocsData} columns={[
                { key: 'employeeName', label: 'Empleado' },
                { key: 'department', label: 'Departamento' },
                { key: 'pendingCount', label: 'Pendientes' },
                { key: 'expiredCount', label: 'Vencidos' },
              ]} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
