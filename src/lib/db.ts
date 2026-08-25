import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;
let poolConfig: string | null = null;

export function getPool(): mysql.Pool {
  const host = process.env.DB_HOST?.trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD?.trim();
  const database = process.env.DB_NAME?.trim();
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  const missing: string[] = [];
  if (!host) missing.push('DB_HOST');
  if (!user) missing.push('DB_USER');
  if (!password) missing.push('DB_PASSWORD');
  if (!database) missing.push('DB_NAME');

  if (missing.length > 0) {
    throw new Error(
      `DB_NOT_CONFIGURED: Faltan las siguientes variables de entorno: ${missing.join(', ')}. ` +
      'Por favor configúralas en el panel de Variables de Entorno (Settings → Environment).'
    );
  }

  // Build a config signature to detect if env vars changed
  const currentConfig = `${host}:${port}:${user}:${database}`;

  // Reset pool if config changed or pool doesn't exist
  if (pool && poolConfig !== currentConfig) {
    pool.end().catch(() => {});
    pool = null;
    poolConfig = null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 15000,
    });
    poolConfig = currentConfig;
  }

  return pool;
}

export async function resetPool(): Promise<void> {
  if (pool) {
    await pool.end().catch(() => {});
    pool = null;
    poolConfig = null;
  }
}

export async function initDB(): Promise<void> {
  const db = getPool();

  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      country VARCHAR(100),
      email_verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Add email_verified column if it doesn't exist (for existing tables)
  try {
    await db.execute(`
      ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0
    `);
  } catch {
    // Column already exists — ignore
  }

  // Create email_verification_tokens table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(128) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token (token),
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Create cvs table with integer user_id FK
  await db.execute(`
    CREATE TABLE IF NOT EXISTS cvs (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL DEFAULT 'Mi CV',
      template_id VARCHAR(50) NOT NULL DEFAULT 'moderno',
      accent_color VARCHAR(20),
      font_style VARCHAR(20),
      photo LONGTEXT,
      cv_data LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
