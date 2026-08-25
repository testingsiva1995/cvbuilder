'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'expired' | 'invalid' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (res.ok && json.success) {
          setStatus('success');
          setTimeout(() => router.push('/cv-dashboard'), 2500);
        } else if (res.status === 410) {
          setStatus('expired');
        } else {
          setStatus('invalid');
        }
      })
      .catch(() => setStatus('error'));
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-primary animate-spin" />
            <h1 className="text-xl font-bold text-foreground">Verificando tu correo...</h1>
            <p className="text-sm text-muted-foreground">Por favor espera un momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center">
              <CheckCircle size={36} className="text-secondary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">¡Correo verificado!</h1>
            <p className="text-sm text-muted-foreground">Tu cuenta está activa. Redirigiendo al panel...</p>
            <Link href="/cv-dashboard" className="mt-2 inline-block py-2.5 px-6 btn-primary rounded-xl text-sm font-bold">
              Ir al panel
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-warning/15 flex items-center justify-center">
              <MailCheck size={36} className="text-warning" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Enlace expirado</h1>
            <p className="text-sm text-muted-foreground">
              El enlace de verificación ha expirado (válido por 24 horas). Inicia sesión para solicitar uno nuevo.
            </p>
            <Link
              href="/sign-up-login-screen"
              className="mt-2 inline-block py-2.5 px-6 btn-primary rounded-xl text-sm font-bold"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        )}

        {(status === 'invalid' || status === 'error') && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle size={36} className="text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Enlace inválido</h1>
            <p className="text-sm text-muted-foreground">
              Este enlace de verificación no es válido o ya fue utilizado.
            </p>
            <Link href="/sign-up-login-screen" className="mt-2 inline-block py-2.5 px-6 btn-primary rounded-xl text-sm font-bold">
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={48} className="text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
