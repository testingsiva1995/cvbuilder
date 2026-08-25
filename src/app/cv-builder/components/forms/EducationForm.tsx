'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { CVData, Education } from '../cvData';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Educación', sub: 'Añade tu formación académica y certificaciones educativas.',
    add: 'Añadir educación', empty: 'Aún no has añadido formación académica.',
    degree: 'Título / Carrera', institution: 'Institución', location: 'Ubicación',
    startYear: 'Año de inicio', endYear: 'Año de fin', current: 'Actualmente estudiando aquí',
    gpa: 'Promedio / GPA (opcional)', description: 'Descripción',
    descPlaceholder: 'Actividades relevantes, especialización, tesis...',
    save: 'Guardar', cancel: 'Cancelar',
    next: 'Siguiente: Proyectos', prev: 'Anterior: Experiencia',
  },
  en: {
    title: 'Education', sub: 'Add your academic background and educational certifications.',
    add: 'Add education', empty: 'You haven\'t added any education yet.',
    degree: 'Degree / Program', institution: 'Institution', location: 'Location',
    startYear: 'Start year', endYear: 'End year', current: 'Currently studying here',
    gpa: 'GPA (optional)', description: 'Description',
    descPlaceholder: 'Relevant activities, specialization, thesis...',
    save: 'Save', cancel: 'Cancel',
    next: 'Next: Projects', prev: 'Previous: Experience',
  },
  pt: {
    title: 'Educação', sub: 'Adicione sua formação acadêmica e certificações educacionais.',
    add: 'Adicionar educação', empty: 'Você ainda não adicionou formação acadêmica.',
    degree: 'Grau / Curso', institution: 'Instituição', location: 'Localização',
    startYear: 'Ano de início', endYear: 'Ano de término', current: 'Atualmente estudando aqui',
    gpa: 'Média / GPA (opcional)', description: 'Descrição',
    descPlaceholder: 'Atividades relevantes, especialização, tese...',
    save: 'Salvar', cancel: 'Cancelar',
    next: 'Próximo: Projetos', prev: 'Anterior: Experiência',
  },
};

const emptyEdu = (): Education => ({
  id: `edu-${Date.now()}`,
  degree: '', institution: '', location: '',
  startYear: '', endYear: '', isCurrent: false,
  gpa: '', description: '',
});

export default function EducationForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<Education | null>(null);

  const openEdit = (edu: Education) => {
    setEditForm({ ...edu });
    setEditingId(edu.id);
  };

  const openNew = () => {
    setEditForm(emptyEdu());
    setAddingNew(true);
  };

  const handleSave = () => {
    if (!editForm) return;
    const exists = cvData.education.find(e => e.id === editForm.id);
    const updated = exists
      ? cvData.education.map(e => e.id === editForm.id ? editForm : e)
      : [...cvData.education, editForm];
    onUpdate({ education: updated });
    setEditingId(null);
    setAddingNew(false);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    onUpdate({ education: cvData.education.filter(e => e.id !== id) });
  };

  const set = (field: keyof Education, value: any) => {
    setEditForm(prev => prev ? { ...prev, [field]: value } : prev);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
      </div>

      <div className="flex flex-col gap-3">
        {cvData.education.length === 0 && !addingNew && (
          <div className="card-base p-8 text-center">
            <GraduationCap size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t.empty}</p>
          </div>
        )}

        {cvData.education.map(edu => (
          editingId === edu.id && editForm ? (
            <div key={`edu-edit-${edu.id}`} className="card-base p-4 border-primary/40 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">{t.degree}</label>
                  <input type="text" value={editForm.degree} onChange={e => set('degree', e.target.value)} placeholder="Ingeniería en Sistemas" className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t.institution}</label>
                  <input type="text" value={editForm.institution} onChange={e => set('institution', e.target.value)} placeholder="UTN" className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t.location}</label>
                  <input type="text" value={editForm.location} onChange={e => set('location', e.target.value)} placeholder="Buenos Aires" className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t.startYear}</label>
                  <input type="number" value={editForm.startYear} onChange={e => set('startYear', e.target.value)} placeholder="2018" className="input-base text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t.endYear}</label>
                  <input type="number" value={editForm.endYear} onChange={e => set('endYear', e.target.value)} placeholder="2022" disabled={editForm.isCurrent} className="input-base text-sm disabled:opacity-50" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input id={`edu-current-${editForm.id}`} type="checkbox" checked={editForm.isCurrent} onChange={e => set('isCurrent', e.target.checked)} className="w-4 h-4 accent-primary" />
                  <label htmlFor={`edu-current-${editForm.id}`} className="text-xs text-muted-foreground">{t.current}</label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t.gpa}</label>
                  <input type="text" value={editForm.gpa} onChange={e => set('gpa', e.target.value)} placeholder="8.5 / 10" className="input-base text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">{t.description}</label>
                  <textarea rows={2} value={editForm.description} onChange={e => set('description', e.target.value)} placeholder={t.descPlaceholder} className="input-base text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(null); setEditForm(null); }} className="flex-1 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-muted">{t.cancel}</button>
                <button onClick={handleSave} className="flex-1 py-2 text-sm font-bold btn-secondary rounded-lg">{t.save}</button>
              </div>
            </div>
          ) : (
            <div key={`edu-card-${edu.id}`} className="card-base p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <GraduationCap size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{edu.degree || '—'}</div>
                <div className="text-xs text-muted-foreground">{edu.institution}{edu.location ? ` · ${edu.location}` : ''}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{edu.startYear} — {edu.isCurrent ? 'Presente' : edu.endYear || '—'}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(edu)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(edu.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        ))}

        {addingNew && editForm && (
          <div className="card-base p-4 border-primary/40 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1">{t.degree}</label>
                <input type="text" value={editForm.degree} onChange={e => set('degree', e.target.value)} placeholder="Ingeniería en Sistemas" className="input-base text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">{t.institution}</label>
                <input type="text" value={editForm.institution} onChange={e => set('institution', e.target.value)} placeholder="UTN" className="input-base text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">{t.location}</label>
                <input type="text" value={editForm.location} onChange={e => set('location', e.target.value)} placeholder="Buenos Aires" className="input-base text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">{t.startYear}</label>
                <input type="number" value={editForm.startYear} onChange={e => set('startYear', e.target.value)} placeholder="2018" className="input-base text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">{t.endYear}</label>
                <input type="number" value={editForm.endYear} onChange={e => set('endYear', e.target.value)} placeholder="2022" disabled={editForm.isCurrent} className="input-base text-sm disabled:opacity-50" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input id="edu-new-current" type="checkbox" checked={editForm.isCurrent} onChange={e => set('isCurrent', e.target.checked)} className="w-4 h-4 accent-primary" />
                <label htmlFor="edu-new-current" className="text-xs text-muted-foreground">{t.current}</label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">{t.gpa}</label>
                <input type="text" value={editForm.gpa} onChange={e => set('gpa', e.target.value)} placeholder="8.5 / 10" className="input-base text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1">{t.description}</label>
                <textarea rows={2} value={editForm.description} onChange={e => set('description', e.target.value)} placeholder={t.descPlaceholder} className="input-base text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAddingNew(false); setEditForm(null); }} className="flex-1 py-2 text-sm font-semibold border border-border rounded-lg hover:bg-muted">{t.cancel}</button>
              <button onClick={handleSave} className="flex-1 py-2 text-sm font-bold btn-secondary rounded-lg">{t.save}</button>
            </div>
          </div>
        )}
      </div>

      {!addingNew && (
        <button onClick={openNew} className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus size={16} />
          {t.add}
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={() => onSectionChange('experience')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">← {t.prev}</button>
        <button onClick={() => onSectionChange('projects')} className="flex-1 py-2.5 btn-secondary rounded-xl text-sm font-bold">{t.next} →</button>
      </div>
    </div>
  );
}