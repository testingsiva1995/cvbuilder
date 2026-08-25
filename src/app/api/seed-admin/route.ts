import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Admin credentials for testing
const ADMIN_EMAIL = 'admin@buscacerca.uy';
const ADMIN_PASSWORD = 'Admin1234!';
const ADMIN_NAME = 'Administrador';

export async function GET(req: NextRequest) {
  try {
    await initDB();
    const db = getPool();

    // Check if admin already exists
    const [existing] = await db.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [ADMIN_EMAIL]
    ) as [any[], any];

    if (existing.length > 0) {
      return NextResponse.json({
        message: 'El usuario admin ya existe.',
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        },
      });
    }

    // Hash password and insert admin user
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const [result] = await db.execute(
      'INSERT INTO users (full_name, email, password_hash, country) VALUES (?, ?, ?, ?)',
      [ADMIN_NAME, ADMIN_EMAIL, passwordHash, 'Uruguay']
    ) as [any, any];

    return NextResponse.json({
      message: 'Usuario admin creado exitosamente.',
      credentials: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      userId: result.insertId,
    }, { status: 201 });
  } catch (error: any) {
    console.error('seed-admin error:', error);

    if (error?.message?.startsWith('DB_NOT_CONFIGURED')) {
      return NextResponse.json({
        error: 'Base de datos no configurada. Configura las variables DB_* en .env primero.',
      }, { status: 503 });
    }

    if (error?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        error: 'No se puede conectar a la base de datos.',
      }, { status: 503 });
    }

    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
