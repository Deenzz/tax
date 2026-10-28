import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentYear, TaxpayerProfile, YearTaxData } from '../types/tax';
import { calculateTax, formatMYR, RELIEFS_CATALOG } from './taxEngine';

export function exportBorangBEPDF(
  year: AssessmentYear,
  yearData: YearTaxData,
  profile: TaxpayerProfile
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const calc = calculateTax(year, yearData, profile.maritalStatus === 'MARRIED_COMBINED');

  // --- BRAND COLORS ---
  const PRIMARY_BLUE: [number, number, number] = [30, 58, 138]; // LHDN Blue
  const SLATE_DARK: [number, number, number] = [15, 23, 42];
  const GOLD_ACCENT: [number, number, number] = [217, 119, 6];

  // 1. TOP HEADER BANNER
  doc.setFillColor(...PRIMARY_BLUE);
  doc.rect(0, 0, 210, 28, 'F');

  // Gold accent line
  doc.setFillColor(...GOLD_ACCENT);
  doc.rect(0, 28, 210, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LEMBAGA HASIL DALAM NEGERI MALAYSIA', 14, 12);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`PENYATA PENGIRAAN CUKAI PENDAPATAN INDIVIDU (BORANG BE) - YA ${year}`, 14, 19);
  doc.setFontSize(8);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-MY')} ${new Date().toLocaleTimeString('en-MY')} | Personal Tax Vault Archive`, 14, 25);

  // 2. TAXPAYER DETAILS BOX
  doc.setTextColor(...SLATE_DARK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('MAKLUMAT PEMBAYAR CUKAI (TAXPAYER PARTICULARS)', 14, 37);

  const taxpayerData = [
    [
      `Nama Penuh: ${profile.name || 'DR HAFIZUDDIN MUHD'}`,
      `No. Cukai Pendapatan (File No): ${profile.taxFileNo || 'SG 28941029010'}`,
    ],
    [
      `No. Kad Pengenalan / Pasport: ${profile.icNumber || '901024-03-5123'}`,
      `Taraf Mastautin: ${profile.residentStatus === 'RESIDENT' ? 'Warganegara / Pemastautin (Resident)' : 'Bukan Pemastautin'}`,
    ],
    [
      `Taraf Perkahwinan: ${profile.maritalStatus.replace('_', ' ')}`,
      `Bilangan Anak: ${profile.numberOfChildren || 0} orang`,
    ],
  ];

  autoTable(doc, {
    startY: 40,
    body: taxpayerData,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 80 },
    },
  });

  // 3. SECTION 1: BORANG BE COMPUTATION BREAKDOWN
  let currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : 60;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_BLUE);
  doc.text('1. PENGIRAAN PENDAPATAN BERCUKAI & CUKAI KENA DIBAYAR (BAHAGIAN B)', 14, currentY);

  const computationRows: (string | number)[][] = [
    ['B1', 'Pendapatan Berkanun Penggajian (Statutory Employment Income)', formatMYR(calc.statutoryEmployment)],
    ['B2/B3', 'Pendapatan Sewa, Royalti, Faedah, Pencen (Rents, Royalties, Pensions)', formatMYR(calc.statutoryRentsAndOther)],
    ['B4', 'JUMLAH PENDAPATAN AGREGAT (AGGREGATE INCOME)', formatMYR(calc.aggregateIncome)],
    ['B5', 'Tolak: Derma / Hadiah / Sumbangan Diluluskan Seksyen 44(6) (Had 10%)', `- ${formatMYR(calc.allowableDonations)}`],
    ['B6', 'JUMLAH PENDAPATAN (TOTAL INCOME) [B4 - B5]', formatMYR(calc.totalIncome)],
    ['B9', 'Tolak: Jumlah Pelepasan Cukai (Bahagian F - Pelepasan Cukai Dibenarkan)', `- ${formatMYR(calc.totalReliefsClaimed)}`],
    ['B10', 'PENDAPATAN BERCUKAI (CHARGEABLE INCOME) [B6 - B9]', formatMYR(calc.chargeableIncome)],
    ['B11', 'Cukai Ke Atas Pendapatan Bercukai (Berdasarkan Jadual Cukai Berperingkat)', formatMYR(calc.grossTax)],
    ['Rebat', `Rebat Cukai Seksyen 6A (Diri: RM${calc.taxRebateIndividual} | Pasangan: RM${calc.taxRebateSpouse} | Zakat: RM${calc.taxRebateZakat})`, `- ${formatMYR(calc.totalRebates)}`],
    ['B12', 'JUMLAH CUKAI DIKENAKAN (TOTAL TAX CHARGED)', formatMYR(calc.netTaxCharged)],
    ['B18', 'Tolak: Potongan Cukai Berjadual / Bulanan (PCB) Telah Dibayar', `- ${formatMYR(calc.pcbPaid)}`],
    [
      'B19',
      calc.isRefund ? 'CUKAI TERLEBIH BAYAR (EXCESS TAX / REFUND FROM LHDN)' : 'BAKI CUKAI KENA DIBAYAR (BALANCE TAX PAYABLE TO LHDN)',
      formatMYR(Math.abs(calc.finalTaxOutcome)),
    ],
  ];

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Kod', 'Keterangan Pengiraan LHDN (Description)', 'Amaun (RM)']],
    body: computationRows,
    theme: 'striped',
    headStyles: { fillColor: PRIMARY_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 125 },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.row.index === 6 || data.row.index === 9 || data.row.index === 11) {
        data.cell.styles.fontStyle = 'bold';
        if (data.row.index === 11) {
          data.cell.styles.fillColor = calc.isRefund ? [240, 253, 244] : [255, 241, 242];
          data.cell.styles.textColor = calc.isRefund ? [22, 101, 52] : [159, 18, 57];
        }
      }
    },
  });

  // 4. SECTION 2: BAHAGIAN F PELEPASAN CUKAI SCHEDULE
  currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 140;

  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_BLUE);
  doc.text('2. SENARAI PELEPASAN CUKAI DITUNTUT (BAHAGIAN F - TAX RELIEFS)', 14, currentY);

  const reliefRows: string[][] = [];
  RELIEFS_CATALOG.forEach((r) => {
    const rawVal = yearData.reliefs[r.id] ?? (r.defaultVal || 0);
    const limit = r.maxLimits[year] ?? 0;
    const allowable = Math.min(rawVal, limit);

    if (allowable > 0 || r.id === 'rel_individual') {
      reliefRows.push([
        r.code,
        r.title,
        `RM ${limit.toLocaleString()}`,
        `RM ${rawVal.toLocaleString()}`,
        `RM ${allowable.toLocaleString()}`,
      ]);
    }
  });

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Kod', 'Kategori Pelepasan Cukai', 'Had Maksimum', 'Resit / Dituntut', 'Dibenarkan']],
    body: reliefRows,
    theme: 'grid',
    headStyles: { fillColor: SLATE_DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 15, fontStyle: 'bold' },
      1: { cellWidth: 85 },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
  });

  // 5. SECTION 3: RECEIPTS VAULT & GOOGLE DRIVE AUDIT TRAIL
  currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 200;

  if (currentY > 220 || yearData.receipts.length > 3) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_BLUE);
  doc.text('3. BUKTI RESIT & PAUTAN GOOGLE DRIVE (AUDIT TRAIL SEKSYEN 82A ITA 1967)', 14, currentY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Nota: Rekod dan resit perbelanjaan wajib disimpan selama 7 tahun bermula dari akhir tahun taksiran berkenaan.',
    14,
    currentY + 4
  );

  const receiptTableData =
    yearData.receipts.length > 0
      ? yearData.receipts.map((rec) => {
          const matchedRelief = RELIEFS_CATALOG.find((r) => r.id === rec.category);
          const categoryLabel = matchedRelief ? `${matchedRelief.code}` : rec.category;
          return [
            rec.date || '-',
            categoryLabel,
            rec.merchant || 'Merchant',
            rec.description || '-',
            `RM ${rec.amount.toFixed(2)}`,
            rec.driveLink ? 'Google Drive Linked (Ready)' : 'Simpanan Setempat (Offline)',
          ];
        })
      : [['-', '-', 'Tiada rekod resit disimpan untuk tahun ini.', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY + 7,
    head: [['Tarikh', 'Kategori', 'Peniaga / Merchant', 'Penerangan Item', 'Jumlah (RM)', 'Status Pautan Audit']],
    body: receiptTableData,
    theme: 'striped',
    headStyles: { fillColor: PRIMARY_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 6.8, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
      2: { cellWidth: 35 },
      3: { cellWidth: 55 },
      4: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 30, halign: 'center' },
    },
  });

  // Verification & Declaration Footer
  const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 250;
  if (finalY < 270) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Dokumen ini dijana secara automatik oleh MyTax Vault Malaysia untuk tujuan rekod peribadi dan pengauditan e-BE.',
      14,
      finalY
    );
  }

  // Save the document
  const fileName = `LHDN_Borang_BE_YA${year}_${profile.name ? profile.name.replace(/\s+/g, '_') : 'Taxpayer'}_Report.pdf`;
  doc.save(fileName);
}
