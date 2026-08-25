'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

type Lang = 'es' | 'en' | 'pt';

interface Props { lang: Lang; }

const sectionCopy: Record<Lang, { title: string; sub: string; useBtn: string; recommended: string }> = {
  es: { title: 'Elige tu plantilla', sub: 'Cambia de plantilla en cualquier momento. Tu información siempre se mantiene.', useBtn: 'Usar esta plantilla', recommended: 'Recomendado' },
  en: { title: 'Choose your template', sub: 'Switch templates anytime. Your information is always preserved.', useBtn: 'Use this template', recommended: 'Recommended' },
  pt: { title: 'Escolha seu modelo', sub: 'Troque de modelo a qualquer momento. Suas informações sempre são mantidas.', useBtn: 'Usar este modelo', recommended: 'Recomendado' },
};

const templates = [
  {
    id: 'ats',
    nameEs: 'ATS Pro', nameEn: 'ATS Pro', namePt: 'ATS Pro',
    descEs: 'Optimizado para sistemas ATS. Limpio, simple y efectivo.',
    descEn: 'Optimized for ATS systems. Clean, simple and effective.',
    descPt: 'Otimizado para sistemas ATS. Limpo, simples e eficaz.',
    color: '#2C3E50', accent: '#1B4F72', recommended: true,
    preview: { headerBg: '#2C3E50', headerText: '#FFFFFF', bodyBg: '#FFFFFF', accent: '#1B4F72' },
  },
  {
    id: 'moderno',
    nameEs: 'Moderno', nameEn: 'Modern', namePt: 'Moderno',
    descEs: 'Diseño contemporáneo con tipografía moderna y espaciado limpio.',
    descEn: 'Contemporary design with modern typography and clean spacing.',
    descPt: 'Design contemporâneo com tipografia moderna e espaçamento limpo.',
    color: '#1B4F72', accent: '#F39C12', recommended: false,
    preview: { headerBg: '#1B4F72', headerText: '#FFFFFF', bodyBg: '#FFFFFF', accent: '#F39C12' },
  },
  {
    id: 'ejecutivo',
    nameEs: 'Ejecutivo', nameEn: 'Executive', namePt: 'Executivo',
    descEs: 'Aspecto premium para gerentes y directores. Elegancia profesional.',
    descEn: 'Premium look for managers and directors. Professional elegance.',
    descPt: 'Aparência premium para gerentes e diretores. Elegância profissional.',
    color: '#1A1A2E', accent: '#C0A060', recommended: false,
    preview: { headerBg: '#1A1A2E', headerText: '#FFFFFF', bodyBg: '#FAFAF8', accent: '#C0A060' },
  },
  {
    id: 'clasico',
    nameEs: 'Clásico', nameEn: 'Classic', namePt: 'Clássico',
    descEs: 'Layout tradicional con fuente serif. Ideal para puestos conservadores.',
    descEn: 'Traditional layout with serif font. Ideal for conservative positions.',
    descPt: 'Layout tradicional com fonte serifada. Ideal para cargos conservadores.',
    color: '#8B4513', accent: '#8B4513', recommended: false,
    preview: { headerBg: '#FFFFFF', headerText: '#2C3E50', bodyBg: '#FFFFFF', accent: '#8B4513' },
  },
  {
    id: 'creativo',
    nameEs: 'Creativo', nameEn: 'Creative', namePt: 'Criativo',
    descEs: 'Diseño colorido y moderno para profesionales creativos y de marketing.',
    descEn: 'Colorful and modern design for creative and marketing professionals.',
    descPt: 'Design colorido e moderno para profissionais criativos e de marketing.',
    color: '#6C3483', accent: '#E74C3C', recommended: false,
    preview: { headerBg: '#6C3483', headerText: '#FFFFFF', bodyBg: '#FFFFFF', accent: '#E74C3C' },
  },
];

function MiniCVPreview({ preview, name }: { preview: typeof templates[0]['preview']; name: string }) {
  return (
    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow-inner border border-border/50 bg-white">
      {/* Header */}
      <div className="h-1/4 flex flex-col justify-center px-3 py-2" style={{ backgroundColor: preview.headerBg }}>
        <div className="w-8 h-8 rounded-full mb-1.5 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: preview.accent, color: '#fff' }}>JG</div>
        <div className="h-1.5 rounded-full bg-white/50 w-3/4 mb-1" />
        <div className="h-1 rounded-full bg-white/30 w-1/2" />
      </div>
      {/* Body */}
      <div className="px-3 py-2 flex flex-col gap-1.5" style={{ backgroundColor: preview.bodyBg }}>
        {[80, 65, 90, 55, 70, 45].map((w, i) => (
          <div
            key={`preview-line-${name}-${i}`}
            className="h-1.5 rounded-full"
            style={{ width: `${w}%`, backgroundColor: i === 0 ? preview.accent : '#ECF0F1' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPreviewSection({ lang }: Props) {
  const t = sectionCopy[lang];
  const [selected, setSelected] = useState('ats');

  const getName = (tpl: typeof templates[0]) =>
    lang === 'es' ? tpl.nameEs : lang === 'en' ? tpl.nameEn : tpl.namePt;
  const getDesc = (tpl: typeof templates[0]) =>
    lang === 'es' ? tpl.descEs : lang === 'en' ? tpl.descEn : tpl.descPt;

  return (
    <section className="py-20 bg-muted/40">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t.title}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.sub}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {templates.map(tpl => (
            <div
              key={`template-card-${tpl.id}`}
              onClick={() => setSelected(tpl.id)}
              className={`relative cursor-pointer rounded-xl p-3 border-2 transition-all duration-200 template-card-hover ${
                selected === tpl.id
                  ? 'border-primary shadow-card-hover bg-card'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              {tpl.recommended && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 badge-green whitespace-nowrap z-10">
                  {t.recommended}
                </div>
              )}
              {selected === tpl.id && (
                <div className="absolute top-2 right-2 text-primary">
                  <CheckCircle size={16} />
                </div>
              )}
              <MiniCVPreview preview={tpl.preview} name={tpl.id} />
              <div className="mt-3 text-center">
                <div className="font-semibold text-sm text-foreground">{getName(tpl)}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight line-clamp-2">{getDesc(tpl)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/sign-up-login-screen"
            className="inline-flex items-center gap-2 px-8 py-3.5 btn-primary rounded-xl text-base font-bold shadow-lg"
          >
            {t.useBtn}
          </Link>
        </div>
      </div>
    </section>
  );
}