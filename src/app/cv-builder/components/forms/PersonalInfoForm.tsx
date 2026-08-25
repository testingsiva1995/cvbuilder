'use client';
import React, { useRef } from 'react';
import { User, Upload, X } from 'lucide-react';
import { CVData, PersonalInfo } from '../cvData';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; cvData: CVData; onUpdate: (u: Partial<CVData>) => void; onSectionChange: (s: any) => void; }

const labels: Record<Lang, Record<string, string>> = {
  es: {
    title: 'Información Personal', sub: 'Tus datos de contacto e información básica.',
    photo: 'Foto de perfil', photoSub: 'JPG, PNG o WebP. Máximo 2MB. Opcional.',
    uploadPhoto: 'Subir foto', removePhoto: 'Eliminar',
    fullName: 'Nombre completo', profTitle: 'Título profesional',
    email: 'Correo electrónico', phone: 'Teléfono',
    country: 'País', city: 'Ciudad',
    linkedin: 'LinkedIn', linkedinSub: 'Ej: linkedin.com/in/tunombre',
    website: 'Sitio web / Portafolio', websiteSub: 'Ej: tuportafolio.com',
    nationality: 'Nacionalidad',
    next: 'Siguiente: Resumen Profesional',
  },
  en: {
    title: 'Personal Information', sub: 'Your contact details and basic information.',
    photo: 'Profile photo', photoSub: 'JPG, PNG or WebP. Maximum 2MB. Optional.',
    uploadPhoto: 'Upload photo', removePhoto: 'Remove',
    fullName: 'Full name', profTitle: 'Professional title',
    email: 'Email address', phone: 'Phone',
    country: 'Country', city: 'City',
    linkedin: 'LinkedIn', linkedinSub: 'E.g: linkedin.com/in/yourname',
    website: 'Website / Portfolio', websiteSub: 'E.g: yourportfolio.com',
    nationality: 'Nationality',
    next: 'Next: Professional Summary',
  },
  pt: {
    title: 'Informações Pessoais', sub: 'Seus dados de contato e informações básicas.',
    photo: 'Foto de perfil', photoSub: 'JPG, PNG ou WebP. Máximo 2MB. Opcional.',
    uploadPhoto: 'Enviar foto', removePhoto: 'Remover',
    fullName: 'Nome completo', profTitle: 'Título profissional',
    email: 'Endereço de e-mail', phone: 'Telefone',
    country: 'País', city: 'Cidade',
    linkedin: 'LinkedIn', linkedinSub: 'Ex: linkedin.com/in/seunome',
    website: 'Site / Portfólio', websiteSub: 'Ex: seuportfolio.com',
    nationality: 'Nacionalidade',
    next: 'Próximo: Resumo Profissional',
  },
};

export default function PersonalInfoForm({ lang, cvData, onUpdate, onSectionChange }: Props) {
  const t = labels[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const p = cvData.personal;

  const update = (field: keyof PersonalInfo, value: string) => {
    onUpdate({ personal: { ...p, [field]: value } });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) onUpdate({ photo: result });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onUpdate({ photo: undefined });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
      </div>

      {/* Photo upload */}
      <div className="card-base p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden border-2 border-border">
          {cvData.photo ? (
            <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={28} />
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground mb-0.5">{t.photo}</div>
          <div className="text-xs text-muted-foreground mb-2">{t.photoSub}</div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Upload size={12} />
              {t.uploadPhoto}
            </button>
            {cvData.photo && (
              <button
                onClick={handleRemovePhoto}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                <X size={12} />
                {t.removePhoto}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { field: 'fullName' as const, label: t.fullName, type: 'text', placeholder: 'Tu nombre completo', colSpan: true },
          { field: 'professionalTitle' as const, label: t.profTitle, type: 'text', placeholder: 'Desarrollador Full Stack', colSpan: true },
          { field: 'email' as const, label: t.email, type: 'email', placeholder: 'tu@email.com' },
          { field: 'phone' as const, label: t.phone, type: 'tel', placeholder: '+54 9 11 1234-5678' },
          { field: 'country' as const, label: t.country, type: 'text', placeholder: 'Argentina' },
          { field: 'city' as const, label: t.city, type: 'text', placeholder: 'Buenos Aires' },
          { field: 'nationality' as const, label: t.nationality, type: 'text', placeholder: 'Argentino/a' },
        ].map(field => (
          <div key={`pi-field-${field.field}`} className={field.colSpan ? 'sm:col-span-2' : ''}>
            <label htmlFor={`pi-${field.field}`} className="block text-sm font-semibold text-foreground mb-1.5">
              {field.label}
            </label>
            <input
              id={`pi-${field.field}`}
              type={field.type}
              value={p[field.field]}
              onChange={e => update(field.field, e.target.value)}
              placeholder={field.placeholder}
              className="input-base"
            />
          </div>
        ))}

        {/* LinkedIn */}
        <div>
          <label htmlFor="pi-linkedin" className="block text-sm font-semibold text-foreground mb-1.5">{t.linkedin}</label>
          <p className="text-xs text-muted-foreground mb-1">{t.linkedinSub}</p>
          <input
            id="pi-linkedin"
            type="url"
            value={p.linkedin}
            onChange={e => update('linkedin', e.target.value)}
            placeholder="linkedin.com/in/tunombre"
            className="input-base"
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="pi-website" className="block text-sm font-semibold text-foreground mb-1.5">{t.website}</label>
          <p className="text-xs text-muted-foreground mb-1">{t.websiteSub}</p>
          <input
            id="pi-website"
            type="url"
            value={p.website}
            onChange={e => update('website', e.target.value)}
            placeholder="tuportafolio.com"
            className="input-base"
          />
        </div>
      </div>

      <button
        onClick={() => onSectionChange('summary')}
        className="w-full py-3 btn-secondary rounded-xl text-sm font-bold mt-2"
      >
        {t.next} →
      </button>
    </div>
  );
}