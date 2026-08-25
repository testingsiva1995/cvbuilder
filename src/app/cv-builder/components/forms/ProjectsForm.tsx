'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { CVData, Project } from '../cvData';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Proyectos', sub: 'Muestra proyectos personales, freelance o académicos relevantes.',
    add: 'Añadir proyecto', empty: 'Aún no has añadido proyectos.',
    name: 'Nombre del proyecto', role: 'Tu rol', description: 'Descripción',
    technologies: 'Tecnologías / Herramientas', url: 'URL del proyecto',
    startDate: 'Fecha de inicio', endDate: 'Fecha de fin',
    descPlaceholder: 'Describe el proyecto, su impacto y tus responsabilidades...',
    techPlaceholder: 'React, Node.js, PostgreSQL...',
    save: 'Guardar', cancel: 'Cancelar',
    next: 'Siguiente: Habilidades', prev: 'Anterior: Educación',
  },
  en: {
    title: 'Projects', sub: 'Showcase relevant personal, freelance or academic projects.',
    add: 'Add project', empty: 'You haven\'t added any projects yet.',
    name: 'Project name', role: 'Your role', description: 'Description',
    technologies: 'Technologies / Tools', url: 'Project URL',
    startDate: 'Start date', endDate: 'End date',
    descPlaceholder: 'Describe the project, its impact and your responsibilities...',
    techPlaceholder: 'React, Node.js, PostgreSQL...',
    save: 'Save', cancel: 'Cancel',
    next: 'Next: Skills', prev: 'Previous: Education',
  },
  pt: {
    title: 'Projetos', sub: 'Mostre projetos pessoais, freelance ou acadêmicos relevantes.',
    add: 'Adicionar projeto', empty: 'Você ainda não adicionou projetos.',
    name: 'Nome do projeto', role: 'Seu papel', description: 'Descrição',
    technologies: 'Tecnologias / Ferramentas', url: 'URL do projeto',
    startDate: 'Data de início', endDate: 'Data de término',
    descPlaceholder: 'Descreva o projeto, seu impacto e suas responsabilidades...',
    techPlaceholder: 'React, Node.js, PostgreSQL...',
    save: 'Salvar', cancel: 'Cancelar',
    next: 'Próximo: Habilidades', prev: 'Anterior: Educação',
  },
};

const emptyProj = (): Project => ({
  id: `proj-${Date.now()}`,
  name: '', role: '', description: '',
  technologies: '', url: '',
  startDate: '', endDate: '',
});

export default function ProjectsForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<Project | null>(null);

  const set = (field: keyof Project, value: string) => setEditForm(prev => prev ? { ...prev, [field]: value } : prev);

  const handleSave = () => {
    if (!editForm) return;
    const exists = cvData.projects.find(p => p.id === editForm.id);
    const updated = exists
      ? cvData.projects.map(p => p.id === editForm.id ? editForm : p)
      : [...cvData.projects, editForm];
    onUpdate({ projects: updated });
    setEditingId(null);
    setAddingNew(false);
    setEditForm(null);
  };

  const renderEditForm = (onCancel: () => void) => editForm && (
    <div className="card-base p-4 border-primary/40 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.name}</label>
          <input type="text" value={editForm.name} onChange={e => set('name', e.target.value)} placeholder="BuscaCerca CV Builder" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.role}</label>
          <input type="text" value={editForm.role} onChange={e => set('role', e.target.value)} placeholder="Full Stack Developer" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.url}</label>
          <input type="url" value={editForm.url} onChange={e => set('url', e.target.value)} placeholder="github.com/user/project" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.startDate}</label>
          <input type="month" value={editForm.startDate} onChange={e => set('startDate', e.target.value)} className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.endDate}</label>
          <input type="month" value={editForm.endDate} onChange={e => set('endDate', e.target.value)} className="input-base text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.technologies}</label>
          <input type="text" value={editForm.technologies} onChange={e => set('technologies', e.target.value)} placeholder={t.techPlaceholder} className="input-base text-sm" />
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
        {cvData.projects.length === 0 && !addingNew && (
          <div className="card-base p-8 text-center">
            <FolderOpen size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t.empty}</p>
          </div>
        )}

        {cvData.projects.map(proj => (
          editingId === proj.id ? (
            <React.Fragment key={`proj-edit-${proj.id}`}>
              {renderEditForm(() => { setEditingId(null); setEditForm(null); })}
            </React.Fragment>
          ) : (
            <div key={`proj-card-${proj.id}`} className="card-base p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FolderOpen size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{proj.name || '—'}</div>
                <div className="text-xs text-muted-foreground">{proj.role}{proj.technologies ? ` · ${proj.technologies}` : ''}</div>
                {proj.url && <div className="text-xs text-primary mt-0.5 truncate">{proj.url}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditForm({ ...proj }); setEditingId(proj.id); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                <button onClick={() => onUpdate({ projects: cvData.projects.filter(p => p.id !== proj.id) })} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        ))}

        {addingNew && renderEditForm(() => { setAddingNew(false); setEditForm(null); })}
      </div>

      {!addingNew && (
        <button onClick={() => { setEditForm(emptyProj()); setAddingNew(true); }} className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus size={16} />
          {t.add}
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={() => onSectionChange('education')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">← {t.prev}</button>
        <button onClick={() => onSectionChange('skills')} className="flex-1 py-2.5 btn-secondary rounded-xl text-sm font-bold">{t.next} →</button>
      </div>
    </div>
  );
}