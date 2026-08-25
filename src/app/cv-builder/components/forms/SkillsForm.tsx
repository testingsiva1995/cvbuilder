'use client';
import React, { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { CVData, Skill, SkillLevel } from '../cvData';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const levels: SkillLevel[] = ['Básico', 'Intermedio', 'Avanzado', 'Experto'];
const levelColors: Record<SkillLevel, string> = {
  Básico: 'bg-border',
  Intermedio: 'bg-warning',
  Avanzado: 'bg-primary',
  Experto: 'bg-secondary',
};
const levelWidths: Record<SkillLevel, string> = {
  Básico: 'w-1/4',
  Intermedio: 'w-2/4',
  Avanzado: 'w-3/4',
  Experto: 'w-full',
};

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Habilidades', sub: 'Añade tus habilidades técnicas y blandas con su nivel de dominio.',
    add: 'Añadir habilidad', empty: 'Aún no has añadido habilidades.',
    skillName: 'Habilidad', category: 'Categoría', level: 'Nivel',
    categoryPlaceholder: 'Frontend, Backend, Herramientas...',
    save: 'Agregar', cancel: 'Cancelar',
    next: 'Siguiente: Idiomas', prev: 'Anterior: Proyectos',
  },
  en: {
    title: 'Skills', sub: 'Add your technical and soft skills with proficiency level.',
    add: 'Add skill', empty: 'You haven\'t added any skills yet.',
    skillName: 'Skill', category: 'Category', level: 'Level',
    categoryPlaceholder: 'Frontend, Backend, Tools...',
    save: 'Add', cancel: 'Cancel',
    next: 'Next: Languages', prev: 'Previous: Projects',
  },
  pt: {
    title: 'Habilidades', sub: 'Adicione suas habilidades técnicas e interpessoais com nível de domínio.',
    add: 'Adicionar habilidade', empty: 'Você ainda não adicionou habilidades.',
    skillName: 'Habilidade', category: 'Categoria', level: 'Nível',
    categoryPlaceholder: 'Frontend, Backend, Ferramentas...',
    save: 'Adicionar', cancel: 'Cancelar',
    next: 'Próximo: Idiomas', prev: 'Anterior: Projetos',
  },
};

export default function SkillsForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Avanzado' as SkillLevel, category: '' });

  const handleAdd = () => {
    if (!newSkill.name.trim()) return;
    const skill: Skill = {
      id: `skill-${Date.now()}`,
      name: newSkill.name,
      level: newSkill.level,
      category: newSkill.category,
    };
    onUpdate({ skills: [...cvData.skills, skill] });
    setNewSkill({ name: '', level: 'Avanzado', category: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    onUpdate({ skills: cvData.skills.filter(s => s.id !== id) });
  };

  const grouped = cvData.skills.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
      </div>

      {cvData.skills.length === 0 && (
        <div className="card-base p-8 text-center">
          <Zap size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        </div>
      )}

      {/* Grouped skills */}
      {Object.entries(grouped).map(([category, skills]) => (
        <div key={`skill-group-${category}`} className="card-base p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">{category}</div>
          <div className="flex flex-col gap-3">
            {skills.map(skill => (
              <div key={`skill-item-${skill.id}`} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <span className="text-xs text-muted-foreground">{skill.level}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${levelColors[skill.level]} ${levelWidths[skill.level]}`} />
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add form */}
      {showAdd && (
        <div className="card-base p-4 flex flex-col gap-3 border-primary/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">{t.skillName}</label>
              <input
                type="text"
                value={newSkill.name}
                onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
                placeholder="React, Excel, Comunicación..."
                className="input-base text-sm"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">{t.level}</label>
              <select
                value={newSkill.level}
                onChange={e => setNewSkill(p => ({ ...p, level: e.target.value as SkillLevel }))}
                className="input-base text-sm"
              >
                {levels.map(l => <option key={`level-opt-${l}`} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">{t.category}</label>
              <input
                type="text"
                value={newSkill.category}
                onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}
                placeholder={t.categoryPlaceholder}
                className="input-base text-sm"
              />
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
        <button onClick={() => onSectionChange('projects')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">← {t.prev}</button>
        <button onClick={() => onSectionChange('languages')} className="flex-1 py-2.5 btn-secondary rounded-xl text-sm font-bold">{t.next} →</button>
      </div>
    </div>
  );
}