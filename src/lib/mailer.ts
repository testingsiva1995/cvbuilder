import nodemailer from 'nodemailer';

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || pass === 'YOUR_GMAIL_APP_PASSWORD_HERE') {
    throw new Error('MAILER_NOT_CONFIGURED: GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buscacerca9650.builtwithrocket.new';

export async function sendVerificationEmail(toEmail: string, token: string): Promise<void> {
  const transporter = getTransporter();
  const verifyUrl = `${SITE_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"BuscaCerca CV Builder" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Verifica tu correo electrónico — BuscaCerca CV Builder',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
              <tr><td style="background:#2563eb;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">BuscaCerca CV Builder</h1>
              </td></tr>
              <tr><td style="padding:40px;">
                <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Verifica tu correo electrónico</h2>
                <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                  Gracias por registrarte. Haz clic en el botón de abajo para verificar tu correo y activar tu cuenta.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                    Verificar mi correo
                  </a>
                </div>
                <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
                  Este enlace expira en <strong>24 horas</strong>. Si no creaste una cuenta, ignora este mensaje.
                </p>
                <p style="margin:0;color:#9ca3af;font-size:12px;word-break:break-all;">
                  O copia este enlace: ${verifyUrl}
                </p>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} BuscaCerca CV Builder. Todos los derechos reservados.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    text: `Verifica tu correo electrónico en BuscaCerca CV Builder.\n\nHaz clic aquí: ${verifyUrl}\n\nEste enlace expira en 24 horas.`,
  });
}
