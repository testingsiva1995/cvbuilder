import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

async function getAuthenticatedUserId(): Promise<number | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  return session.userId;
}

// GET /api/cvs - list all CVs for authenticated user
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await initDB();
    const db = getPool();
    const [rows] = await db.execute(
      'SELECT id, title, template_id, accent_color, font_style, created_at, updated_at FROM cvs WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    return NextResponse.json({ cvs: rows });
  } catch (error) {
    console.error('GET /api/cvs error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/cvs - create new CV for authenticated user
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await initDB();
    const db = getPool();
    const body = await req.json();
    const id = uuidv4();

    // Extract top-level fields; store the rest (including personal nested object) as cv_data
    const { title, templateId, accentColor, fontStyle, photo, ...cvDataRest } = body;
    const cvDataJson = JSON.stringify(cvDataRest);

    await db.execute(
      'INSERT INTO cvs (id, user_id, title, template_id, accent_color, font_style, photo, cv_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, title || 'Mi CV', templateId || 'moderno', accentColor || '', fontStyle || 'sans', photo || '', cvDataJson]
    );

    return NextResponse.json({ id, message: 'CV created' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cvs error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
