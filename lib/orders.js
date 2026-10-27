import { GoogleAuth } from 'google-auth-library';

export function getSheetConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replaceAll('\\n', '\n');
  const tab = process.env.GOOGLE_SHEET_TAB || 'Orders';
  if (!spreadsheetId || !clientEmail || !privateKey || !tab) {
    throw new Error('Google Sheet is not configured.');
  }
  return { spreadsheetId, clientEmail, privateKey, tab };
}

async function sheetClient() {
  const config = getSheetConfig();
  const auth = new GoogleAuth({
    credentials: { client_email: config.clientEmail, private_key: config.privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return { client: await auth.getClient(), config };
}

function rangeFor(tab, cells) {
  return encodeURIComponent(`'${tab.replaceAll("'", "''")}'!${cells}`);
}

async function readRows(client, config) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}/values/${rangeFor(config.tab, 'A:F')}`;
  const response = await client.request({ url });
  return response.data.values || [];
}

export async function getDeliveryRecord(paymentId) {
  const { client, config } = await sheetClient();
  const rows = await readRows(client, config);
  const index = rows.findIndex((row, rowIndex) => rowIndex > 0 && row[1] === paymentId);
  return index < 0 ? null : { row: index + 1, values: rows[index] };
}

export async function saveDeliveryEmail(payment, offer, deliveryEmail) {
  const { client, config } = await sheetClient();
  const rows = await readRows(client, config);
  const index = rows.findIndex((row, rowIndex) => rowIndex > 0 && row[1] === payment.payment_id);
  const values = [[
    payment.created_at,
    payment.payment_id,
    payment.customer.email,
    deliveryEmail,
    offer.kind,
    'Awaiting manual delivery',
  ]];
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}/values/`;
  if (index >= 0) {
    await client.request({
      url: `${base}${rangeFor(config.tab, `A${index + 1}:F${index + 1}`)}?valueInputOption=RAW`,
      method: 'PUT',
      data: { range: `'${config.tab.replaceAll("'", "''")}'!A${index + 1}:F${index + 1}`, majorDimension: 'ROWS', values },
    });
  } else {
    await client.request({
      url: `${base}${rangeFor(config.tab, 'A:F')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      method: 'POST',
      data: { majorDimension: 'ROWS', values },
    });
  }
}
