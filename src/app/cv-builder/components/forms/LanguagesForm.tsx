'use client';
import React, { useState } from 'react';
import { Plus, X, Globe } from 'lucide-react';
import { CVData, Language, LanguageProficiency } from '../cvData';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const proficiencies: LanguageProficiency[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo'];
const profColors: Record<LanguageProficiency, string> = {
  A1: 'badge-blue', A2: 'badge-blue',
  B1: 'badge-orange', B2: 'badge-orange',
  C1: 'badge-green', C2: 'badge-green',
  Nativo: 'bg-primary/10 text-primary text-[0.7rem] font-semibold px-2 py-0.5 rounded-full',
};

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Idiomas', sub: 'Añade los idiomas que hablas y tu nivel de competencia.',
    add: 'Añadir idioma', empty: 'Aún no has añadido idiomas.',
    languageLabel: 'Idioma', proficiencyLabel: 'Nivel',
    languagePlaceholder: 'Español, Inglés, Portugués...',
    save: 'Agregar', cancel: 'Cancelar',
    next: 'Siguiente: Certificaciones', prev: 'Anterior: Habilidades',
  },
  en: {
    title: 'Languages', sub: 'Add the languages you speak and your proficiency level.',
    add: 'Add language', empty: 'You haven\'t added any languages yet.',
    languageLabel: 'Language', proficiencyLabel: 'Proficiency',
    languagePlaceholder: 'Spanish, English, Portuguese...',
    save: 'Add', cancel: 'Cancel',
    next: 'Next: Certifications', prev: 'Previous: Skills',
  },
  pt: {
    title: 'Idiomas', sub: 'Adicione os idiomas que você fala e seu nível de proficiência.',
    add: 'Adicionar idioma', empty: 'Você ainda não adicionou idiomas.',
    languageLabel: 'Idioma', proficiencyLabel: 'Nível',
    languagePlaceholder: 'Espanhol, Inglês, Português...',
    save: 'Adicionar', cancel: 'Cancelar',
    next: 'Próximo: Certificações', prev: 'Anterior: Habilidades',
  },
};

export default function LanguagesForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const [showAdd, setShowAdd] = useState(false);
  const [newLang, setNewLang] = useState({ language: '', proficiency: 'B2' as LanguageProficiency });

  const handleAdd = () => {
    if (!newLang.language.trim()) return;
    const entry: Language = { id: `lang-${Date.now()}`, language: newLang.language, proficiency: newLang.proficiency };
    onUpdate({ languages: [...cvData.languages, entry] });
    setNewLang({ language: '', proficiency: 'B2' });
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
      </div>

      {cvData.languages.length === 0 && (
        <div className="card-base p-8 text-center">
          <Globe size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        </div>
      )}

      {cvData.languages.length > 0 && (
        <div className="card-base p-4 flex flex-col gap-2.5">
          {cvData.languages.map(item => (
            <div key={`lang-item-${item.id}`} className="flex items-center justify-between gap-3 py-1.5">
              <div className="flex items-center gap-3">
                <Globe size={15} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={profColors[item.proficiency]}>{item.proficiency}</span>
                <button
                  onClick={() => onUpdate({ languages: cvData.languages.filter(l => l.id !== item.id) })}
                  className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="card-base p-4 flex flex-col gap-3 border-primary/40">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-foreground mb-1">{t.languageLabel}</label>
              <input
                type="text"
                value={newLang.language}
                onChange={e => setNewLang(p => ({ ...p, language: e.target.value }))}
                placeholder={t.languagePlaceholder}
                className="input-base text-sm"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">{t.proficiencyLabel}</label>
              <select
                value={newLang.proficiency}
                onChange={e => setNewLang(p => ({ ...p, proficiency: e.target.value as LanguageProficiency }))}
                className="input-base text-sm"
              >
                {proficiencies.map(p => <option key={`prof-opt-${p}`} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-muted">{t.cancel}</button>
            <button onClick={handleAdd} className="flex-1 py-2 text-sm font-bold btn-secondary rounded-lg">{t.save}</button>
          </div>
        </div>
      )}

      {!showAdd && (
        <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus size={16} />
          {t.add}
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={() => onSectionChange('skills')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">← {t.prev}</button>
        <button onClick={() => onSectionChange('certifications')} className="flex-1 py-2.5 btn-secondary rounded-xl text-sm font-bold">{t.next} →</button>
      </div>
    </div>
  );
}