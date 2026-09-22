import { downloadPdf } from './pdfService';

export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

export async function sharePdf(blob: Blob, fileName: string, title: string, text: string): Promise<ShareResult> {
  const file = new File([blob], fileName, { type: 'application/pdf' });
  const data = { files: [file], title, text };
  if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }
  downloadPdf(blob, fileName);
  return 'downloaded';
}
