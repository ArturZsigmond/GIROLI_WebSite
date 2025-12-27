import { Resend } from "resend";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const COMPANY_EMAIL = "girolicnc@gmail.com";

interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  title?: string;
}

interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  totalPrice: number;
  items: OrderItem[];
  createdAt: Date;
}

export async function sendOrderConfirmationEmail(order: OrderData, productDetails: Array<{ title: string; price: number }>) {
  const itemsHtml = order.items
    .map((item, index) => {
      const product = productDetails[index];
      const itemTotal = item.priceAtPurchase * item.quantity;
      return `
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e40af; flex: 1;">${product?.title || "Produs"}</h3>
            <span style="font-size: 18px; font-weight: bold; color: #1e40af; white-space: nowrap; margin-left: 12px;">${itemTotal} RON</span>
          </div>
          <div style="display: flex; gap: 16px; font-size: 14px; color: #6b7280;">
            <span><strong>Cantitate:</strong> ${item.quantity}</span>
            <span><strong>Preț unitar:</strong> ${item.priceAtPurchase} RON</span>
          </div>
        </div>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Giroli Mob</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Comandă confirmată</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Bună ziua, <strong>${order.customerName}</strong>,
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Vă mulțumim pentru comanda dvs! Comanda cu numărul <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> a fost primită și va fi procesată în cel mai scurt timp.
          </p>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">Detalii comandă</h2>
            <p style="margin: 8px 0;"><strong>Nume:</strong> ${order.customerName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
            <p style="margin: 8px 0;"><strong>Telefon:</strong> ${order.customerPhone}</p>
            <p style="margin: 8px 0;"><strong>Adresă:</strong> ${order.customerAddress}</p>
          </div>

          <h2 style="color: #1e40af; margin-top: 30px; font-size: 20px; margin-bottom: 16px;">Produse comandate</h2>
          <div style="margin: 20px 0;">
            ${itemsHtml}
          </div>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 18px; font-weight: bold; color: #1e40af;">Total:</span>
              <span style="font-size: 24px; font-weight: bold; color: #1e40af;">${order.totalPrice} RON</span>
            </div>
          </div>

          <p style="font-size: 16px; margin-top: 30px; padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <strong>Notă:</strong> Vă vom contacta în cel mai scurt timp pentru a confirma comanda și a discuta detaliile de livrare.
          </p>

          <p style="font-size: 16px; margin-top: 30px;">
            Cu respect,<br>
            <strong>Echipa Giroli Mob</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return;
  }

  try {
    console.log(`Attempting to send confirmation email to: ${order.customerEmail}`);
    const result = await resend.emails.send({
      from: `Giroli Mob <noreply@girolimob.com>`,
      to: order.customerEmail,
      replyTo: COMPANY_EMAIL,
      subject: `Comandă confirmată - #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    });
    console.log("Order confirmation email sent successfully:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    // Don't throw - we don't want to fail the order if email fails
  }
}

export async function sendOrderNotificationEmail(order: OrderData, productDetails: Array<{ title: string; price: number }>) {
  const itemsHtml = order.items
    .map((item, index) => {
      const product = productDetails[index];
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${product?.title || "Produs"}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.priceAtPurchase} RON</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${item.priceAtPurchase * item.quantity} RON</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Comandă nouă</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Ați primit o comandă nouă!
          </p>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Detalii client</h2>
            <p style="margin: 8px 0;"><strong>Nume:</strong> ${order.customerName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${order.customerEmail}" style="color: #1e40af;">${order.customerEmail}</a></p>
            <p style="margin: 8px 0;"><strong>Telefon:</strong> <a href="tel:${order.customerPhone}" style="color: #1e40af;">${order.customerPhone}</a></p>
            <p style="margin: 8px 0;"><strong>ID Comandă:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">📍 Adresă de livrare</h2>
            <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #1e3a8a;">${order.customerAddress}</p>
          </div>

          <h2 style="color: #1e40af; margin-top: 30px; font-size: 20px;">Produse comandate</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Produs</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Cantitate</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Preț unitar</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #dc2626; border-top: 2px solid #e5e7eb;">${order.totalPrice} RON</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return;
  }

  try {
    const result = await resend.emails.send({
      from: `Giroli Mob <noreply@girolimob.com>`,
      to: COMPANY_EMAIL,
      replyTo: order.customerEmail,
      subject: `🔔 Comandă nouă - #${order.id.slice(0, 8).toUpperCase()} - ${order.customerName}`,
      html,
    });
    console.log("Order notification email sent:", result);
  } catch (error) {
    console.error("Failed to send order notification email:", error);
    // Don't throw for admin email - we don't want to fail the order
  }
}

