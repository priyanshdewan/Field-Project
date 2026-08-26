import { fetchApi } from './api-client';

export const sendCustomerBillWhatsApp = async (data?: any) => {
  const payload = data?.data || data;
  const phone = payload?.phone || payload?.customerPhone || "+919876543210";
  const name = payload?.customerName || "Valued Customer";
  const msg = `Namaste ${name}! Bizora Digital Receipt: Total ₹${payload?.total || 0}. Thank you for shopping with us!`;
  
  return fetchApi('/api/comms/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify({ recipientPhone: phone, recipientName: name, message: msg }),
  });
};

export const sendOwnerStockAlertWhatsApp = async (data?: any) => {
  const payload = data?.data || data;
  const phone = payload?.ownerPhone || "+919876543210";
  const msg = `⚠️ [Bizora Alert]: Low stock warning for ${payload?.productName || "Inventory Item"}. Current stock: ${payload?.stock || 0} units. Please place reorder PO.`;

  return fetchApi('/api/comms/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify({ recipientPhone: phone, recipientName: "Store Owner", message: msg }),
  });
};

export const sendEodReportWhatsApp = async (data?: any) => {
  const payload = data?.data || data;
  const phone = payload?.ownerPhone || "+919876543210";
  const msg = `📊 [Bizora Daily EOD Summary]: Date: ${payload?.date || "Today"}. Gross Sales: ₹${payload?.grossRevenue || "0"}. Total Orders: ${payload?.orders || "0"}. Net Profit: ₹${payload?.netProfit || "0"}.`;

  return fetchApi('/api/comms/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify({ recipientPhone: phone, recipientName: "Store Owner", message: msg }),
  });
};
