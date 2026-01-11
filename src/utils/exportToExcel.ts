import * as XLSX from 'xlsx';
import { Transaction, Athlete } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportData {
  transactions: Transaction[];
  athletes: Athlete[];
  currencySymbol: string;
  establishmentName: string;
}

export function exportTransactionsToExcel({
  transactions,
  athletes,
  currencySymbol,
  establishmentName,
}: ExportData) {
  // Map athlete IDs to names
  const athleteMap = new Map(athletes.map(a => [a.id, a]));

  // Prepare data for Excel
  const data = transactions.map(t => {
    const athlete = athleteMap.get(t.athleteId);
    return {
      'Fecha': format(new Date(t.fecha), 'dd/MM/yyyy HH:mm', { locale: es }),
      'Deportista': athlete?.nombre || 'Desconocido',
      'Deporte': athlete?.deporte || '-',
      'Monto': t.monto,
      'Meses Pagados': t.mesesPagados,
      'Método de Pago': t.metodoPago,
      'Referencia': t.referencia || '-',
      'Registrado Por': t.registradoPorNombre,
      'Observaciones': t.observaciones || '-',
    };
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 18 }, // Fecha
    { wch: 25 }, // Deportista
    { wch: 15 }, // Deporte
    { wch: 12 }, // Monto
    { wch: 14 }, // Meses Pagados
    { wch: 18 }, // Método de Pago
    { wch: 15 }, // Referencia
    { wch: 20 }, // Registrado Por
    { wch: 30 }, // Observaciones
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');

  // Generate filename with date
  const dateStr = format(new Date(), 'yyyy-MM-dd', { locale: es });
  const fileName = `${establishmentName.replace(/\s+/g, '_')}_Transacciones_${dateStr}.xlsx`;

  // Download the file
  XLSX.writeFile(wb, fileName);
}

export function exportAthletesToExcel({
  athletes,
  currencySymbol,
  establishmentName,
}: {
  athletes: Athlete[];
  currencySymbol: string;
  establishmentName: string;
}) {
  const data = athletes.map(a => ({
    'Nombre': a.nombre,
    'Deporte': a.deporte,
    'Teléfono': a.telefono,
    'Email': a.email,
    'Monto Mensual': a.montoMensual,
    'Día de Pago': a.diaPago,
    'Estado': a.estadoSistema === 'al-dia' ? 'Al día' : 
              a.estadoSistema === 'por-vencer' ? 'Por vencer' : 'Vencido',
    'Último Pago': a.ultimoPago ? format(new Date(a.ultimoPago), 'dd/MM/yyyy', { locale: es }) : '-',
    'Próximo Pago': format(new Date(a.proximoPago), 'dd/MM/yyyy', { locale: es }),
    'Categoría': a.categoria || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 25 }, // Nombre
    { wch: 15 }, // Deporte
    { wch: 18 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 14 }, // Monto Mensual
    { wch: 12 }, // Día de Pago
    { wch: 12 }, // Estado
    { wch: 12 }, // Último Pago
    { wch: 12 }, // Próximo Pago
    { wch: 15 }, // Categoría
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Deportistas');

  const dateStr = format(new Date(), 'yyyy-MM-dd', { locale: es });
  const fileName = `${establishmentName.replace(/\s+/g, '_')}_Deportistas_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
