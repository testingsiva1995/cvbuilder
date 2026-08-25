import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPool, initDB } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Always query the DB to get the real, current user record.
    // Never trust only the session cookie's cached fullName/email —
    // stale cookies can carry data from a previous user.
    try {
      await initDB();
      const db = getPool();
      const [rows] = await db.execute(
        'SELECT id, full_name, email FROM users WHERE id = ?',
        [session.userId]
      ) as [any[], any];

      if (!rows.length) {
        // User no longer exists in DB — destroy session
        session.isLoggedIn = false;
        await session.save();
        return NextResponse.json({ user: null }, { status: 401 });
      }

      const user = rows[0];

      // Refresh session fields in case they were stale
      if (session.fullName !== user.full_name || session.email !== user.email) {
        session.fullName = user.full_name;
        session.email = user.email;
        await session.save();
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
        },
      });
    } catch (dbError) {
      // DB not configured or unreachable — fall back to session data
      console.warn('GET /api/auth/me: DB unavailable, falling back to session data:', dbError);
      return NextResponse.json({
        user: {
          id: session.userId,
          email: session.email,
          fullName: session.fullName,
        },
      });
    }
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
