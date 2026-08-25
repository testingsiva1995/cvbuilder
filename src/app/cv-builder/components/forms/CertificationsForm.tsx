'use client';
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Award } from 'lucide-react';
import { CVData, Certification } from '../cvData';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Certificaciones', sub: 'Añade certificados profesionales, cursos y credenciales obtenidas.',
    add: 'Añadir certificación', empty: 'Aún no has añadido certificaciones.',
    name: 'Nombre de la certificación', issuer: 'Organización emisora',
    issueDate: 'Fecha de emisión', expiryDate: 'Fecha de vencimiento (opcional)',
    credentialId: 'ID de credencial', credentialUrl: 'URL de verificación',
    save: 'Guardar', cancel: 'Cancelar',
    next: 'Siguiente: Logros', prev: 'Anterior: Idiomas',
  },
  en: {
    title: 'Certifications', sub: 'Add professional certificates, courses and obtained credentials.',
    add: 'Add certification', empty: 'You haven\'t added any certifications yet.',
    name: 'Certification name', issuer: 'Issuing organization',
    issueDate: 'Issue date', expiryDate: 'Expiry date (optional)',
    credentialId: 'Credential ID', credentialUrl: 'Verification URL',
    save: 'Save', cancel: 'Cancel',
    next: 'Next: Achievements', prev: 'Previous: Languages',
  },
  pt: {
    title: 'Certificações', sub: 'Adicione certificados profissionais, cursos e credenciais obtidas.',
    add: 'Adicionar certificação', empty: 'Você ainda não adicionou certificações.',
    name: 'Nome da certificação', issuer: 'Organização emissora',
    issueDate: 'Data de emissão', expiryDate: 'Data de vencimento (opcional)',
    credentialId: 'ID da credencial', credentialUrl: 'URL de verificação',
    save: 'Salvar', cancel: 'Cancelar',
    next: 'Próximo: Conquistas', prev: 'Anterior: Idiomas',
  },
};

const emptyCert = (): Certification => ({
  id: `cert-${Date.now()}`,
  name: '', issuer: '', issueDate: '',
  expiryDate: '', credentialId: '', credentialUrl: '',
});

export default function CertificationsForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editForm, setEditForm] = useState<Certification | null>(null);

  const set = (field: keyof Certification, value: string) =>
    setEditForm(prev => prev ? { ...prev, [field]: value } : prev);

  const handleSave = () => {
    if (!editForm) return;
    const exists = cvData.certifications.find(c => c.id === editForm.id);
    const updated = exists
      ? cvData.certifications.map(c => c.id === editForm.id ? editForm : c)
      : [...cvData.certifications, editForm];
    onUpdate({ certifications: updated });
    setEditingId(null);
    setAddingNew(false);
    setEditForm(null);
  };

  const renderEditForm = (onCancel: () => void) => editForm && (
    <div className="card-base p-4 border-primary/40 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.name}</label>
          <input type="text" value={editForm.name} onChange={e => set('name', e.target.value)} placeholder="AWS Certified Developer" className="input-base text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-foreground mb-1">{t.issuer}</label>
          <input type="text" value={editForm.issuer} onChange={e => set('issuer', e.target.value)} placeholder="Amazon Web Services" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.issueDate}</label>
          <input type="month" value={editForm.issueDate} onChange={e => set('issueDate', e.target.value)} className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.expiryDate}</label>
          <input type="month" value={editForm.expiryDate} onChange={e => set('expiryDate', e.target.value)} className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.credentialId}</label>
          <input type="text" value={editForm.credentialId} onChange={e => set('credentialId', e.target.value)} placeholder="AWS-DEV-2024" className="input-base text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">{t.credentialUrl}</label>
          <input type="url" value={editForm.credentialUrl} onChange={e => set('credentialUrl', e.target.value)} placeholder="aws.amazon.com/verify" className="input-base text-sm" />
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
        {cvData.certifications.length === 0 && !addingNew && (
          <div className="card-base p-8 text-center">
            <Award size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t.empty}</p>
          </div>
        )}
        {cvData.certifications.map(cert => (
          editingId === cert.id ? (
            <React.Fragment key={`cert-edit-${cert.id}`}>
              {renderEditForm(() => { setEditingId(null); setEditForm(null); })}
            </React.Fragment>
          ) : (
            <div key={`cert-card-${cert.id}`} className="card-base p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Award size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{cert.name || '—'}</div>
                <div className="text-xs text-muted-foreground">{cert.issuer}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{cert.issueDate}{cert.expiryDate ? ` — ${cert.expiryDate}` : ''}{cert.credentialId ? ` · ID: ${cert.credentialId}` : ''}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditForm({ ...cert }); setEditingId(cert.id); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                <button onClick={() => onUpdate({ certifications: cvData.certifications.filter(c => c.id !== cert.id) })} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        ))}
        {addingNew && renderEditForm(() => { setAddingNew(false); setEditForm(null); })}
      </div>

      {!addingNew && (
        <button onClick={() => { setEditForm(emptyCert()); setAddingNew(true); }} className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          <Plus size={16} />
          {t.add}
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={() => onSectionChange('languages')} className="flex-1 py-2.5 btn-ghost rounded-xl text-sm font-semibold border border-border">← {t.prev}</button>
        <button onClick={() => onSectionChange('achievements')} className="flex-1 py-2.5 btn-secondary rounded-xl text-sm font-bold">{t.next} →</button>
      </div>
    </div>
  );
}