'use client';
import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { CVData } from './cvData';
import CVTemplateModerno from './templates/CVTemplateModerno';
import CVTemplateATS from './templates/CVTemplateATS';
import CVTemplateEjecutivo from './templates/CVTemplateEjecutivo';
import CVTemplateClasico from './templates/CVTemplateClasico';
import CVTemplateCreativo from './templates/CVTemplateCreativo';

type Lang = 'es' | 'en' | 'pt';

interface Props {
  lang: Lang;
  cvData: CVData;
  onTemplateChange: (id: string) => void;
  onStyleChange: (updates: { accentColor?: string; fontStyle?: 'sans' | 'serif' | 'mono' | 'calibri'; fontSize?: string }) => void;
}

const templates = [
  { id: 'ats', nameEs: 'ATS Pro', nameEn: 'ATS Pro', namePt: 'ATS Pro', recommended: true },
  { id: 'moderno', nameEs: 'Moderno', nameEn: 'Modern', namePt: 'Moderno', recommended: false },
  { id: 'ejecutivo', nameEs: 'Ejecutivo', nameEn: 'Executive', namePt: 'Executivo', recommended: false },
  { id: 'clasico', nameEs: 'Clásico', nameEn: 'Classic', namePt: 'Clássico', recommended: false },
  { id: 'creativo', nameEs: 'Creativo', nameEn: 'Creative', namePt: 'Criativo', recommended: false },
];

const colorPresets = [
  { label: 'Azul', value: '#1B4F72' },
  { label: 'Verde', value: '#1A6B3C' },
  { label: 'Rojo', value: '#922B21' },
  { label: 'Morado', value: '#6C3483' },
  { label: 'Gris', value: '#2C3E50' },
  { label: 'Naranja', value: '#D35400' },
  { label: 'Teal', value: '#0E6655' },
  { label: 'Rosa', value: '#943126' },
];

const fontOptions: { value: 'sans' | 'serif' | 'mono' | 'calibri'; label: string; preview: string; fontFamily: string }[] = [
  { value: 'sans', label: 'Sans-serif', preview: 'Aa', fontFamily: 'system-ui, sans-serif' },
  { value: 'serif', label: 'Serif', preview: 'Aa', fontFamily: 'Georgia, serif' },
  { value: 'calibri', label: 'Calibri', preview: 'Aa', fontFamily: "'Calibri', 'Carlito', 'Trebuchet MS', sans-serif" },
  { value: 'mono', label: 'Mono', preview: 'Aa', fontFamily: 'monospace' },
];

const headerLabels: Record<Lang, { template: string; preview: string; recommended: string; colors: string; fonts: string; fontSize: string }> = {
  es: { template: 'Plantilla', preview: 'Vista previa', recommended: 'Recomendado', colors: 'Color de acento', fonts: 'Tipografía', fontSize: 'Tamaño de fuente (pt)' },
  en: { template: 'Template', preview: 'Preview', recommended: 'Recommended', colors: 'Accent colour', fonts: 'Font style', fontSize: 'Font size (pt)' },
  pt: { template: 'Modelo', preview: 'Visualização', recommended: 'Recomendado', colors: 'Cor de destaque', fonts: 'Tipografia', fontSize: 'Tamanho da fonte (pt)' },
};

function TemplateRenderer({ cvData }: { cvData: CVData }) {
  switch (cvData.templateId) {
    case 'ats': return <CVTemplateATS cvData={cvData} />;
    case 'moderno': return <CVTemplateModerno cvData={cvData} />;
    case 'ejecutivo': return <CVTemplateEjecutivo cvData={cvData} />;
    case 'clasico': return <CVTemplateClasico cvData={cvData} />;
    case 'creativo': return <CVTemplateCreativo cvData={cvData} />;
    default: return <CVTemplateModerno cvData={cvData} />;
  }
}

export default function CVPreviewPanel({ lang, cvData, onTemplateChange, onStyleChange }: Props) {
  const t = headerLabels[lang];

  const getName = (tpl: typeof templates[0]) =>
    lang === 'es' ? tpl.nameEs : lang === 'en' ? tpl.nameEn : tpl.namePt;

  const currentColor = cvData.accentColor || colorPresets[0].value;
  const currentFont = cvData.fontStyle || 'sans';

  // Numeric font size: stored as string like "11", "12", etc. Default 12
  const rawFontSize = cvData.fontSize as string | undefined;
  // Support legacy 'sm'/'md'/'lg' values
  const legacyMap: Record<string, number> = { sm: 10, md: 12, lg: 14 };
  const numericSize = rawFontSize && /^\d+$/.test(rawFontSize)
    ? parseInt(rawFontSize, 10)
    : legacyMap[rawFontSize || 'md'] ?? 12;

  const handleFontSizeChange = (val: number) => {
    const clamped = Math.min(18, Math.max(10, val));
    onStyleChange({ fontSize: String(clamped) });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Template switcher */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{t.template}</div>
        <div className="flex gap-1.5 flex-wrap">
          {templates.map(tpl => (
            <button
              key={`preview-tpl-${tpl.id}`}
              onClick={() => onTemplateChange(tpl.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                cvData.templateId === tpl.id
                  ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {cvData.templateId === tpl.id && <CheckCircle size={11} />}
              {getName(tpl)}
              {tpl.recommended && <span className="badge-green ml-0.5">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Colour options */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{t.colors}</div>
        <div className="flex gap-2 flex-wrap items-center">
          {colorPresets.map(preset => (
            <button
              key={`color-${preset.value}`}
              onClick={() => onStyleChange({ accentColor: preset.value })}
              title={preset.label}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                currentColor === preset.value ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
          {/* Custom colour picker */}
          <label className="relative cursor-pointer" title="Custom colour">
            <div
              className="w-6 h-6 rounded-full border-2 border-dashed border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground hover:border-primary transition-colors overflow-hidden"
              style={{ backgroundColor: colorPresets.some(c => c.value === currentColor) ? 'transparent' : currentColor }}
            >
              {colorPresets.some(c => c.value === currentColor) ? '+' : ''}
            </div>
            <input
              type="color"
              value={currentColor}
              onChange={e => onStyleChange({ accentColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* Font style options */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{t.fonts}</div>
        <div className="flex gap-2 flex-wrap">
          {fontOptions.map(opt => (
            <button
              key={`font-${opt.value}`}
              onClick={() => onStyleChange({ fontStyle: opt.value })}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border text-xs transition-all duration-150 ${
                currentFont === opt.value
                  ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <span
                className="text-base font-bold leading-none"
                style={{ fontFamily: opt.fontFamily }}
              >
                {opt.preview}
              </span>
              <span className="text-[9px]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font size — numeric input */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{t.fontSize}</div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleFontSizeChange(numericSize - 1)}
            disabled={numericSize <= 10}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-base font-bold text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-all"
          >
            −
          </button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={10}
              max={18}
              value={numericSize}
              onChange={e => handleFontSizeChange(parseInt(e.target.value, 10) || 12)}
              className="w-14 text-center border border-border rounded-lg px-2 py-1 text-sm font-semibold text-foreground bg-background focus:outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground">pt</span>
          </div>
          <button
            onClick={() => handleFontSizeChange(numericSize + 1)}
            disabled={numericSize >= 18}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-base font-bold text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-all"
          >
            +
          </button>
          <span className="text-xs text-muted-foreground ml-1">(10–18)</span>
        </div>
      </div>

      {/* CV preview area */}
      <div className="flex-1 overflow-hidden bg-muted/30 flex flex-col">
        <div className="text-xs font-medium text-muted-foreground py-2 text-center shrink-0">{t.preview}</div>
        {/* Scrollable preview wrapper */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
          <div
            style={{
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Scale wrapper: renders at 794px then scales down to fit container */}
            <div
              style={{
                width: '794px',
                transformOrigin: 'top left',
                transform: 'scale(var(--cv-preview-scale, 0.60))',
              }}
              className="cv-preview-scale-wrapper"
            >
              <div
                id="cv-preview-root"
                className="bg-white shadow-xl"
                style={{
                  width: '794px',
                  minHeight: '1123px',
                }}
              >
                <TemplateRenderer cvData={cvData} />
              </div>
            </div>
            {/* Spacer to account for scaled height */}
            <div className="cv-preview-spacer" style={{ pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      <style>{`
        /* Preview scale — responsive scaling */
        .cv-preview-scale-wrapper {
          --cv-preview-scale: 0.58;
        }
        @media (min-width: 1024px) {
          .cv-preview-scale-wrapper {
            --cv-preview-scale: 0.62;
          }
        }
        @media (min-width: 1280px) {
          .cv-preview-scale-wrapper {
            --cv-preview-scale: 0.68;
          }
        }
        @media (min-width: 1536px) {
          .cv-preview-scale-wrapper {
            --cv-preview-scale: 0.74;
          }
        }

        /* Spacer height = minHeight * scale */
        .cv-preview-spacer {
          height: calc(1123px * 0.58 + 8px);
        }
        @media (min-width: 1024px) {
          .cv-preview-spacer { height: calc(1123px * 0.62 + 8px); }
        }
        @media (min-width: 1280px) {
          .cv-preview-spacer { height: calc(1123px * 0.68 + 8px); }
        }
        @media (min-width: 1536px) {
          .cv-preview-spacer { height: calc(1123px * 0.74 + 8px); }
        }

        /* =====================================================
           RICH TEXT BULLET/LIST RENDERING
           ===================================================== */
        #cv-preview-root .cv-rich-content ul {
          list-style-type: disc !important;
          list-style-position: outside !important;
          padding-left: 20px !important;
          margin: 6px 0 !important;
          display: block !important;
          overflow: visible !important;
        }
        #cv-preview-root .cv-rich-content ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
          padding-left: 20px !important;
          margin: 6px 0 !important;
          display: block !important;
          overflow: visible !important;
        }
        #cv-preview-root .cv-rich-content li {
          display: list-item !important;
          margin: 2px 0 !important;
          padding-left: 3px !important;
          list-style: inherit !important;
          overflow: visible !important;
        }
        #cv-preview-root .cv-rich-content ul li {
          list-style-type: disc !important;
        }
        #cv-preview-root .cv-rich-content ol li {
          list-style-type: decimal !important;
        }
        #cv-preview-root .cv-rich-content p { margin: 0.15em 0; }
        #cv-preview-root .cv-rich-content strong { font-weight: 700; }
        #cv-preview-root .cv-rich-content em { font-style: italic; }
        #cv-preview-root .cv-rich-content u { text-decoration: underline; }
        #cv-preview-root .cv-rich-content a { color: inherit; text-decoration: underline; }

        /* =====================================================
           PAGE BOUNDARIES
           ===================================================== */
        #cv-preview-root {
          overflow: visible !important;
        }

        @media print {
          #cv-preview-root .cv-rich-content ul {
            list-style-type: disc !important;
            padding-left: 1.4em !important;
          }
          #cv-preview-root .cv-rich-content ol {
            list-style-type: decimal !important;
            padding-left: 1.4em !important;
          }
          #cv-preview-root .cv-rich-content li {
            display: list-item !important;
          }
        }
      `}</style>
    </div>
  );
}