import React from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Shield, Star } from 'lucide-react';

type Lang = 'es' | 'en' | 'pt';

const copy: Record<Lang, {
  badge: string; headline: string; sub: string;
  cta1: string; cta2: string;
  stat1: string; stat1label: string;
  stat2: string; stat2label: string;
  stat3: string; stat3label: string;
}> = {
  es: {
    badge: '✨ 100% Gratis — Sin tarjeta de crédito',
    headline: 'Crea tu CV profesional gratis',
    sub: 'Construye un currículum que destaque. Elige entre 5 plantillas profesionales, descarga en PDF y consigue el trabajo que mereces — todo gratis, en español.',
    cta1: 'Crear mi CV gratis',
    cta2: 'Ver plantillas',
    stat1: '5', stat1label: 'Plantillas profesionales',
    stat2: 'PDF', stat2label: 'Descarga instantánea',
    stat3: 'ATS', stat3label: 'Compatible con ATS',
  },
  en: {
    badge: '✨ 100% Free — No credit card required',
    headline: 'Create your professional CV for free',
    sub: 'Build a resume that stands out. Choose from 5 professional templates, download as PDF, and land the job you deserve — completely free.',
    cta1: 'Create my CV free',
    cta2: 'View templates',
    stat1: '5', stat1label: 'Professional templates',
    stat2: 'PDF', stat2label: 'Instant download',
    stat3: 'ATS', stat3label: 'ATS compatible',
  },
  pt: {
    badge: '✨ 100% Grátis — Sem cartão de crédito',
    headline: 'Crie seu CV profissional gratis',
    sub: 'Construa um currículo que se destaque. Escolha entre 5 modelos profissionais, baixe em PDF e conquiste o emprego que você merece — tudo gratis.',
    cta1: 'Criar meu CV gratis',
    cta2: 'Ver modelos',
    stat1: '5', stat1label: 'Modelos profissionais',
    stat2: 'PDF', stat2label: 'Download instantâneo',
    stat3: 'ATS', stat3label: 'Compatível com ATS',
  },
};

interface Props { lang: Lang; }

export default function HeroSection({ lang }: Props) {
  const t = copy[lang];

  return (
    <section className="gradient-hero text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white opacity-[0.03]" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white opacity-[0.04]" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-accent opacity-[0.06]" />
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium w-fit backdrop-blur-sm">
              {t.badge}
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-balance">
              {t.headline}
            </h1>

            <p className="text-lg text-white/80 leading-relaxed max-w-lg">
              {t.sub}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/sign-up-login-screen"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 btn-primary rounded-xl text-base font-bold shadow-lg"
              >
                {t.cta1}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 rounded-xl text-base font-semibold transition-all duration-150"
              >
                {t.cta2}
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Shield size={14} className="text-secondary" />
                <span>Sin registro obligatorio</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Download size={14} className="text-secondary" />
                <span>Descarga inmediata</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-sm">
                <Star size={14} className="text-accent" />
                <span>Más de 3,000 CVs creados</span>
              </div>
            </div>
          </div>

          {/* Right: CV Preview mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Shadow card behind */}
              <div className="absolute top-4 left-4 w-full h-full bg-white/10 rounded-2xl" />
              {/* Main CV card mockup */}
              <div className="relative bg-white rounded-2xl p-6 w-80 shadow-2xl text-foreground">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">CV</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Tu Nombre Aquí</div>
                    <div className="text-xs text-muted-foreground">Desarrollador Full Stack</div>
                    <div className="text-xs text-muted-foreground">Buenos Aires, Argentina</div>
                  </div>
                </div>
                {/* Divider */}
                <div className="border-t border-border mb-3" />
                {/* Mock sections */}
                {[
                  { label: 'Experiencia Laboral', lines: [3, 2] },
                  { label: 'Educación', lines: [2] },
                  { label: 'Habilidades', lines: [1] },
                ].map((section, si) => (
                  <div key={`cv-mock-section-${si}`} className="mb-3">
                    <div className="text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">{section.label}</div>
                    {section.lines.map((w, li) => (
                      <div key={`cv-mock-line-${si}-${li}`} className="h-2 bg-muted rounded-full mb-1" style={{ width: `${60 + w * 12}%` }} />
                    ))}
                  </div>
                ))}
                {/* Stats row */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  {[t.stat1, t.stat2, t.stat3].map((val, i) => (
                    <div key={`hero-stat-${i}`} className="flex-1 text-center">
                      <div className="text-sm font-bold text-primary tabular-nums">{val}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">{[t.stat1label, t.stat2label, t.stat3label][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ✓ ATS Pro
              </div>
              <div className="absolute -bottom-3 -left-3 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                PDF listo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}