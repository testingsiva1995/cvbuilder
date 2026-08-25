import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const db = getPool();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Correo requerido' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const [rows] = await db.execute(
      'SELECT id, email_verified FROM users WHERE email = ?',
      [normalizedEmail]
    ) as [any[], any];

    if (rows.length === 0) {
      // Don't reveal if email exists
      return NextResponse.json({ message: 'Si el correo existe, recibirás un nuevo enlace.' });
    }

    const user = rows[0];

    if (user.email_verified) {
      return NextResponse.json({ error: 'Este correo ya está verificado.' }, { status: 400 });
    }

    // Delete any existing tokens for this user
    await db.execute('DELETE FROM email_verification_tokens WHERE user_id = ?', [user.id]);

    // Generate new token
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.execute(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    await sendVerificationEmail(normalizedEmail, token);

    return NextResponse.json({ message: 'Nuevo enlace de verificación enviado. Revisa tu correo.' });
  } catch (error: any) {
    console.error('POST /api/auth/resend-verification error:', error);
    if (error?.message?.startsWith('MAILER_NOT_CONFIGURED')) {
      return NextResponse.json({ error: 'El servicio de correo no está configurado.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Error del servidor. Intenta de nuevo.' }, { status: 500 });
  }
}
