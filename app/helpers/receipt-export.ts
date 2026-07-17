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

const STYLE_PROPS = [
  'color',
  'backgroundColor',
  'backgroundImage',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopStyle',
  'borderRightStyle',
  'borderBottomStyle',
  'borderLeftStyle',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'boxShadow',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textTransform',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'display',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'alignContent',
  'gap',
  'rowGap',
  'columnGap',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'overflow',
  'opacity',
  'visibility',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'wordBreak',
  'whiteSpace',
] as const;

/** html2canvas chokes on color-mix/oklch and Bootstrap modal transforms — bake safe inline styles onto a detached clone. */
function bakeExportClone(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  const sourceNodes = [source, ...Array.from(source.querySelectorAll<HTMLElement>('*'))];
  const cloneNodes = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];

  sourceNodes.forEach((srcNode, index) => {
    const dest = cloneNodes[index];
    if (!(srcNode instanceof HTMLElement) || !(dest instanceof HTMLElement)) return;

    const computed = window.getComputedStyle(srcNode);
    for (const prop of STYLE_PROPS) {
      const value = computed[prop as keyof CSSStyleDeclaration];
      if (typeof value === 'string' && value) {
        dest.style.setProperty(
          prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
          value
        );
      }
    }

    // Force opaque white card background for clean export
    if (dest.classList.contains('receipt-card')) {
      dest.style.backgroundColor = '#ffffff';
      dest.style.boxShadow = 'none';
    }
    if (dest.classList.contains('ticket-header')) {
      dest.style.backgroundColor = computed.backgroundColor || '#5143d9';
      dest.style.color = '#ffffff';
    }
  });

  // Strip print/action UI and style tags from the clone
  clone.querySelectorAll('.no-print, style').forEach((el) => el.remove());

  return clone;
}

function mountOffscreen(node: HTMLElement): () => void {
  const host = document.createElement('div');
  host.setAttribute('data-receipt-export-host', 'true');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${node.scrollWidth || node.offsetWidth || 480}px`,
    zIndex: '-1',
    pointerEvents: 'none',
    opacity: '1',
    background: '#ffffff',
  });
  host.appendChild(node);
  document.body.appendChild(host);
  return () => host.remove();
}

export async function captureReceiptElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  const clone = bakeExportClone(element);
  const cleanup = mountOffscreen(clone);

  try {
    // Allow layout to settle after mount
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

    return await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      foreignObjectRendering: false,
      width: clone.scrollWidth,
      height: clone.scrollHeight,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });
  } finally {
    cleanup();
  }
}

export async function downloadReceiptPng(element: HTMLElement, reference?: string): Promise<void> {
  const canvas = await captureReceiptElement(element);
  const link = document.createElement('a');
  link.download = `${receiptFileName(reference)}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadReceiptPdf(element: HTMLElement, reference?: string): Promise<void> {
  const canvas = await captureReceiptElement(element);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const renderWidth = canvas.width * ratio;
  const renderHeight = canvas.height * ratio;
  const x = (pageWidth - renderWidth) / 2;
  const y = margin;

  pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
  pdf.save(pdfFileName(reference));
}

export async function shareReceiptPng(
  element: HTMLElement,
  reference?: string
): Promise<'shared' | 'downloaded'> {
  const canvas = await captureReceiptElement(element);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not create receipt image');

  const fileName = `${receiptFileName(reference)}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Shettar Receipt',
      text: 'Shettar transaction receipt',
    });
    return 'shared';
  }

  const link = document.createElement('a');
  link.download = fileName;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  return 'downloaded';
}
