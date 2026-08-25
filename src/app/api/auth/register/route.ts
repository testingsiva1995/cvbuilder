import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const db = getPool();
    const { fullName, email, password, country } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    // Check if email already exists
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    ) as [any[], any];

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Este correo ya está registrado' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user (email_verified = 1 — no verification required)
    const [result] = await db.execute(
      'INSERT INTO users (full_name, email, password_hash, country, email_verified) VALUES (?, ?, ?, ?, 1)',
      [fullName.trim(), email.toLowerCase().trim(), passwordHash, country || null]
    ) as [any, any];

    const userId = result.insertId;

    // Auto-login: create session immediately
    const session = await getSession();
    session.userId = userId;
    session.email = email.toLowerCase().trim();
    session.fullName = fullName.trim();
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      message: 'Cuenta creada exitosamente.',
      user: { id: userId, email: email.toLowerCase().trim(), fullName: fullName.trim() },
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/auth/register error:', error);

    if (error?.message?.startsWith('DB_NOT_CONFIGURED')) {
      // Extract the missing variables from the error message for a helpful response
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

    if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
      return NextResponse.json({
        error: 'Acceso denegado a la base de datos. Verifica DB_USER y DB_PASSWORD.',
      }, { status: 503 });
    }

    if (error?.code === 'ER_BAD_DB_ERROR') {
      return NextResponse.json({
        error: 'La base de datos especificada en DB_NAME no existe.',
      }, { status: 503 });
    }

    return NextResponse.json({ error: 'Error del servidor. Intenta de nuevo.' }, { status: 500 });
  }
}
