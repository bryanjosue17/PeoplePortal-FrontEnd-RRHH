import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Alert, Box, Button, Card, CardContent, Chip,
  CircularProgress, Divider, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS,
  Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from 'chart.js';
import { Document, PDFDownloadLink, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useCallback, useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  getActiveEmployees, getPendingDocuments, getRequestsByStatus,
  getRequestsByType, getRequestsOverTime,
} from '../../api/reports';

// ─── Chart.js registration ────────────────────────────────────────────────
ChartJS.register(
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
);

// ─── Color palettes ───────────────────────────────────────────────────────
const STATUS_COLORS = {
  Submitted: '#60A5FA', InReview: '#F59E0B',
  Approved: '#34D399',  Rejected: '#F87171', Cancelled: '#94A3B8',
};
const TYPE_COLORS = ['#34D399', '#60A5FA', '#F59E0B', '#A78BFA', '#FB923C', '#F87171'];
const EMP_COLORS  = { active: '#34D399', onLeave: '#F59E0B', inactive: '#94A3B8', terminated: '#F87171' };
const TIME_COLOR  = '#60A5FA';

const statusLabels = { Approved: 'Aprobado', Cancelled: 'Cancelado', InReview: 'En Revisión', Rejected: 'Rechazado', Submitted: 'Enviado' };
const typeLabels   = { Certificate: 'Constancia', DataUpdate: 'Act. Datos', Other: 'Otro', Permission: 'Permiso', Vacation: 'Vacaciones', Voucher: 'Voucher' };

// ─── Theme-aware chart defaults ───────────────────────────────────────────
function useChartTheme() {
  const theme = useTheme();
  const dark  = theme.palette.mode === 'dark';
  return {
    text:  dark ? '#E2E8F0' : '#1E293B',
    muted: dark ? '#94A3B8' : '#64748B',
    grid:  dark ? 'rgba(148,163,184,0.12)' : 'rgba(0,0,0,0.07)',
  };
}
function baseOpts(c) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: c.text, font: { size: 12 }, boxWidth: 14 } },
      tooltip: { titleColor: c.text, bodyColor: c.muted },
    },
  };
}

// ─── Shared table component ───────────────────────────────────────────────
function ReportTable({ data, columns }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.key} sx={{ fontWeight: 600 }}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} hover>
              {columns.map(col => (
                <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Card header with optional PDF link ──────────────────────────────────
function SectionHeader({ title, pdfDoc, pdfName }) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6" fontWeight={600}>{title}</Typography>
      {pdfDoc && (
        <PDFDownloadLink document={pdfDoc} fileName={`${pdfName}.pdf`}>
          {({ loading: l }) => (
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} disabled={l}>
              {l ? 'Generando…' : 'PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  PDF STYLES
// ═══════════════════════════════════════════════════════════════════════════
const PS = StyleSheet.create({
  page:         { fontFamily: 'Helvetica', fontSize: 10, padding: 36, color: '#1E293B' },
  header:       { borderBottom: '2 solid #34D399', marginBottom: 16, paddingBottom: 10 },
  hTitle:       { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  hSub:         { fontSize: 10, color: '#475569', marginBottom: 2 },
  hMeta:        { fontSize: 8,  color: '#94A3B8' },
  secTitle:     { fontSize: 12, fontWeight: 'bold', color: '#2e7d32', marginTop: 16, marginBottom: 8 },
  tHead:        { flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottom: '1.5 solid #CBD5E1', paddingVertical: 5, paddingHorizontal: 4 },
  tRow:         { flexDirection: 'row', borderBottom: '0.5 solid #E2E8F0', paddingVertical: 4, paddingHorizontal: 4 },
  tRowAlt:      { flexDirection: 'row', borderBottom: '0.5 solid #E2E8F0', paddingVertical: 4, paddingHorizontal: 4, backgroundColor: '#F8FAFC' },
  thCell:       { fontWeight: 'bold', color: '#475569', fontSize: 9 },
  tdCell:       { color: '#1E293B', fontSize: 10 },
  barBg:        { backgroundColor: '#E2E8F0', height: 6, borderRadius: 3, marginTop: 2 },
  barFill:      { height: 6, borderRadius: 3 },
  kpiRow:       { flexDirection: 'row', gap: 8, marginBottom: 16 },
  kpiBox:       { flex: 1, backgroundColor: '#F8FAFC', border: '1 solid #E2E8F0', borderRadius: 6, padding: 8, alignItems: 'center' },
  kpiVal:       { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  kpiLabel:     { fontSize: 8, color: '#64748B', textAlign: 'center' },
  summaryBox:   { backgroundColor: '#F8FAFC', border: '1 solid #E2E8F0', borderRadius: 6, padding: 10, marginTop: 10 },
  sumRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sumLabel:     { fontWeight: 'bold', color: '#475569', fontSize: 10 },
  sumValue:     { color: '#1E293B', fontWeight: 'bold', fontSize: 10 },
  footer:       { position: 'absolute', bottom: 24, left: 36, right: 36, textAlign: 'center', fontSize: 8, color: '#94A3B8', borderTop: '0.5 solid #E2E8F0', paddingTop: 6 },
});

function PdfHeader({ title, subtitle }) {
  const dateStr = new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  return (
    <View style={PS.header}>
      <Text style={PS.hTitle}>{title}</Text>
      {subtitle && <Text style={PS.hSub}>{subtitle}</Text>}
      <Text style={PS.hMeta}>PeoplePortal · Generado el {dateStr} a las {timeStr}</Text>
    </View>
  );
}
function PdfFooter() {
  return <Text style={PS.footer}>PeoplePortal — Sistema de Gestión de RRHH · Documento confidencial</Text>;
}
function PdfBar({ value, max, color = '#34D399' }) {
  const w = max > 0 ? `${Math.round((value / max) * 100)}%` : '0%';
  return (
    <View style={PS.barBg}>
      <View style={{ ...PS.barFill, width: w, backgroundColor: color }} />
    </View>
  );
}

// ─── RequestsByStatus PDF ─────────────────────────────────────────────────
function RequestsByStatusPDF({ data }) {
  const total = data.reduce((s, r) => s + r.count, 0);
  const barC  = { Submitted: '#60A5FA', InReview: '#F59E0B', Approved: '#34D399', Rejected: '#F87171', Cancelled: '#94A3B8' };
  const approved = data.find(r => r.status === 'Approved')?.count ?? 0;
  const rejected = data.find(r => r.status === 'Rejected')?.count ?? 0;
  const pending  = (data.find(r => r.status === 'Submitted')?.count ?? 0) + (data.find(r => r.status === 'InReview')?.count ?? 0);
  return (
    <Document>
      <Page size="A4" style={PS.page}>
        <PdfHeader title="Solicitudes por Estado" subtitle="Distribución completa del estado actual de todas las solicitudes registradas" />
        <Text style={PS.secTitle}>Detalle por Estado</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Estado</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Cantidad</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>% del Total</Text>
          <Text style={{ ...PS.thCell, flex: 3 }}>Distribución visual</Text>
        </View>
        {data.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
            <Text style={{ ...PS.tdCell, flex: 2 }}>{statusLabels[row.status] ?? row.status}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{row.count}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: '#64748B' }}>
              {total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0'}%
            </Text>
            <View style={{ flex: 3, justifyContent: 'center', paddingRight: 4 }}>
              <PdfBar value={row.count} max={total} color={barC[row.status] ?? '#94A3B8'} />
            </View>
          </View>
        ))}
        <View style={PS.summaryBox}>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Total de solicitudes:</Text><Text style={PS.sumValue}>{total}</Text></View>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Tasa de aprobación:</Text><Text style={{ ...PS.sumValue, color: '#34D399' }}>{total > 0 ? ((approved / total) * 100).toFixed(1) : 0}%</Text></View>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Tasa de rechazo:</Text><Text style={{ ...PS.sumValue, color: '#F87171' }}>{total > 0 ? ((rejected / total) * 100).toFixed(1) : 0}%</Text></View>
          <View style={{ ...PS.sumRow, marginBottom: 0 }}><Text style={PS.sumLabel}>Pendientes de resolución (Enviado + En Revisión):</Text><Text style={{ ...PS.sumValue, color: '#F59E0B' }}>{pending}</Text></View>
        </View>
        <PdfFooter />
      </Page>
    </Document>
  );
}

// ─── RequestsByType PDF ───────────────────────────────────────────────────
function RequestsByTypePDF({ data }) {
  const total  = data.reduce((s, r) => s + r.count, 0);
  const sorted = [...data].sort((a, b) => b.count - a.count);
  return (
    <Document>
      <Page size="A4" style={PS.page}>
        <PdfHeader title="Solicitudes por Tipo" subtitle="Desglose del volumen de solicitudes por categoría o propósito" />
        <Text style={PS.secTitle}>Detalle por Tipo de Solicitud</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Tipo de Solicitud</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Cantidad</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>% del Total</Text>
          <Text style={{ ...PS.thCell, flex: 3 }}>Distribución visual</Text>
        </View>
        {sorted.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
            <Text style={{ ...PS.tdCell, flex: 2 }}>{typeLabels[row.type] ?? row.type}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{row.count}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: '#64748B' }}>{total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0'}%</Text>
            <View style={{ flex: 3, justifyContent: 'center', paddingRight: 4 }}>
              <PdfBar value={row.count} max={sorted[0]?.count ?? 1} color={TYPE_COLORS[i % TYPE_COLORS.length]} />
            </View>
          </View>
        ))}
        <View style={PS.summaryBox}>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Total:</Text><Text style={PS.sumValue}>{total}</Text></View>
          <View style={{ ...PS.sumRow, marginBottom: 0 }}><Text style={PS.sumLabel}>Tipo más frecuente:</Text><Text style={PS.sumValue}>{typeLabels[sorted[0]?.type] ?? sorted[0]?.type ?? '—'} ({sorted[0]?.count ?? 0})</Text></View>
        </View>
        <PdfFooter />
      </Page>
    </Document>
  );
}

// ─── RequestsOverTime PDF ─────────────────────────────────────────────────
function RequestsOverTimePDF({ data }) {
  const total   = data.reduce((s, r) => s + r.count, 0);
  const maxVal  = Math.max(...data.map(r => r.count), 1);
  const avg     = data.length > 0 ? total / data.length : 0;
  const peak    = data.reduce((a, b) => a.count > b.count ? a : b, { count: 0, period: '—' });
  return (
    <Document>
      <Page size="A4" style={PS.page}>
        <PdfHeader title="Evolución Mensual de Solicitudes" subtitle="Análisis de la tendencia en el volumen de solicitudes a lo largo del tiempo" />
        <Text style={PS.secTitle}>Detalle por Período</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Período</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Solicitudes</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>vs Promedio</Text>
          <Text style={{ ...PS.thCell, flex: 3 }}>Volumen relativo</Text>
        </View>
        {data.map((row, i) => {
          const diff     = row.count - avg;
          const diffStr  = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
          const diffColor = diff > 0 ? '#34D399' : diff < 0 ? '#F87171' : '#94A3B8';
          return (
            <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
              <Text style={{ ...PS.tdCell, flex: 2 }}>{row.period}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{row.count}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: diffColor }}>{diffStr}</Text>
              <View style={{ flex: 3, justifyContent: 'center', paddingRight: 4 }}>
                <PdfBar value={row.count} max={maxVal} color={TIME_COLOR} />
              </View>
            </View>
          );
        })}
        <View style={PS.summaryBox}>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Total acumulado:</Text><Text style={PS.sumValue}>{total}</Text></View>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Promedio mensual:</Text><Text style={PS.sumValue}>{avg.toFixed(1)}</Text></View>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Período pico:</Text><Text style={PS.sumValue}>{peak.period} ({peak.count} solicitudes)</Text></View>
          <View style={{ ...PS.sumRow, marginBottom: 0 }}><Text style={PS.sumLabel}>Períodos analizados:</Text><Text style={PS.sumValue}>{data.length}</Text></View>
        </View>
        <PdfFooter />
      </Page>
    </Document>
  );
}

// ─── ActiveEmployees PDF ──────────────────────────────────────────────────
function ActiveEmployeesPDF({ data }) {
  const cats = [
    { key: 'active',     label: 'Activos',      color: '#34D399' },
    { key: 'onLeave',    label: 'En Licencia',   color: '#F59E0B' },
    { key: 'inactive',   label: 'Inactivos',     color: '#94A3B8' },
    { key: 'terminated', label: 'Terminados',    color: '#F87171' },
  ];
  const disponibles = (data.active ?? 0);
  const noDisp      = (data.onLeave ?? 0) + (data.inactive ?? 0);
  return (
    <Document>
      <Page size="A4" style={PS.page}>
        <PdfHeader title="Estado de la Plantilla de Empleados" subtitle="Distribución actual de todos los empleados según su estado laboral" />
        <Text style={PS.secTitle}>Distribución por Estado Laboral</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Estado</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Cantidad</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>% del Total</Text>
          <Text style={{ ...PS.thCell, flex: 3 }}>Distribución visual</Text>
        </View>
        {cats.map((cat, i) => {
          const count = data[cat.key] ?? 0;
          const pct   = data.total > 0 ? ((count / data.total) * 100).toFixed(1) : '0.0';
          return (
            <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
              <Text style={{ ...PS.tdCell, flex: 2 }}>{cat.label}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{count}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: '#64748B' }}>{pct}%</Text>
              <View style={{ flex: 3, justifyContent: 'center', paddingRight: 4 }}>
                <PdfBar value={count} max={data.total} color={cat.color} />
              </View>
            </View>
          );
        })}
        <View style={PS.summaryBox}>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Total de empleados:</Text><Text style={PS.sumValue}>{data.total}</Text></View>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Tasa de actividad:</Text><Text style={{ ...PS.sumValue, color: '#34D399' }}>{data.total > 0 ? ((disponibles / data.total) * 100).toFixed(1) : 0}%</Text></View>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>No disponibles (licencia + inactivos):</Text><Text style={{ ...PS.sumValue, color: '#F59E0B' }}>{noDisp}</Text></View>
          <View style={{ ...PS.sumRow, marginBottom: 0 }}><Text style={PS.sumLabel}>Terminados / fuera de la empresa:</Text><Text style={{ ...PS.sumValue, color: '#F87171' }}>{data.terminated ?? 0}</Text></View>
        </View>
        <PdfFooter />
      </Page>
    </Document>
  );
}

// ─── PendingDocuments PDF ─────────────────────────────────────────────────
function PendingDocumentsPDF({ data }) {
  const sorted       = [...data].sort((a, b) => (b.pendingCount + b.expiredCount) - (a.pendingCount + a.expiredCount));
  const totalPending = data.reduce((s, r) => s + r.pendingCount, 0);
  const totalExpired = data.reduce((s, r) => s + r.expiredCount, 0);
  const empWithIssues = data.filter(r => r.pendingCount > 0 || r.expiredCount > 0).length;
  return (
    <Document>
      <Page size="A4" style={PS.page}>
        <PdfHeader title="Documentos Pendientes por Empleado" subtitle="Empleados con documentos en estado Pendiente o Vencido que requieren atención inmediata" />
        <View style={PS.summaryBox}>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Empleados con documentos pendientes/vencidos:</Text><Text style={PS.sumValue}>{empWithIssues} de {data.length}</Text></View>
          <View style={PS.sumRow}><Text style={PS.sumLabel}>Total documentos pendientes:</Text><Text style={{ ...PS.sumValue, color: '#F59E0B' }}>{totalPending}</Text></View>
          <View style={{ ...PS.sumRow, marginBottom: 0 }}><Text style={PS.sumLabel}>Total documentos vencidos (acción urgente):</Text><Text style={{ ...PS.sumValue, color: '#F87171' }}>{totalExpired}</Text></View>
        </View>
        <Text style={PS.secTitle}>Detalle por Empleado (ordenado por mayor pendiente)</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 3 }}>Empleado</Text>
          <Text style={{ ...PS.thCell, flex: 2 }}>Departamento</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Pendientes</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Vencidos</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Total</Text>
        </View>
        {sorted.map((row, i) => {
          const total = row.pendingCount + row.expiredCount;
          return (
            <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
              <Text style={{ ...PS.tdCell, flex: 3 }}>{row.employeeName}</Text>
              <Text style={{ ...PS.tdCell, flex: 2, color: '#64748B' }}>{row.department || '—'}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: row.pendingCount > 0 ? '#F59E0B' : '#94A3B8' }}>{row.pendingCount}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: row.expiredCount > 0 ? '#F87171' : '#94A3B8', fontWeight: row.expiredCount > 0 ? 'bold' : 'normal' }}>{row.expiredCount}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{total}</Text>
            </View>
          );
        })}
        <PdfFooter />
      </Page>
    </Document>
  );
}

// ─── Consolidated PDF (2 pages) ───────────────────────────────────────────
function ConsolidatedPDF({ statusData, typeData, overTimeData, employeesData, pendingDocsData }) {
  const totalReqs    = statusData.reduce((s, r) => s + r.count, 0);
  const totalPending = pendingDocsData.reduce((s, r) => s + r.pendingCount, 0);
  const totalExpired = pendingDocsData.reduce((s, r) => s + r.expiredCount, 0);
  const maxTime      = Math.max(...overTimeData.map(r => r.count), 1);
  const empCats      = [
    { key: 'active', label: 'Activos', color: '#34D399' },
    { key: 'onLeave', label: 'En Licencia', color: '#F59E0B' },
    { key: 'inactive', label: 'Inactivos', color: '#94A3B8' },
    { key: 'terminated', label: 'Terminados', color: '#F87171' },
  ];
  return (
    <Document>
      {/* ── Page 1 ── */}
      <Page size="A4" style={PS.page}>
        <PdfHeader title="Reporte General — PeoplePortal" subtitle="Consolidado de todos los indicadores del sistema de Recursos Humanos" />

        {/* KPI cards */}
        <View style={PS.kpiRow}>
          {[
            { label: 'Total Solicitudes', value: totalReqs,              color: '#60A5FA' },
            { label: 'Total Empleados',   value: employeesData?.total ?? 0, color: '#34D399' },
            { label: 'Docs Pendientes',   value: totalPending,           color: '#F59E0B' },
            { label: 'Docs Vencidos',     value: totalExpired,           color: '#F87171' },
          ].map((k, i) => (
            <View key={i} style={PS.kpiBox}>
              <Text style={{ ...PS.kpiVal, color: k.color }}>{k.value}</Text>
              <Text style={PS.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>

        {/* Section 1: Employees */}
        <Text style={PS.secTitle}>1. Estado de la Plantilla</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Estado</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Cant.</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>%</Text>
          <Text style={{ ...PS.thCell, flex: 3 }}>Distribución</Text>
        </View>
        {empCats.map((cat, i) => {
          const count = employeesData?.[cat.key] ?? 0;
          const pct   = employeesData?.total > 0 ? ((count / employeesData.total) * 100).toFixed(1) : '0.0';
          return (
            <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
              <Text style={{ ...PS.tdCell, flex: 2 }}>{cat.label}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{count}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: '#64748B' }}>{pct}%</Text>
              <View style={{ flex: 3, justifyContent: 'center', paddingRight: 4 }}>
                <PdfBar value={count} max={employeesData?.total ?? 1} color={cat.color} />
              </View>
            </View>
          );
        })}

        {/* Section 2: By Status */}
        <Text style={PS.secTitle}>2. Solicitudes por Estado</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Estado</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Cant.</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>%</Text>
          <Text style={{ ...PS.thCell, flex: 3 }}>Distribución</Text>
        </View>
        {statusData.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
            <Text style={{ ...PS.tdCell, flex: 2 }}>{statusLabels[row.status] ?? row.status}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{row.count}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: '#64748B' }}>{totalReqs > 0 ? ((row.count / totalReqs) * 100).toFixed(1) : '0.0'}%</Text>
            <View style={{ flex: 3, justifyContent: 'center', paddingRight: 4 }}>
              <PdfBar value={row.count} max={totalReqs} color={STATUS_COLORS[row.status] ?? '#94A3B8'} />
            </View>
          </View>
        ))}

        {/* Section 3: By Type */}
        <Text style={PS.secTitle}>3. Solicitudes por Tipo</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Tipo</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Cant.</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>%</Text>
          <Text style={{ ...PS.thCell, flex: 3 }}>Distribución</Text>
        </View>
        {[...typeData].sort((a, b) => b.count - a.count).map((row, i) => (
          <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
            <Text style={{ ...PS.tdCell, flex: 2 }}>{typeLabels[row.type] ?? row.type}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{row.count}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: '#64748B' }}>{totalReqs > 0 ? ((row.count / totalReqs) * 100).toFixed(1) : '0.0'}%</Text>
            <View style={{ flex: 3, justifyContent: 'center', paddingRight: 4 }}>
              <PdfBar value={row.count} max={totalReqs} color={TYPE_COLORS[i % TYPE_COLORS.length]} />
            </View>
          </View>
        ))}

        <PdfFooter />
      </Page>

      {/* ── Page 2 ── */}
      <Page size="A4" style={PS.page}>
        <PdfHeader title="Reporte General — PeoplePortal (continuación)" />

        {/* Section 4: Over time */}
        <Text style={PS.secTitle}>4. Evolución Mensual de Solicitudes</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 2 }}>Período</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Cantidad</Text>
          <Text style={{ ...PS.thCell, flex: 4 }}>Volumen</Text>
        </View>
        {overTimeData.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
            <Text style={{ ...PS.tdCell, flex: 2 }}>{row.period}</Text>
            <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{row.count}</Text>
            <View style={{ flex: 4, justifyContent: 'center', paddingRight: 4 }}>
              <PdfBar value={row.count} max={maxTime} color={TIME_COLOR} />
            </View>
          </View>
        ))}

        {/* Section 5: Pending docs */}
        <Text style={PS.secTitle}>5. Documentos Pendientes por Empleado</Text>
        <View style={PS.tHead}>
          <Text style={{ ...PS.thCell, flex: 3 }}>Empleado</Text>
          <Text style={{ ...PS.thCell, flex: 2 }}>Departamento</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Pendientes</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Vencidos</Text>
          <Text style={{ ...PS.thCell, flex: 1, textAlign: 'right' }}>Total</Text>
        </View>
        {[...pendingDocsData]
          .sort((a, b) => (b.pendingCount + b.expiredCount) - (a.pendingCount + a.expiredCount))
          .map((row, i) => (
            <View key={i} style={i % 2 === 0 ? PS.tRow : PS.tRowAlt}>
              <Text style={{ ...PS.tdCell, flex: 3 }}>{row.employeeName}</Text>
              <Text style={{ ...PS.tdCell, flex: 2, color: '#64748B' }}>{row.department || '—'}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: row.pendingCount > 0 ? '#F59E0B' : '#94A3B8' }}>{row.pendingCount}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', color: row.expiredCount > 0 ? '#F87171' : '#94A3B8', fontWeight: row.expiredCount > 0 ? 'bold' : 'normal' }}>{row.expiredCount}</Text>
              <Text style={{ ...PS.tdCell, flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{row.pendingCount + row.expiredCount}</Text>
            </View>
          ))}

        <PdfFooter />
      </Page>
    </Document>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN REPORTS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function Reports() {
  const c = useChartTheme();
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [statusData, setStatusData]       = useState([]);
  const [typeData, setTypeData]           = useState([]);
  const [overTimeData, setOverTimeData]   = useState([]);
  const [employeesData, setEmployeesData] = useState(null);
  const [pendingDocsData, setPendingDocsData] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, tRes, oRes, eRes, dRes] = await Promise.all([
        getRequestsByStatus(), getRequestsByType(), getRequestsOverTime(),
        getActiveEmployees(), getPendingDocuments(),
      ]);
      setStatusData(Array.isArray(sRes.data) ? sRes.data : []);
      setTypeData(Array.isArray(tRes.data) ? tRes.data : []);
      setOverTimeData(Array.isArray(oRes.data) ? oRes.data : []);
      setEmployeesData(eRes.data || null);
      setPendingDocsData(Array.isArray(dRes.data) ? dRes.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error)   return <Box><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Box>;

  // ── Chart datasets ──────────────────────────────────────────────────────
  const statusChart = {
    labels:   statusData.map(r => statusLabels[r.status] ?? r.status),
    datasets: [{ data: statusData.map(r => r.count), backgroundColor: statusData.map(r => STATUS_COLORS[r.status] ?? '#94A3B8'), borderWidth: 0, hoverOffset: 6 }],
  };
  const typeChart = {
    labels:   typeData.map(r => typeLabels[r.type] ?? r.type),
    datasets: [{ label: 'Solicitudes', data: typeData.map(r => r.count), backgroundColor: TYPE_COLORS, borderRadius: 6, borderWidth: 0 }],
  };
  const timeChart = {
    labels:   overTimeData.map(r => r.period),
    datasets: [{
      label: 'Solicitudes',
      data:  overTimeData.map(r => r.count),
      borderColor: TIME_COLOR,
      backgroundColor: `${TIME_COLOR}22`,
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: TIME_COLOR,
    }],
  };
  const empEntries = employeesData ? [
    ['Activos',      employeesData.active,     EMP_COLORS.active],
    ['En Licencia',  employeesData.onLeave,    EMP_COLORS.onLeave],
    ['Inactivos',    employeesData.inactive,   EMP_COLORS.inactive],
    ['Terminados',   employeesData.terminated, EMP_COLORS.terminated],
  ] : [];
  const empChart = {
    labels:   empEntries.map(e => e[0]),
    datasets: [{ data: empEntries.map(e => e[1]), backgroundColor: empEntries.map(e => e[2]), borderWidth: 0, hoverOffset: 6 }],
  };
  const pendingChart = {
    labels: pendingDocsData.slice(0, 8).map(r => r.employeeName?.split(' ')[0] ?? ''),
    datasets: [
      { label: 'Pendientes', data: pendingDocsData.slice(0, 8).map(r => r.pendingCount), backgroundColor: '#F59E0B', borderRadius: 4, borderWidth: 0 },
      { label: 'Vencidos',   data: pendingDocsData.slice(0, 8).map(r => r.expiredCount), backgroundColor: '#F87171', borderRadius: 4, borderWidth: 0 },
    ],
  };

  // ── Shared Chart.js options ─────────────────────────────────────────────
  const doughnutOpts = {
    ...baseOpts(c), cutout: '65%',
    plugins: { ...baseOpts(c).plugins, legend: { ...baseOpts(c).plugins.legend, position: 'right' } },
  };
  const barOpts = {
    ...baseOpts(c),
    plugins: { ...baseOpts(c).plugins, legend: { display: false } },
    scales: {
      x: { ticks: { color: c.muted }, grid: { color: c.grid } },
      y: { ticks: { color: c.muted }, grid: { color: c.grid }, beginAtZero: true },
    },
  };
  const hBarOpts = { ...barOpts, indexAxis: 'y' };
  const lineOpts = {
    ...baseOpts(c),
    plugins: { ...baseOpts(c).plugins, legend: { display: false } },
    scales: {
      x: { ticks: { color: c.muted, maxRotation: 45 }, grid: { color: c.grid } },
      y: { ticks: { color: c.muted }, grid: { color: c.grid }, beginAtZero: true },
    },
  };
  const pendingBarOpts = {
    ...barOpts,
    plugins: { ...baseOpts(c).plugins, legend: { labels: { color: c.text, font: { size: 11 }, boxWidth: 12 } } },
  };

  const allReady = statusData.length > 0 && typeData.length > 0 && overTimeData.length > 0 && employeesData;

  return (
    <Box>
      {/* ── Page header ────────────────────────────────────────────────── */}
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
          <AssessmentIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Reportes</Typography>
        </Box>
        {allReady && (
          <PDFDownloadLink
            document={<ConsolidatedPDF statusData={statusData} typeData={typeData} overTimeData={overTimeData} employeesData={employeesData} pendingDocsData={pendingDocsData} />}
            fileName="reporte-general-peopleportal.pdf"
          >
            {({ loading: l }) => (
              <Button variant="contained" startIcon={<DownloadIcon />} disabled={l} size="large">
                {l ? 'Generando…' : 'Descargar Reporte General PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </Box>

      <Grid container spacing={3}>

        {/* ── 1. Solicitudes por Estado ─────────────────────────────── */}
        <Grid size={{ md: 6, xs: 12 }}>
          <Card>
            <CardContent>
              <SectionHeader title="Solicitudes por Estado"
                pdfDoc={statusData.length > 0 ? <RequestsByStatusPDF data={statusData} /> : null}
                pdfName="solicitudes-por-estado" />
              <Box sx={{ height: 220 }}>
                {statusData.length > 0
                  ? <Doughnut data={statusChart} options={doughnutOpts} />
                  : <Typography color="text.secondary">Sin datos</Typography>}
              </Box>
              <Divider sx={{ my: 2 }} />
              <ReportTable
                data={statusData}
                columns={[
                  { key: 'status',  label: 'Estado',     render: r => statusLabels[r.status] ?? r.status },
                  { key: 'count',   label: 'Cantidad' },
                  { key: 'pct',     label: '% del total', render: r => {
                    const t = statusData.reduce((s, x) => s + x.count, 0);
                    return <Typography variant="caption" fontWeight={600}>{t > 0 ? `${((r.count / t) * 100).toFixed(1)}%` : '0%'}</Typography>;
                  }},
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ── 2. Solicitudes por Tipo ───────────────────────────────── */}
        <Grid size={{ md: 6, xs: 12 }}>
          <Card>
            <CardContent>
              <SectionHeader title="Solicitudes por Tipo"
                pdfDoc={typeData.length > 0 ? <RequestsByTypePDF data={typeData} /> : null}
                pdfName="solicitudes-por-tipo" />
              <Box sx={{ height: 220 }}>
                {typeData.length > 0
                  ? <Bar data={typeChart} options={hBarOpts} />
                  : <Typography color="text.secondary">Sin datos</Typography>}
              </Box>
              <Divider sx={{ my: 2 }} />
              <ReportTable
                data={[...typeData].sort((a, b) => b.count - a.count)}
                columns={[
                  { key: 'type',  label: 'Tipo',        render: r => typeLabels[r.type] ?? r.type },
                  { key: 'count', label: 'Cantidad' },
                  { key: 'pct',   label: '% del total',  render: r => {
                    const t = typeData.reduce((s, x) => s + x.count, 0);
                    return <Typography variant="caption" fontWeight={600}>{t > 0 ? `${((r.count / t) * 100).toFixed(1)}%` : '0%'}</Typography>;
                  }},
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ── 3. Tendencia en el tiempo ─────────────────────────────── */}
        <Grid size={{ md: 8, xs: 12 }}>
          <Card>
            <CardContent>
              <SectionHeader title="Tendencia de Solicitudes en el Tiempo"
                pdfDoc={overTimeData.length > 0 ? <RequestsOverTimePDF data={overTimeData} /> : null}
                pdfName="solicitudes-tendencia" />
              <Box sx={{ height: 220 }}>
                {overTimeData.length > 0
                  ? <Line data={timeChart} options={lineOpts} />
                  : <Typography color="text.secondary">Sin datos</Typography>}
              </Box>
              <Divider sx={{ my: 2 }} />
              <ReportTable
                data={overTimeData}
                columns={[
                  { key: 'period', label: 'Período' },
                  { key: 'count',  label: 'Solicitudes' },
                  { key: 'diff',   label: 'vs Promedio', render: r => {
                    const avg  = overTimeData.reduce((s, x) => s + x.count, 0) / (overTimeData.length || 1);
                    const diff = r.count - avg;
                    return <Typography variant="caption" fontWeight={600} color={diff > 0 ? 'success.main' : diff < 0 ? 'error.main' : 'text.secondary'}>{diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}</Typography>;
                  }},
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ── 4. Estado de Empleados ────────────────────────────────── */}
        <Grid size={{ md: 4, xs: 12 }}>
          <Card>
            <CardContent>
              <SectionHeader title="Estado de Empleados"
                pdfDoc={employeesData ? <ActiveEmployeesPDF data={employeesData} /> : null}
                pdfName="empleados-estado" />
              {employeesData ? (
                <>
                  <Box sx={{ height: 190 }}>
                    <Doughnut data={empChart} options={{ ...doughnutOpts, plugins: { ...doughnutOpts.plugins, legend: { ...doughnutOpts.plugins.legend, position: 'bottom' } } }} />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  {empEntries.map(([label, val, color]) => (
                    <Box key={label} sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                        <Box sx={{ bgcolor: color, borderRadius: '50%', flexShrink: 0, height: 10, width: 10 }} />
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                      </Box>
                      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700}>{val}</Typography>
                        <Typography variant="caption" color="text.disabled">
                          {employeesData.total > 0 ? `${((val / employeesData.total) * 100).toFixed(0)}%` : '0%'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={700}>Total</Typography>
                    <Typography variant="body2" fontWeight={700}>{employeesData.total}</Typography>
                  </Box>
                </>
              ) : <Typography color="text.secondary">Sin datos</Typography>}
            </CardContent>
          </Card>
        </Grid>

        {/* ── 5. Documentos Pendientes ──────────────────────────────── */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <SectionHeader title="Documentos Pendientes por Empleado"
                pdfDoc={pendingDocsData.length > 0 ? <PendingDocumentsPDF data={pendingDocsData} /> : null}
                pdfName="documentos-pendientes" />
              {pendingDocsData.length > 0 ? (
                <>
                  <Box sx={{ height: 240, mb: 2 }}>
                    <Bar data={pendingChart} options={pendingBarOpts} />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              ) : null}
              <ReportTable
                data={[...pendingDocsData].sort((a, b) => (b.pendingCount + b.expiredCount) - (a.pendingCount + a.expiredCount))}
                columns={[
                  { key: 'employeeName', label: 'Empleado' },
                  { key: 'department',   label: 'Departamento', render: r => r.department || '—' },
                  { key: 'pendingCount', label: 'Pendientes',   render: r => <Chip label={r.pendingCount} size="small" color={r.pendingCount > 0 ? 'warning' : 'default'} /> },
                  { key: 'expiredCount', label: 'Vencidos',     render: r => <Chip label={r.expiredCount} size="small" color={r.expiredCount > 0 ? 'error'   : 'default'} /> },
                  { key: 'total',        label: 'Total',        render: r => <Typography fontWeight={700} variant="body2">{r.pendingCount + r.expiredCount}</Typography> },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
