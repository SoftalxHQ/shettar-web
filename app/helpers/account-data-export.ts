const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export interface DataExportResult {
  ok: boolean;
  message: string;
}

export async function downloadAccountDataExport(token: string): Promise<DataExportResult> {
  try {
    const response = await fetch(`${API_URL}/api/v1/accounts/data_export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        ok: false,
        message: data.error ?? data.message ?? 'Failed to download your data.',
      };
    }

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const filename = match?.[1] ?? `shettar-data-${Date.now()}.json`;

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);

    return { ok: true, message: 'Your data has been downloaded.' };
  } catch {
    return { ok: false, message: 'Unable to connect to server. Please try again.' };
  }
}
