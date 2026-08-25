import { NextResponse } from 'next/server';
import { getPool, initDB } from '@/lib/db';

export async function GET() {
  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const database = process.env.DB_NAME?.trim();
  const port = process.env.DB_PORT?.trim() || '3306';

  const config = {
    DB_HOST: host ? `✅ Set (${host})` : '❌ Empty / Missing',
    DB_PORT: port,
    DB_USER: user ? `✅ Set (${user})` : '❌ Empty / Missing',
    DB_PASSWORD: password ? '✅ Set (hidden)' : '❌ Empty / Missing',
    DB_NAME: database ? `✅ Set (${database})` : '❌ Empty / Missing',
  };

  const allSet = !!(host && user && password && database);

  if (!allSet) {
    return NextResponse.json({
      status: 'NOT_CONFIGURED',
      message: 'One or more DB environment variables are missing or empty.',
      config,
    }, { status: 503 });
  }

  // Try actual connection
  try {
    await initDB();
    const db = getPool();
    const [rows] = await db.execute('SELECT 1 AS ok') as [any[], any];
    return NextResponse.json({
      status: 'CONNECTED',
      message: 'Database connection successful!',
      config,
      test_query: rows[0],
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'CONNECTION_FAILED',
      message: err?.message || 'Unknown error',
      code: err?.code || null,
      config,
    }, { status: 503 });
  }
}
