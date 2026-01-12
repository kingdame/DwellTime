/**
 * Export Service
 * Handles exporting and sharing detention records
 */

import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { File, Paths } from 'expo-file-system/next';
import { type DetentionRecord, formatDuration, formatCurrency, formatDate, formatTime } from './historyService';

/**
 * Check if sharing is available on this device
 */
export async function isSharingAvailable(): Promise<boolean> {
  return await Sharing.isAvailableAsync();
}

/**
 * Generate HTML for a detention record
 */
function generateRecordHtml(record: DetentionRecord): string {
  const eventTypeLabel = record.eventType === 'pickup' ? 'Pickup' : 'Delivery';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DwellTime Detention Record</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }
        .header h1 { font-size: 24px; margin-bottom: 4px; }
        .header .subtitle { opacity: 0.8; font-size: 14px; }
        .content { padding: 24px; }
        .facility {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .facility h2 { font-size: 18px; margin-bottom: 4px; }
        .facility .address { color: #666; font-size: 14px; margin-bottom: 8px; }
        .facility .meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #888;
        }
        .earnings {
          background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
          color: white;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
        }
        .earnings .amount { font-size: 42px; font-weight: bold; }
        .earnings .label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
        .earnings .breakdown { font-size: 13px; opacity: 0.8; margin-top: 8px; }
        .section { margin-bottom: 20px; }
        .section h3 {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
        .section p { margin-bottom: 8px; font-size: 14px; }
        .time-grid {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
        }
        .time-item {
          flex: 1;
          text-align: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .time-item .label { font-size: 11px; text-transform: uppercase; color: #888; }
        .time-item .value { font-size: 15px; font-weight: 600; margin-top: 4px; }
        .time-item .sub { font-size: 13px; color: #666; }
        .duration-grid {
          display: flex;
          gap: 12px;
        }
        .duration-item {
          flex: 1;
          text-align: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .duration-item .label { font-size: 10px; text-transform: uppercase; color: #888; }
        .duration-item .value { font-size: 16px; font-weight: 600; margin-top: 4px; }
        .duration-item.detention .value { color: #f39c12; }
        .verification {
          background: #e8f4fd;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .verification .code {
          font-family: 'Courier New', monospace;
          font-size: 24px;
          font-weight: bold;
          color: #0984e3;
          letter-spacing: 2px;
        }
        .verification .hint {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
        .footer {
          text-align: center;
          padding: 16px;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DwellTime</h1>
          <div class="subtitle">Detention Record</div>
        </div>

        <div class="content">
          <div class="facility">
            <h2>${record.facilityName}</h2>
            ${record.facilityAddress ? `<div class="address">${record.facilityAddress}</div>` : ''}
            <div class="meta">
              <span>${eventTypeLabel}</span>
              ${record.loadReference ? `<span>Load: ${record.loadReference}</span>` : ''}
            </div>
          </div>

          <div class="earnings">
            <div class="label">Detention Earnings</div>
            <div class="amount">${formatCurrency(record.detentionAmount)}</div>
            <div class="breakdown">
              ${formatDuration(record.detentionMinutes)} detention @ $${record.hourlyRate}/hr
            </div>
          </div>

          <div class="section">
            <h3>Time Details</h3>
            <div class="time-grid">
              <div class="time-item">
                <div class="label">Arrival</div>
                <div class="value">${formatDate(record.arrivalTime)}</div>
                <div class="sub">${formatTime(record.arrivalTime)}</div>
              </div>
              ${record.departureTime ? `
                <div class="time-item">
                  <div class="label">Departure</div>
                  <div class="value">${formatDate(record.departureTime)}</div>
                  <div class="sub">${formatTime(record.departureTime)}</div>
                </div>
              ` : ''}
            </div>
            <div class="duration-grid">
              <div class="duration-item">
                <div class="label">Total Time</div>
                <div class="value">${formatDuration(record.totalElapsedMinutes)}</div>
              </div>
              <div class="duration-item">
                <div class="label">Grace Period</div>
                <div class="value">${formatDuration(record.gracePeriodMinutes)}</div>
              </div>
              <div class="duration-item detention">
                <div class="label">Detention</div>
                <div class="value">${formatDuration(record.detentionMinutes)}</div>
              </div>
            </div>
          </div>

          ${record.notes ? `
            <div class="section">
              <h3>Notes</h3>
              <p>${record.notes}</p>
            </div>
          ` : ''}

          ${record.photoCount > 0 ? `
            <div class="section">
              <h3>Evidence</h3>
              <p>📷 ${record.photoCount} photo${record.photoCount !== 1 ? 's' : ''} attached</p>
            </div>
          ` : ''}

          <div class="verification">
            <div class="code">${record.verificationCode}</div>
            <div class="hint">Verification Code - Use this to verify your detention claim</div>
          </div>
        </div>

        <div class="footer">
          Generated by DwellTime • ${new Date().toLocaleDateString()}
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate a PDF from a detention record
 */
export async function generatePdf(record: DetentionRecord): Promise<string> {
  const html = generateRecordHtml(record);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

/**
 * Share a detention record as PDF
 */
export async function shareRecordAsPdf(record: DetentionRecord): Promise<void> {
  const available = await isSharingAvailable();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }

  const pdfUri = await generatePdf(record);
  await Sharing.shareAsync(pdfUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Detention Record',
    UTI: 'com.adobe.pdf',
  });
}

/**
 * Generate plain text summary for quick sharing
 */
export function generateTextSummary(record: DetentionRecord): string {
  const eventType = record.eventType === 'pickup' ? 'Pickup' : 'Delivery';
  const lines = [
    '📋 DETENTION RECORD',
    '━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `📍 ${record.facilityName}`,
    record.facilityAddress ? `   ${record.facilityAddress}` : '',
    `   ${eventType}${record.loadReference ? ` • Load: ${record.loadReference}` : ''}`,
    '',
    '💰 EARNINGS',
    `   ${formatCurrency(record.detentionAmount)}`,
    `   ${formatDuration(record.detentionMinutes)} @ $${record.hourlyRate}/hr`,
    '',
    '⏱️ TIME DETAILS',
    `   Arrival: ${formatDate(record.arrivalTime)} ${formatTime(record.arrivalTime)}`,
    record.departureTime
      ? `   Departure: ${formatDate(record.departureTime)} ${formatTime(record.departureTime)}`
      : '',
    `   Total: ${formatDuration(record.totalElapsedMinutes)}`,
    `   Grace: ${formatDuration(record.gracePeriodMinutes)}`,
    `   Detention: ${formatDuration(record.detentionMinutes)}`,
    '',
    record.notes ? `📝 NOTES\n   ${record.notes}\n` : '',
    record.photoCount > 0 ? `📷 ${record.photoCount} photo${record.photoCount !== 1 ? 's' : ''} attached\n` : '',
    '🔐 VERIFICATION CODE',
    `   ${record.verificationCode}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━',
    'Generated by DwellTime',
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Share a detention record as text
 */
export async function shareRecordAsText(record: DetentionRecord): Promise<void> {
  const available = await isSharingAvailable();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }

  const text = generateTextSummary(record);
  const filename = `detention-${record.id.slice(0, 8)}.txt`;
  const file = new File(Paths.cache, filename);

  file.create();
  file.write(text);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/plain',
    dialogTitle: 'Share Detention Record',
  });
}

/**
 * Export multiple records as CSV
 */
export async function exportRecordsAsCsv(records: DetentionRecord[]): Promise<void> {
  const available = await isSharingAvailable();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }

  const headers = [
    'Date',
    'Facility',
    'Address',
    'Type',
    'Load Reference',
    'Arrival Time',
    'Departure Time',
    'Total Minutes',
    'Grace Minutes',
    'Detention Minutes',
    'Hourly Rate',
    'Earnings',
    'Verification Code',
    'Notes',
    'Photos',
  ].join(',');

  const rows = records.map(r => [
    formatDate(r.arrivalTime),
    `"${r.facilityName.replace(/"/g, '""')}"`,
    `"${(r.facilityAddress || '').replace(/"/g, '""')}"`,
    r.eventType,
    r.loadReference || '',
    new Date(r.arrivalTime).toISOString(),
    r.departureTime ? new Date(r.departureTime).toISOString() : '',
    r.totalElapsedMinutes,
    r.gracePeriodMinutes,
    r.detentionMinutes,
    r.hourlyRate,
    r.detentionAmount.toFixed(2),
    r.verificationCode,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
    r.photoCount,
  ].join(','));

  const csv = [headers, ...rows].join('\n');
  const filename = `dwelltime-export-${new Date().toISOString().slice(0, 10)}.csv`;
  const file = new File(Paths.cache, filename);

  file.create();
  file.write(csv);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Detention Records',
  });
}
