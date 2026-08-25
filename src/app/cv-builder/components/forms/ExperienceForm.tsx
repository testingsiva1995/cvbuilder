'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { CVData, WorkExperience } from '../cvData';
import RichTextEditor from '../RichTextEditor';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Experiencia Laboral', sub: 'Añade tus empleos anteriores y actuales, del más reciente al más antiguo.',
    add: 'Añadir experiencia', empty: 'Aún no has añadido experiencia laboral.',
    jobTitle: 'Cargo / Puesto', company: 'Empresa', location: 'Ubicación',
    startDate: 'Fecha de inicio', endDate: 'Fecha de fin', current: 'Trabajo aquí actualmente',
    description: 'Descripción del rol', achievements: 'Logros principales',
    descPlaceholder: 'Describe tus responsabilidades y actividades principales...',
    achPlaceholder: 'Describe tus logros más importantes (cuantifica cuando sea posible)...',
    save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar',
    present: 'Presente',
    next: 'Siguiente: Educación', prev: 'Anterior: Resumen',
  },
  en: {
    title: 'Work Experience', sub: 'Add your previous and current jobs, from most recent to oldest.',
    add: 'Add experience', empty: 'You haven\'t added any work experience yet.',
    jobTitle: 'Job title', company: 'Company', location: 'Location',
    startDate: 'Start date', endDate: 'End date', current: 'I currently work here',
    description: 'Role description', achievements: 'Key achievements',
    descPlaceholder: 'Describe your main responsibilities and activities...',
    achPlaceholder: 'Describe your most important achievements (quantify when possible)...',
    save: 'Save', cancel: 'Cancel', delete: 'Delete',
    present: 'Present',
    next: 'Next: Education', prev: 'Previous: Summary',
  },
  pt: {
    title: 'Experiência Profissional', sub: 'Adicione seus empregos anteriores e atuais, do mais recente ao mais antigo.',
    add: 'Adicionar experiência', empty: 'Você ainda não adicionou experiência profissional.',
    jobTitle: 'Cargo', company: 'Empresa', location: 'Localização',
    startDate: 'Data de início', endDate: 'Data de término', current: 'Trabalho aqui atualmente',
    description: 'Descrição do cargo', achievements: 'Principais conquistas',
    descPlaceholder: 'Descreva suas principais responsabilidades e atividades...',
    achPlaceholder: 'Descreva suas conquistas mais importantes (quantifique quando possível)...',
    save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir',
    present: 'Presente',
    next: 'Próximo: Educação', prev: 'Anterior: Resumo',
  },
};

const emptyExp = (): WorkExperience => ({
  id: `exp-${Date.now()}`,
  jobTitle: '', company: '', location: '',
  startDate: '', endDate: '', isCurrent: false,
  description: '', achievements: '',
});

function ExperienceCard({
  exp, t, onEdit, onDelete,
}: { exp: WorkExperience; t: Record<string, string>; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="card-base p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Briefcase size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground">{exp.jobTitle || '—'}</div>
        <div className="text-xs text-muted-foreground">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {exp.startDate} — {exp.isCurrent ? t.present : exp.endDate || '—'}
        </div>
        {exp.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{exp.description}</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Editar">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Eliminar">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function ExperienceEditForm({
  exp, t, onSave, onCancel,
}: { exp: WorkExperience; t: Record<string, string>; onSave: (e: WorkExperience) => void; onCancel: () => void }) {
  const [form, setForm] = useState<WorkExperience>({ ...exp });
  const set = (field: keyof WorkExperience, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="card-base p-4 border-primary/40 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { field: 'jobTitle' as const, label: t.jobTitle, placeholder: 'Desarrollador Full Stack' },
          { field: 'company' as const, label: t.company, placeholder: 'TechSolutions LATAM' },
          { field: 'location' as const, label: t.location, placeholder: 'Buenos Aires, Argentina' },
        ].map(f => (
          <div key={`exp-field-${f.field}`} className={f.field === 'jobTitle' ? 'sm:col-span-2' : ''}>
            <label className="block text-xs font-semibold text-foreground mb-1">{f.label}</label>
            <input
              type="text"
              value={form[f.field] as string}
              onChange={e => set(f.field, e.target.value)}
              placeholder={f.placeholder}
              className="input-base text-sm"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.startDate}</label>
          <input type="month" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.endDate}</label>
          <input type="month" value={form.endDate} onChange={e => set('endDate', e.target.value)} disabled={form.isCurrent} className="input-base text-sm disabled:opacity-50" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            id={`current-${form.id}`}
            type="checkbox"
            checked={form.isCurrent}
            onChange={e => set('isCurrent', e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor={`current-${form.id}`} className="text-xs text-muted-foreground">{t.current}</label>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.description}</label>
          <RichTextEditor
            value={form.description}
            onChange={val => set('description', val)}
            placeholder={t.descPlaceholder}
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.achievements}</label>
          <RichTextEditor
            value={form.achievements}
            onChange={val => set('achievements', val)}
            placeholder={t.achPlaceholder}
            rows={2}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-muted transition-colors">{t.cancel}</button>
        <button onClick={() => onSave(form)} className="flex-1 py-2 text-sm font-bold btn-secondary rounded-lg">{t.save}</button>
      </div>
    </div>
  );
}

export default function ExperienceForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const handleSave = (exp: WorkExperience) => {
    const exists = cvData.experience.find(e => e.id === exp.id);
    const updated = exists
      ? cvData.experience.map(e => e.id === exp.id ? exp : e)
      : [...cvData.experience, exp];
    onUpdate({ experience: updated });
    setEditingId(null);
    setAddingNew(false);
  };

  const handleDelete = (id: string) => {
    onUpdate({ experience: cvData.experience.filter(e => e.id !== id) });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
      </div>

      <div className="flex flex-col gap-3">
        {cvData.experience.length === 0 && !addingNew && (
          <div className="card-base p-8 text-center">
            <Briefcase size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t.empty}</p>
          </div>
        )}

        {cvData.experience.map(exp => (
          editingId === exp.id ? (
            <ExperienceEditForm key={`exp-edit-${exp.id}`} exp={exp} t={t} onSave={handleSave} onCancel={() => setEditingId(null)} />
          ) : (
            <ExperienceCard key={`exp-card-${exp.id}`} exp={exp} t={t} onEdit={() => setEditingId(exp.id)} onDelete={() => handleDelete(exp.id)} />
          )
        ))}

        {addingNew && (
          <ExperienceEditForm key="exp-new" exp={emptyExp()} t={t} onSave={handleSave} onCancel={() => setAddingNew(false)} />
        )}
      </div>

      {!addingNew && (
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus size={16} />
          {t.add}
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={() => onSectionChange('summary')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">
          ← {t.prev}
        </button>
        <button onClick={() => onSectionChange('education')} className="flex-1 py-2.5 btn-secondary rounded-xl text-sm font-bold">
          {t.next} →
        </button>
      </div>
    </div>
  );
}