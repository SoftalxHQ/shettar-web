import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function receiptFileName(reference?: string): string {
  const slug = reference?.replace(/[^\w-]/g, '') || 'receipt';
  return `Shettar_Receipt_${slug}`;
}

function pdfFileName(reference?: string): string {
  const slug = reference?.trim().replace(/[^\w.-]/g, '') || 'receipt';
  return `${slug}.pdf`;
}

export async function captureReceiptElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
}

export async function downloadReceiptPng(element: HTMLElement, reference?: string): Promise<void> {
  const canvas = await captureReceiptElement(element);
  const link = document.createElement('a');
  link.download = `${receiptFileName(reference)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function downloadReceiptPdf(element: HTMLElement, reference?: string): Promise<void> {
  const canvas = await captureReceiptElement(element);
  const imgData = canvas.toDataURL('image/png');
  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(pdfFileName(reference));
}

export async function shareReceiptPng(element: HTMLElement, reference?: string): Promise<'shared' | 'downloaded'> {
  const canvas = await captureReceiptElement(element);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not create receipt image');

  const fileName = `${receiptFileName(reference)}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Shettar Receipt',
      text: 'Utility purchase receipt',
    });
    return 'shared';
  }

  const link = document.createElement('a');
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  return 'downloaded';
}
