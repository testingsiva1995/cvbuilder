'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Globe } from 'lucide-react';

type Lang = 'es' | 'en' | 'pt';

interface PublicNavProps {
  lang?: Lang;
  onLangChange?: (l: Lang) => void;
  activePath?: string;
}

const navLabels: Record<Lang, { templates: string; login: string; register: string }> = {
  es: { templates: 'Plantillas', login: 'Iniciar sesión', register: 'Crear CV gratis' },
  en: { templates: 'Templates', login: 'Sign in', register: 'Create CV free' },
  pt: { templates: 'Modelos', login: 'Entrar', register: 'Criar CV grátis' },
};

const langOptions: { code: Lang; flag: string; label: string }[] = [
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
];

export default function PublicNav({ lang = 'es', onLangChange, activePath }: PublicNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const labels = navLabels[lang];
  const currentLang = langOptions.find(l => l.code === lang) || langOptions[0];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <AppLogo size={36} />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-primary tracking-tight">BuscaCerca</span>
            <span className="text-xs text-muted-foreground font-medium">CV Builder</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/templates"
            className={`text-sm font-medium transition-colors hover:text-primary ${activePath === '/templates' ? 'text-primary' : 'text-foreground'}`}
          >
            {labels.templates}
          </Link>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Selector de idioma"
              aria-expanded={langOpen}
            >
              <Globe size={15} />
              <span>{currentLang.flag} {currentLang.label}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-card-hover py-1 min-w-[140px] animate-scale-in z-50">
                {langOptions.map(opt => (
                  <button
                    key={`lang-opt-${opt.code}`}
                    onClick={() => { onLangChange?.(opt.code); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors ${lang === opt.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                    {lang === opt.code && <span className="ml-auto text-primary text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/sign-up-login-screen"
            className="px-4 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-150"
          >
            {labels.login}
          </Link>
          <Link
            href="/sign-up-login-screen"
            className="px-4 py-2 text-sm btn-primary rounded-lg"
          >
            {labels.register}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slide-up">
          <div className="px-4 py-3 flex flex-col gap-2">
            <Link href="/templates" className="py-2 text-sm font-medium text-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {labels.templates}
            </Link>
            <div className="border-t border-border pt-2 mt-1 flex flex-col gap-2">
              <div className="flex gap-2">
                {langOptions.map(opt => (
                  <button
                    key={`mobile-lang-${opt.code}`}
                    onClick={() => { onLangChange?.(opt.code); }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${lang === opt.code ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                  >
                    {opt.flag} {opt.label}
                  </button>
                ))}
              </div>
              <Link href="/sign-up-login-screen" className="py-2.5 text-center text-sm font-semibold text-primary border border-primary rounded-lg" onClick={() => setMobileOpen(false)}>
                {labels.login}
              </Link>
              <Link href="/sign-up-login-screen" className="py-2.5 text-center text-sm btn-primary rounded-lg" onClick={() => setMobileOpen(false)}>
                {labels.register}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}