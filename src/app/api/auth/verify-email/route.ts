import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    await initDB();
    const db = getPool();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    // Find token
    const [rows] = await db.execute(
      'SELECT id, user_id, expires_at FROM email_verification_tokens WHERE token = ?',
      [token]
    ) as [any[], any];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Token inválido o ya utilizado', code: 'INVALID' }, { status: 400 });
    }

    const record = rows[0];
    const now = new Date();

    if (new Date(record.expires_at) < now) {
      // Delete expired token
      await db.execute('DELETE FROM email_verification_tokens WHERE id = ?', [record.id]);
      return NextResponse.json({ error: 'El enlace de verificación ha expirado', code: 'EXPIRED', userId: record.user_id }, { status: 410 });
    }

    // Mark user as verified
    await db.execute('UPDATE users SET email_verified = 1 WHERE id = ?', [record.user_id]);

    // Delete used token
    await db.execute('DELETE FROM email_verification_tokens WHERE id = ?', [record.id]);

    // Fetch user to create session
    const [userRows] = await db.execute(
      'SELECT id, full_name, email FROM users WHERE id = ?',
      [record.user_id]
    ) as [any[], any];

    if (userRows.length > 0) {
      const user = userRows[0];
      const session = await getSession();
      session.userId = user.id;
      session.email = user.email;
      session.fullName = user.full_name;
      session.isLoggedIn = true;
      await session.save();
    }

    return NextResponse.json({ message: 'Correo verificado exitosamente', success: true });
  } catch (error) {
    console.error('GET /api/auth/verify-email error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
