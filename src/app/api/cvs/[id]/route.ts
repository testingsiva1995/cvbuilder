import { NextRequest, NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';
import { getSession } from '@/lib/session';
import { v4 as uuidv4 } from 'uuid';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getAuthenticatedUserId(): Promise<number | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  return session.userId;
}

// GET /api/cvs/:id - get single CV (ownership verified)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await initDB();
    const db = getPool();
    const { id } = await params;
    const [rows] = await db.execute(
      'SELECT * FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    ) as [any[], any];

    if (!rows.length) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const row = rows[0];
    // cv_data contains: { personal, experience, education, projects, skills, languages, certifications, achievements }
    const cvData = JSON.parse(row.cv_data || '{}');

    // Reconstruct full CVData object with top-level fields merged back
    const fullCV = {
      ...cvData,
      id: row.id,
      title: row.title,
      templateId: row.template_id,
      accentColor: row.accent_color,
      fontStyle: row.font_style,
      photo: row.photo,
    };

    return NextResponse.json({ cv: fullCV });
  } catch (error) {
    console.error('GET /api/cvs/:id error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT /api/cvs/:id - update CV (ownership verified)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await initDB();
    const db = getPool();
    const { id } = await params;
    const body = await req.json();

    // Extract top-level fields; store the rest (including personal nested object) as cv_data
    const { title, templateId, accentColor, fontStyle, photo, ...cvDataRest } = body;
    const cvDataJson = JSON.stringify(cvDataRest);

    const [result] = await db.execute(
      'UPDATE cvs SET title = ?, template_id = ?, accent_color = ?, font_style = ?, photo = ?, cv_data = ? WHERE id = ? AND user_id = ?',
      [title || 'Mi CV', templateId || 'moderno', accentColor || '', fontStyle || 'sans', photo || '', cvDataJson, id, userId]
    ) as [any, any];

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'CV updated' });
  } catch (error) {
    console.error('PUT /api/cvs/:id error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE /api/cvs/:id - delete CV (ownership verified)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await initDB();
    const db = getPool();
    const { id } = await params;

    const [result] = await db.execute(
      'DELETE FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    ) as [any, any];

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'CV not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'CV deleted' });
  } catch (error) {
    console.error('DELETE /api/cvs/:id error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST /api/cvs/:id - duplicate CV (ownership verified)
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await initDB();
    const db = getPool();
    const { id } = await params;

    const [rows] = await db.execute(
      'SELECT * FROM cvs WHERE id = ? AND user_id = ?',
      [id, userId]
    ) as [any[], any];

    if (!rows.length) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const original = rows[0];
    const newId = uuidv4();
    const newTitle = `${original.title} (copia)`;

    await db.execute(
      'INSERT INTO cvs (id, user_id, title, template_id, accent_color, font_style, photo, cv_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, userId, newTitle, original.template_id, original.accent_color, original.font_style, original.photo, original.cv_data]
    );

    return NextResponse.json({ id: newId, message: 'CV duplicated' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cvs/:id/duplicate error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
