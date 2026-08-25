'use client';
import React from 'react';
import { CVData } from '../cvData';
import RichTextEditor from '../RichTextEditor';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const MAX_CHARS = 600;

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Resumen Profesional', sub: 'Escribe un párrafo que resuma tu perfil, experiencia clave y lo que aportas.',
    label: 'Resumen', placeholder: 'Profesional con X años de experiencia en... Especializado en... Apasionado por...',
    tip: 'Consejo ATS: Usa palabras clave de las ofertas laborales a las que aplicas. Entre 3 y 5 oraciones es ideal.',
    chars: 'caracteres', next: 'Siguiente: Experiencia Laboral', prev: 'Anterior: Información Personal',
  },
  en: {
    title: 'Professional Summary', sub: 'Write a paragraph summarizing your profile, key experience and what you bring.',
    label: 'Summary', placeholder: 'Professional with X years of experience in... Specialized in... Passionate about...',
    tip: 'ATS Tip: Use keywords from the job postings you apply to. 3 to 5 sentences is ideal.',
    chars: 'characters', next: 'Next: Work Experience', prev: 'Previous: Personal Info',
  },
  pt: {
    title: 'Resumo Profissional', sub: 'Escreva um parágrafo que resuma seu perfil, experiência principal e o que você traz.',
    label: 'Resumo', placeholder: 'Profissional com X anos de experiência em... Especializado em... Apaixonado por...',
    tip: 'Dica ATS: Use palavras-chave das vagas que você se candidata. De 3 a 5 frases é ideal.',
    chars: 'caracteres', next: 'Próximo: Experiência Profissional', prev: 'Anterior: Informações Pessoais',
  },
};

export default function SummaryForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const summary = cvData.personal.summary;
  // Strip HTML tags for char count
  const plainText = summary.replace(/<[^>]*>/g, '');
  const charCount = plainText.length;
  const isOver = charCount > MAX_CHARS;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
      </div>

      <div className="card-base p-4 flex items-start gap-2 bg-primary/5 border-primary/20">
        <span className="text-primary text-sm mt-0.5">💡</span>
        <p className="text-xs text-primary/80 leading-relaxed">{t.tip}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">{t.label}</label>
          <span className={`text-xs tabular-nums font-medium ${isOver ? 'text-destructive' : 'text-muted-foreground'}`}>
            {charCount} / {MAX_CHARS} {t.chars}
          </span>
        </div>
        <RichTextEditor
          value={summary}
          onChange={val => onUpdate({ personal: { ...cvData.personal, summary: val } })}
          placeholder={t.placeholder}
          rows={7}
        />
        {/* Character progress bar */}
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{
              width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%`,
              backgroundColor: isOver ? 'var(--destructive)' : charCount > MAX_CHARS * 0.8 ? 'var(--warning)' : 'var(--secondary)',
            }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onSectionChange('personal')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">
          ← {t.prev}
        </button>
        <button onClick={() => onSectionChange('experience')} className="flex-1 py-2.5 btn-secondary rounded-xl text-sm font-bold">
          {t.next} →
        </button>
      </div>
    </div>
  );
}