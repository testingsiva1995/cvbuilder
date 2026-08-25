'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; onSwitchToLogin: () => void; }

interface RegisterFormData {
  fullName: string;
  email: string;
  country: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const copy: Record<Lang, {
  nameLabel: string; namePlaceholder: string;
  emailLabel: string; emailPlaceholder: string;
  countryLabel: string; countryPlaceholder: string;
  passLabel: string; passSub: string;
  confirmLabel: string;
  terms1: string; terms2: string; terms3: string; terms4: string;
  submit: string; submitting: string;
  haveAccount: string; login: string;
  successMsg: string;
  required: string; emailInvalid: string; passMin: string; passMismatch: string; termsRequired: string;
  emailTaken: string; serverError: string;
}> = {
  es: {
    nameLabel: 'Nombre completo', namePlaceholder: 'Tu nombre completo',
    emailLabel: 'Correo electrónico', emailPlaceholder: 'tu@correo.com',
    countryLabel: 'País', countryPlaceholder: 'Selecciona tu país',
    passLabel: 'Contraseña', passSub: 'Mínimo 8 caracteres',
    confirmLabel: 'Confirmar contraseña',
    terms1: 'Acepto los', terms2: 'términos de uso', terms3: 'y la', terms4: 'política de privacidad',
    submit: 'Crear cuenta gratis', submitting: 'Creando cuenta...',
    haveAccount: '¿Ya tienes cuenta?', login: 'Iniciar sesión',
    successMsg: '¡Cuenta creada! Bienvenido a BuscaCerca CV Builder.',
    required: 'Este campo es requerido', emailInvalid: 'Correo inválido', passMin: 'Mínimo 8 caracteres', passMismatch: 'Las contraseñas no coinciden', termsRequired: 'Debes aceptar los términos',
    emailTaken: 'Este correo ya está registrado', serverError: 'Error del servidor. Intenta de nuevo.',
  },
  en: {
    nameLabel: 'Full name', namePlaceholder: 'Your full name',
    emailLabel: 'Email address', emailPlaceholder: 'you@email.com',
    countryLabel: 'Country', countryPlaceholder: 'Select your country',
    passLabel: 'Password', passSub: 'Minimum 8 characters',
    confirmLabel: 'Confirm password',
    terms1: 'I accept the', terms2: 'terms of use', terms3: 'and the', terms4: 'privacy policy',
    submit: 'Create free account', submitting: 'Creating account...',
    haveAccount: 'Already have an account?', login: 'Sign in',
    successMsg: 'Account created! Welcome to BuscaCerca CV Builder.',
    required: 'This field is required', emailInvalid: 'Invalid email', passMin: 'Minimum 8 characters', passMismatch: 'Passwords do not match', termsRequired: 'You must accept the terms',
    emailTaken: 'This email is already registered', serverError: 'Server error. Please try again.',
  },
  pt: {
    nameLabel: 'Nome completo', namePlaceholder: 'Seu nome completo',
    emailLabel: 'Endereço de e-mail', emailPlaceholder: 'voce@email.com',
    countryLabel: 'País', countryPlaceholder: 'Selecione seu país',
    passLabel: 'Senha', passSub: 'Mínimo 8 caracteres',
    confirmLabel: 'Confirmar senha',
    terms1: 'Aceito os', terms2: 'termos de uso', terms3: 'e a', terms4: 'política de privacidade',
    submit: 'Criar conta gratis', submitting: 'Criando conta...',
    haveAccount: 'Já tem uma conta?', login: 'Entrar',
    successMsg: 'Conta criada! Bem-vindo ao BuscaCerca CV Builder.',
    required: 'Este campo é obrigatório', emailInvalid: 'E-mail inválido', passMin: 'Mínimo 8 caracteres', passMismatch: 'As senhas não coincidem', termsRequired: 'Você deve aceitar os termos',
    emailTaken: 'Este e-mail já está registrado', serverError: 'Erro do servidor. Tente novamente.',
  },
};

const latamCountries = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
  'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México',
  'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana',
  'Uruguay', 'Venezuela', 'Puerto Rico',
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['bg-destructive', 'bg-warning', 'bg-warning', 'bg-secondary'];
  const labels = ['', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];

  if (!password) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`strength-bar-${i}`}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-border'}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{labels[score]}</span>
    </div>
  );
}

export default function RegisterForm({ lang, onSwitchToLogin }: Props) {
  const t = copy[lang];
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm<RegisterFormData>();
  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          country: data.country,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError('email', { message: t.emailTaken });
        } else {
          setError('email', { message: json.error || t.serverError });
        }
        return;
      }

      toast.success(t.successMsg);
      router.push('/cv-dashboard');
      router.refresh();
    } catch {
      setError('email', { message: t.serverError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-sm font-semibold text-foreground">{t.nameLabel}</label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          placeholder={t.namePlaceholder}
          className={`input-base ${errors.fullName ? 'input-error' : ''}`}
          {...register('fullName', { required: t.required })}
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-semibold text-foreground">{t.emailLabel}</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          className={`input-base ${errors.email ? 'input-error' : ''}`}
          {...register('email', {
            required: t.required,
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.emailInvalid },
          })}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {/* Country */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-country" className="text-sm font-semibold text-foreground">{t.countryLabel}</label>
        <select
          id="reg-country"
          className={`input-base ${errors.country ? 'input-error' : ''}`}
          {...register('country', { required: t.required })}
        >
          <option value="">{t.countryPlaceholder}</option>
          {latamCountries.map(c => (
            <option key={`country-${c}`} value={c}>{c}</option>
          ))}
        </select>
        {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-semibold text-foreground">{t.passLabel}</label>
        <p className="text-xs text-muted-foreground -mt-1">{t.passSub}</p>
        <div className="relative">
          <input
            id="reg-password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            className={`input-base pr-10 ${errors.password ? 'input-error' : ''}`}
            {...register('password', {
              required: t.required,
              minLength: { value: 8, message: t.passMin },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle password visibility"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <PasswordStrength password={password} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirm" className="text-sm font-semibold text-foreground">{t.confirmLabel}</label>
        <div className="relative">
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            className={`input-base pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
            {...register('confirmPassword', {
              required: t.required,
              validate: (val) => val === password || t.passMismatch,
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2">
        <input
          id="reg-terms"
          type="checkbox"
          className="w-4 h-4 mt-0.5 rounded border-border accent-primary"
          {...register('terms', { required: t.termsRequired })}
        />
        <label htmlFor="reg-terms" className="text-xs text-muted-foreground leading-relaxed">
          {t.terms1}{' '}
          <button type="button" className="text-primary hover:underline">{t.terms2}</button>
          {' '}{t.terms3}{' '}
          <button type="button" className="text-primary hover:underline">{t.terms4}</button>
        </label>
      </div>
      {errors.terms && <p className="text-xs text-destructive -mt-2">{errors.terms.message}</p>}

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

      {/* Switch to login */}
      <p className="text-center text-sm text-muted-foreground">
        {t.haveAccount}{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-semibold hover:underline"
        >
          {t.login}
        </button>
      </p>
    </form>
  );
}