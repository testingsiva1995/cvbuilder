import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const db = getPool();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son requeridos' }, { status: 400 });
    }

    // Find user by email
    const [rows] = await db.execute(
      'SELECT id, full_name, email, password_hash FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    ) as [any[], any];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const user = rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.fullName = user.full_name;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      message: 'Sesión iniciada',
      user: { id: user.id, email: user.email, fullName: user.full_name },
    });
  } catch (error: any) {
    console.error('POST /api/auth/login error:', error);

    if (error?.message?.startsWith('DB_NOT_CONFIGURED')) {
      const detail = error.message.replace('DB_NOT_CONFIGURED: ', '');
      return NextResponse.json({
        error: `La base de datos no está configurada. ${detail}`,
      }, { status: 503 });
    }

    if (error?.code === 'ECONNREFUSED' || error?.errors?.some?.((e: any) => e?.code === 'ECONNREFUSED')) {
      return NextResponse.json({
        error: 'No se puede conectar a la base de datos. Verifica que DB_HOST sea el hostname remoto de Hostinger (ej: srv1234.hstgr.io), no "localhost".',
      }, { status: 503 });
    }

    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
