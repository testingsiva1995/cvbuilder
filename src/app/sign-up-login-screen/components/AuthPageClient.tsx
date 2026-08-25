'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type Lang = 'es' | 'en' | 'pt';
type Tab = 'login' | 'register';

const langOptions: { code: Lang; flag: string; label: string }[] = [
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
];

const tabLabels: Record<Lang, { login: string; register: string }> = {
  es: { login: 'Iniciar sesión', register: 'Crear cuenta' },
  en: { login: 'Sign in', register: 'Create account' },
  pt: { login: 'Entrar', register: 'Criar conta' },
};

const brandCopy: Record<Lang, { headline: string; sub: string; bullets: string[] }> = {
  es: {
    headline: 'Tu CV profesional, gratis y en minutos',
    sub: 'Únete a miles de profesionales latinoamericanos que ya crearon su CV con BuscaCerca.',
    bullets: [
      '5 plantillas profesionales incluyendo ATS Pro',
      'Descarga en PDF de alta calidad',
      'Vista previa en tiempo real',
      'Disponible en Español, English y Português',
      '100% gratuito, sin tarjeta de crédito',
    ],
  },
  en: {
    headline: 'Your professional CV, free in minutes',
    sub: 'Join thousands of Latin American professionals who already created their CV with BuscaCerca.',
    bullets: [
      '5 professional templates including ATS Pro',
      'High-quality PDF download',
      'Real-time preview',
      'Available in Spanish, English and Portuguese',
      '100% free, no credit card required',
    ],
  },
  pt: {
    headline: 'Seu CV profissional, grátis em minutos',
    sub: 'Junte-se a milhares de profissionais latino-americanos que já criaram seu CV com BuscaCerca.',
    bullets: [
      '5 modelos profissionais incluindo ATS Pro',
      'Download em PDF de alta qualidade',
      'Visualização em tempo real',
      'Disponível em Espanhol, Inglês e Português',
      '100% gratuito, sem cartão de crédito',
    ],
  },
};

export default function AuthPageClient() {
  const [lang, setLang] = useState<Lang>('es');
  const [tab, setTab] = useState<Tab>('login');
  const [langOpen, setLangOpen] = useState(false);
  const brand = brandCopy[lang];
  const tabs = tabLabels[lang];
  const currentLang = langOptions.find(l => l.code === lang)!;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 gradient-hero text-white flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* BG decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <AppLogo size={40} />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base text-white tracking-tight">BuscaCerca</span>
            <span className="text-xs text-white/60">CV Builder</span>
          </div>
        </Link>

        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4 text-balance">{brand.headline}</h1>
            <p className="text-white/75 text-base leading-relaxed">{brand.sub}</p>
          </div>

          <ul className="flex flex-col gap-3">
            {brand.bullets.map((bullet, i) => (
              <li key={`bullet-${i}`} className="flex items-center gap-3 text-sm text-white/85">
                <div className="w-5 h-5 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center shrink-0">
                  <span className="text-secondary text-xs">✓</span>
                </div>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-white/40">© 2025 BuscaCerca LATAM · Uruguay</p>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <AppLogo size={30} />
            <span className="font-bold text-sm text-primary">BuscaCerca CV Builder</span>
          </Link>
          <div className="lg:ml-auto relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-expanded={langOpen}
            >
              <Globe size={14} />
              <span>{currentLang.flag} {currentLang.label}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-card-hover py-1 min-w-[140px] animate-scale-in z-50">
                {langOptions.map(opt => (
                  <button
                    key={`auth-lang-${opt.code}`}
                    onClick={() => { setLang(opt.code); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors ${lang === opt.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                  >
                    {opt.flag} {opt.label}
                    {lang === opt.code && <span className="ml-auto text-primary text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl mb-8">
              {(['login', 'register'] as Tab[]).map(t => (
                <button
                  key={`auth-tab-${t}`}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 ${
                    tab === t
                      ? 'bg-card text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'login' ? tabs.login : tabs.register}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <LoginForm lang={lang} onSwitchToRegister={() => setTab('register')} />
            ) : (
              <RegisterForm lang={lang} onSwitchToLogin={() => setTab('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}