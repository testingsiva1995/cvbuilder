'use client';
import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Lang = 'es' | 'en' | 'pt';

interface Props {
  lang: Lang;
  onSwitchToRegister: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const copy: Record<Lang, {
  emailLabel: string; emailPlaceholder: string;
  passLabel: string; passPlaceholder: string;
  remember: string; forgot: string;
  submit: string; submitting: string;
  noAccount: string; register: string;
  errorInvalid: string; successLogin: string;
  emailRequired: string; emailInvalid: string; passRequired: string;
  serverError: string;
}> = {
  es: {
    emailLabel: 'Correo electrónico', emailPlaceholder: 'tu@correo.com',
    passLabel: 'Contraseña', passPlaceholder: 'Tu contraseña',
    remember: 'Recordarme', forgot: '¿Olvidaste tu contraseña?',
    submit: 'Iniciar sesión', submitting: 'Iniciando sesión...',
    noAccount: '¿No tienes cuenta?', register: 'Crear cuenta gratis',
    errorInvalid: 'Correo o contraseña incorrectos',
    successLogin: '¡Bienvenido de vuelta!',
    emailRequired: 'El correo es requerido', emailInvalid: 'Correo inválido', passRequired: 'La contraseña es requerida',
    serverError: 'Error del servidor. Intenta de nuevo.',
  },
  en: {
    emailLabel: 'Email address', emailPlaceholder: 'you@email.com',
    passLabel: 'Password', passPlaceholder: 'Your password',
    remember: 'Remember me', forgot: 'Forgot your password?',
    submit: 'Sign in', submitting: 'Signing in...',
    noAccount: "Don't have an account?", register: 'Create free account',
    errorInvalid: 'Invalid email or password',
    successLogin: 'Welcome back!',
    emailRequired: 'Email is required', emailInvalid: 'Invalid email', passRequired: 'Password is required',
    serverError: 'Server error. Please try again.',
  },
  pt: {
    emailLabel: 'Endereço de e-mail', emailPlaceholder: 'voce@email.com',
    passLabel: 'Senha', passPlaceholder: 'Sua senha',
    remember: 'Lembrar de mim', forgot: 'Esqueceu sua senha?',
    submit: 'Entrar', submitting: 'Entrando...',
    noAccount: 'Não tem uma conta?', register: 'Criar conta gratis',
    errorInvalid: 'E-mail ou senha incorretos',
    successLogin: 'Bem-vindo de volta!',
    emailRequired: 'E-mail é obrigatório', emailInvalid: 'E-mail inválido', passRequired: 'Senha é obrigatória',
    serverError: 'Erro do servidor. Tente novamente.',
  },
};

export default function LoginForm({ lang, onSwitchToRegister }: Props) {
  const t = copy[lang];
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError('password', { message: t.errorInvalid });
        } else {
          setError('password', { message: json.error || t.serverError });
        }
        return;
      }

      toast.success(t.successLogin);
      router.push('/cv-dashboard');
      router.refresh();
    } catch {
      setError('password', { message: t.serverError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-semibold text-foreground">
          {t.emailLabel}
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          className={`input-base ${errors.email ? 'input-error' : ''}`}
          {...register('email', {
            required: t.emailRequired,
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.emailInvalid },
          })}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
            {t.passLabel}
          </label>
          <button type="button" className="text-xs text-primary hover:underline">
            {t.forgot}
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t.passPlaceholder}
            className={`input-base pr-10 ${errors.password ? 'input-error' : ''}`}
            {...register('password', { required: t.passRequired })}
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {/* Remember me */}
      <div className="flex items-center gap-2">
        <input
          id="login-remember"
          type="checkbox"
          className="w-4 h-4 rounded border-border accent-primary"
          {...register('remember')}
        />
        <label htmlFor="login-remember" className="text-sm text-muted-foreground">{t.remember}</label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 btn-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" />{t.submitting}</>
        ) : t.submit}
      </button>

      {/* Switch to register */}
      <p className="text-center text-sm text-muted-foreground">
        {t.noAccount}{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary font-semibold hover:underline"
        >
          {t.register}
        </button>
      </p>
    </form>
  );
}