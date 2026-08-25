'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react';
import { CVData, Achievement } from '../cvData';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Logros y Reconocimientos', sub: 'Añade premios, reconocimientos y logros destacados de tu carrera.',
    add: 'Añadir logro', empty: 'Aún no has añadido logros.',
    titleField: 'Título del logro', organization: 'Organización', date: 'Fecha', description: 'Descripción',
    descPlaceholder: 'Describe el logro y su importancia para tu carrera...',
    save: 'Guardar', cancel: 'Cancelar',
    prev: 'Anterior: Certificaciones', done: '✓ CV completado',
  },
  en: {
    title: 'Achievements & Awards', sub: 'Add awards, recognitions and outstanding career achievements.',
    add: 'Add achievement', empty: 'You haven\'t added any achievements yet.',
    titleField: 'Achievement title', organization: 'Organization', date: 'Date', description: 'Description',
    descPlaceholder: 'Describe the achievement and its importance to your career...',
    save: 'Save', cancel: 'Cancel',
    prev: 'Previous: Certifications', done: '✓ CV complete',
  },
  pt: {
    title: 'Conquistas e Reconhecimentos', sub: 'Adicione prêmios, reconhecimentos e conquistas destacadas da sua carreira.',
    add: 'Adicionar conquista', empty: 'Você ainda não adicionou conquistas.',
    titleField: 'Título da conquista', organization: 'Organização', date: 'Data', description: 'Descrição',
    descPlaceholder: 'Descreva a conquista e sua importância para sua carreira...',
    save: 'Salvar', cancel: 'Cancelar',
    prev: 'Anterior: Certificações', done: '✓ CV concluído',
  },
};

const emptyAch = (): Achievement => ({
  id: `ach-${Date.now()}`,
  title: '', organization: '', date: '', description: '',
});

export default function AchievementsForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<Achievement | null>(null);

  const set = (field: keyof Achievement, value: string) =>
    setEditForm(prev => prev ? { ...prev, [field]: value } : prev);

  const handleSave = () => {
    if (!editForm) return;
    const exists = cvData.achievements.find(a => a.id === editForm.id);
    const updated = exists
      ? cvData.achievements.map(a => a.id === editForm.id ? editForm : a)
      : [...cvData.achievements, editForm];
    onUpdate({ achievements: updated });
    setEditingId(null);
    setAddingNew(false);
    setEditForm(null);
  };

  const renderEditForm = (onCancel: () => void) => editForm && (
    <div className="card-base p-4 border-primary/40 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.titleField}</label>
          <input type="text" value={editForm.title} onChange={e => set('title', e.target.value)} placeholder="1er Lugar — Hackathon LATAM 2024" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.organization}</label>
          <input type="text" value={editForm.organization} onChange={e => set('organization', e.target.value)} placeholder="LATAM Tech Summit" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.date}</label>
          <input type="month" value={editForm.date} onChange={e => set('date', e.target.value)} className="input-base text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.description}</label>
          <textarea rows={3} value={editForm.description} onChange={e => set('description', e.target.value)} placeholder={t.descPlaceholder} className="input-base text-sm resize-none" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-muted">{t.cancel}</button>
        <button onClick={handleSave} className="flex-1 py-2 text-sm font-bold btn-secondary rounded-lg">{t.save}</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
      </div>

      <div className="flex flex-col gap-3">
        {cvData.achievements.length === 0 && !addingNew && (
          <div className="card-base p-8 text-center">
            <Trophy size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t.empty}</p>
          </div>
        )}
        {cvData.achievements.map(ach => (
          editingId === ach.id ? (
            <React.Fragment key={`ach-edit-${ach.id}`}>
              {renderEditForm(() => { setEditingId(null); setEditForm(null); })}
            </React.Fragment>
          ) : (
            <div key={`ach-card-${ach.id}`} className="card-base p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Trophy size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{ach.title || '—'}</div>
                <div className="text-xs text-muted-foreground">{ach.organization}{ach.date ? ` · ${ach.date}` : ''}</div>
                {ach.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ach.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditForm({ ...ach }); setEditingId(ach.id); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                <button onClick={() => onUpdate({ achievements: cvData.achievements.filter(a => a.id !== ach.id) })} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        ))}
        {addingNew && renderEditForm(() => { setAddingNew(false); setEditForm(null); })}
      </div>

      {!addingNew && (
        <button onClick={() => { setEditForm(emptyAch()); setAddingNew(true); }} className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus size={16} />
          {t.add}
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={() => onSectionChange('certifications')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">← {t.prev}</button>
        <button
          onClick={() => onSectionChange('personal')}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--secondary)' }}
        >
          {t.done}
        </button>
      </div>
    </div>
  );
}