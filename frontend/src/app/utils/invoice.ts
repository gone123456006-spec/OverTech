import { getProductById } from '../data/products';
import { getInvoiceSettings, getPaymentMethodLabel, type Order } from './storage';

const INVOICE_LOGO_PATH = '/assets/images/overtech-logo.png';
const INVOICE_LOGO_WIDTH = 265;
const INVOICE_LOGO_HEIGHT = 54;

function fmtDateTime(dateIso?: string) {
  if (!dateIso) return '—';
  return new Date(dateIso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text: string) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

async function resolveInvoiceLogoSrc(): Promise<string> {
  const absoluteUrl = new URL(INVOICE_LOGO_PATH, window.location.origin).href;
  try {
    const res = await fetch(absoluteUrl);
    if (!res.ok) return absoluteUrl;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || absoluteUrl));
      reader.onerror = () => resolve(absoluteUrl);
      reader.readAsDataURL(blob);
    });
  } catch {
    return absoluteUrl;
  }
}

export function buildInvoiceHtml(order: Order, logoSrc: string): string {
  const settings = getInvoiceSettings();
  const rows = order.items
    .map((item, index) => {
      const product = getProductById(item.productId);
      if (!product) return '';
      const lineTotal = product.price * item.quantity;
      return `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(product.name)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">₹${product.price.toLocaleString('en-IN')}</td>
        <td class="num">₹${lineTotal.toLocaleString('en-IN')}</td>
      </tr>`;
    })
    .join('');

  const termsHtml = escapeHtml(settings.termsAndConditions)
    .split('\n')
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join('');

  const businessLines = [
    settings.businessAddress,
    settings.businessPhone ? `Phone: ${settings.businessPhone}` : '',
    settings.businessEmail ? `Email: ${settings.businessEmail}` : '',
  ]
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(order.id)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.45;
    }
    .page {
      width: 100%;
      max-width: 210mm;
      min-height: 277mm;
      margin: 0 auto;
      padding: 8mm 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #134e4a;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .brand-logo {
      display: block;
      width: ${INVOICE_LOGO_WIDTH}px;
      height: ${INVOICE_LOGO_HEIGHT}px;
      object-fit: contain;
      object-position: left center;
      margin-bottom: 8px;
    }
    .brand p { margin: 2px 0; color: #444; }
    .invoice-meta {
      text-align: right;
      min-width: 180px;
    }
    .invoice-meta h2 {
      margin: 0 0 8px;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .invoice-meta p { margin: 3px 0; }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }
    .box {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 10px 12px;
      background: #fafafa;
    }
    .box h3 {
      margin: 0 0 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #666;
    }
    .box p { margin: 3px 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #134e4a;
      color: #fff;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td.num, th.num { text-align: right; }
    .totals {
      width: 280px;
      margin-left: auto;
      margin-bottom: 20px;
    }
    .totals table { margin-bottom: 0; }
    .totals td { border: none; padding: 6px 8px; }
    .totals tr.total td {
      border-top: 2px solid #134e4a;
      font-weight: bold;
      font-size: 14px;
    }
    .payment-box {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 18px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .payment-box div label {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 2px;
    }
    .terms {
      border-top: 1px solid #ddd;
      padding-top: 12px;
      margin-top: auto;
    }
    .terms h3 {
      margin: 0 0 8px;
      font-size: 11px;
      text-transform: uppercase;
      color: #666;
    }
    .terms p { margin: 4px 0; color: #333; font-size: 11px; }
    .footer {
      margin-top: 16px;
      text-align: center;
      font-size: 10px;
      color: #888;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <img
          class="brand-logo"
          src="${escapeAttr(logoSrc)}"
          alt="${escapeHtml(settings.businessName)}"
          width="${INVOICE_LOGO_WIDTH}"
          height="${INVOICE_LOGO_HEIGHT}"
        />
        ${businessLines}
      </div>
      <div class="invoice-meta">
        <h2>Tax Invoice</h2>
        <p><strong>Invoice No:</strong> ${escapeHtml(order.id)}</p>
        <p><strong>Order Date:</strong> ${fmtDateTime(order.date)}</p>
        <p><strong>Invoice Date:</strong> ${fmtDateTime(new Date().toISOString())}</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="box">
        <h3>Bill To</h3>
        <p><strong>${escapeHtml(order.address.name)}</strong></p>
        <p>${escapeHtml(order.address.mobile)}</p>
        <p>${escapeHtml(order.address.house)}</p>
        <p>${escapeHtml(order.address.city)}, ${escapeHtml(order.address.state)} - ${escapeHtml(order.address.pincode)}</p>
      </div>
      <div class="box">
        <h3>Order Status</h3>
        <p><strong>Status:</strong> ${escapeHtml(order.status.replace(/_/g, ' '))}</p>
        <p><strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus)}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px">#</th>
          <th>Product Name</th>
          <th class="num" style="width:60px">Qty</th>
          <th class="num" style="width:90px">Unit Price</th>
          <th class="num" style="width:100px">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="5">No items</td></tr>'}
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr class="total">
          <td>Grand Total</td>
          <td class="num">₹${order.total.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>

    <div class="payment-box">
      <div>
        <label>Payment Mode</label>
        <strong>${escapeHtml(getPaymentMethodLabel(order.paymentMethod))}</strong>
      </div>
      <div>
        <label>Payment Status</label>
        <strong>${escapeHtml(order.paymentStatus)}</strong>
      </div>
      <div>
        <label>Transaction Time</label>
        <strong>${fmtDateTime(order.date)}</strong>
      </div>
    </div>

    <div class="terms">
      <h3>Terms &amp; Conditions</h3>
      ${termsHtml || '<p>—</p>'}
    </div>

    <div class="footer">Thank you for shopping with ${escapeHtml(settings.businessName)}.</div>
  </div>
  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;
}

export async function downloadOrderInvoice(order: Order) {
  const logoSrc = await resolveInvoiceLogoSrc();
  const html = buildInvoiceHtml(order, logoSrc);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
