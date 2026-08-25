'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

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

  onStyleChange: (updates: {
    accentColor?: string;
    fontStyle?: 'sans' | 'serif' | 'mono' | 'calibri';
    fontSize?: string;
  }) => void;
}

/* ============================================================
   TEMPLATE LIST
   ============================================================ */

const templates = [
  {
    id: 'ats',
    nameEs: 'ATS Pro',
    nameEn: 'ATS Pro',
    namePt: 'ATS Pro',
    recommended: true,
  },
  {
    id: 'moderno',
    nameEs: 'Moderno',
    nameEn: 'Modern',
    namePt: 'Moderno',
    recommended: false,
  },
  {
    id: 'ejecutivo',
    nameEs: 'Ejecutivo',
    nameEn: 'Executive',
    namePt: 'Executivo',
    recommended: false,
  },
  {
    id: 'clasico',
    nameEs: 'Clásico',
    nameEn: 'Classic',
    namePt: 'Clássico',
    recommended: false,
  },
  {
    id: 'creativo',
    nameEs: 'Creativo',
    nameEn: 'Creative',
    namePt: 'Criativo',
    recommended: false,
  },
];

/* ============================================================
   COLORS
   ============================================================ */

const colorPresets = [
  {
    label: 'Azul',
    value: '#1B4F72',
  },
  {
    label: 'Verde',
    value: '#1A6B3C',
  },
  {
    label: 'Rojo',
    value: '#922B21',
  },
  {
    label: 'Morado',
    value: '#6C3483',
  },
  {
    label: 'Gris',
    value: '#2C3E50',
  },
  {
    label: 'Naranja',
    value: '#D35400',
  },
  {
    label: 'Teal',
    value: '#0E6655',
  },
  {
    label: 'Rosa',
    value: '#943126',
  },
];

/* ============================================================
   FONTS
   ============================================================ */

const fontOptions: {
  value:
    | 'sans'
    | 'serif'
    | 'mono'
    | 'calibri';

  label: string;
  preview: string;
  fontFamily: string;
}[] = [
  {
    value: 'sans',
    label: 'Sans-serif',
    preview: 'Aa',
    fontFamily:
      'system-ui, sans-serif',
  },
  {
    value: 'serif',
    label: 'Serif',
    preview: 'Aa',
    fontFamily:
      'Georgia, serif',
  },
  {
    value: 'calibri',
    label: 'Calibri',
    preview: 'Aa',
    fontFamily:
      "'Calibri', 'Carlito', 'Trebuchet MS', sans-serif",
  },
  {
    value: 'mono',
    label: 'Mono',
    preview: 'Aa',
    fontFamily:
      'monospace',
  },
];

/* ============================================================
   UI TRANSLATIONS
   ============================================================ */

const headerLabels: Record<
  Lang,
  {
    template: string;
    preview: string;
    recommended: string;
    colors: string;
    fonts: string;
    fontSize: string;
    page: string;
  }
> = {
  es: {
    template: 'Plantilla',
    preview: 'Vista previa',
    recommended: 'Recomendado',
    colors: 'Color de acento',
    fonts: 'Tipografía',
    fontSize:
      'Tamaño de fuente (pt)',
    page: 'Página',
  },

  en: {
    template: 'Template',
    preview: 'Preview',
    recommended: 'Recommended',
    colors: 'Accent colour',
    fonts: 'Font style',
    fontSize:
      'Font size (pt)',
    page: 'Page',
  },

  pt: {
    template: 'Modelo',
    preview: 'Visualização',
    recommended: 'Recomendado',
    colors: 'Cor de destaque',
    fonts: 'Tipografia',
    fontSize:
      'Tamanho da fonte (pt)',
    page: 'Página',
  },
};

/* ============================================================
   A4 CONSTANTS
   ============================================================ */

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

/* ============================================================
   PAGE BREAK CALCULATOR
   ============================================================ */

/*
 * The Modern template already marks individual entries with:
 *
 * breakInside: 'avoid'
 * pageBreakInside: 'avoid'
 *
 * We also treat the main body sections as blocks.
 *
 * This means a page will preferably end:
 *
 *   Summary
 *   Experience
 *   Education
 *
 * instead of:
 *
 *   Certifications heading
 *   ---- page break ----
 *   Certification item
 */

function calculatePageCuts(
  root: HTMLElement,
  pageHeight = A4_HEIGHT
): number[] {
  const totalHeight = Math.max(
    pageHeight,
    Math.ceil(root.scrollHeight)
  );

  if (totalHeight <= pageHeight) {
    return [0, totalHeight];
  }

  const cuts: number[] = [0];

  /*
   * Modern structure:
   *
   * root
   *  ├── header
   *  └── body
   *       ├── summary
   *       ├── experience
   *       ├── education
   *       ├── skills/languages/certs
   *       ├── projects
   *       └── achievements
   */

  const body =
    root.children.length > 1
      ? (root.children[1] as HTMLElement)
      : null;

  const candidates: number[] = [];

  if (body) {
    const rootRect =
      root.getBoundingClientRect();

    Array.from(
      body.children
    ).forEach((child) => {
      const element =
        child as HTMLElement;

      const rect =
        element.getBoundingClientRect();

      const bottom =
        rect.bottom -
        rootRect.top;

      if (
        bottom > 50 &&
        bottom < totalHeight
      ) {
        candidates.push(
          Math.round(bottom)
        );
      }
    });
  }

  /*
   * Fallback candidates from elements that explicitly
   * request break-inside avoidance.
   */

  const avoidElements =
    Array.from(
      root.querySelectorAll(
        '*'
      )
    ) as HTMLElement[];

  const rootRect =
    root.getBoundingClientRect();

  avoidElements.forEach(
    (element) => {
      const style =
        window.getComputedStyle(
          element
        );

      const breakInside =
        style.breakInside ||
        style.pageBreakInside;

      if (
        breakInside === 'avoid'
      ) {
        const rect =
          element.getBoundingClientRect();

        const bottom =
          rect.bottom -
          rootRect.top;

        if (
          bottom > 50 &&
          bottom < totalHeight
        ) {
          candidates.push(
            Math.round(bottom)
          );
        }
      }
    }
  );

  /*
   * List items should never be split halfway through
   * a bullet.
   */

  root
    .querySelectorAll(
      '.cv-rich-content li'
    )
    .forEach((element) => {
      const rect =
        (
          element as HTMLElement
        ).getBoundingClientRect();

      const bottom =
        rect.bottom -
        rootRect.top;

      if (
        bottom > 50 &&
        bottom < totalHeight
      ) {
        candidates.push(
          Math.round(bottom)
        );
      }
    });

  const uniqueCandidates =
    Array.from(
      new Set(candidates)
    ).sort(
      (a, b) => a - b
    );

  let start = 0;

  while (
    start + pageHeight <
    totalHeight
  ) {
    const target =
      start + pageHeight;

    /*
     * Prefer a section boundary.
     */

    let safeCut =
      uniqueCandidates
        .filter(
          (value) =>
            value > start + 80 &&
            value <= target
        )
        .pop();

    /*
     * If no safe boundary exists,
     * use the exact A4 boundary.
     */

    if (
      !safeCut ||
      safeCut <= start
    ) {
      safeCut = target;
    }

    cuts.push(
      Math.min(
        safeCut,
        totalHeight
      )
    );

    start = safeCut;
  }

  if (
    cuts[cuts.length - 1] !==
    totalHeight
  ) {
    cuts.push(totalHeight);
  }

  return cuts;
}

/* ============================================================
   TEMPLATE RENDERER
   ============================================================ */

function TemplateRenderer({
  lang,
  cvData,
}: {
  lang: Lang;
  cvData: CVData;
}) {
  switch (
    cvData.templateId
  ) {
    case 'ats':
      return (
        <CVTemplateATS
          cvData={cvData}
        />
      );

    case 'moderno':
      return (
        <CVTemplateModerno
          lang={lang}
          cvData={cvData}
        />
      );

    case 'ejecutivo':
      return (
        <CVTemplateEjecutivo
          cvData={cvData}
        />
      );

    case 'clasico':
      return (
        <CVTemplateClasico
          cvData={cvData}
        />
      );

    case 'creativo':
      return (
        <CVTemplateCreativo
          cvData={cvData}
        />
      );

    default:
      return (
        <CVTemplateModerno
          lang={lang}
          cvData={cvData}
        />
      );
  }
}

/* ============================================================
   PAGED CV PREVIEW
   ============================================================ */

function PagedCVPreview({
  lang,
  cvData,
  pageLabel,
}: {
  lang: Lang;
  cvData: CVData;
  pageLabel: string;
}) {
  const measureRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [pageCuts, setPageCuts] =
    useState<number[]>([
      0,
      A4_HEIGHT,
    ]);

  const [
    previewScale,
    setPreviewScale,
  ] = useState(0.58);

  /*
   * Responsive preview scale.
   */

  useEffect(() => {
    const updateScale = () => {
      const width =
        window.innerWidth;

      if (width >= 1536) {
        setPreviewScale(0.74);
      } else if (width >= 1280) {
        setPreviewScale(0.68);
      } else if (width >= 1024) {
        setPreviewScale(0.62);
      } else {
        setPreviewScale(0.58);
      }
    };

    updateScale();

    window.addEventListener(
      'resize',
      updateScale
    );

    return () =>
      window.removeEventListener(
        'resize',
        updateScale
      );
  }, []);

  /*
   * Measure the real CV height.
   */

  useEffect(() => {
    const measure = () => {
      const root =
        measureRef.current;

      if (!root) return;

      const cuts =
        calculatePageCuts(
          root,
          A4_HEIGHT
        );

      setPageCuts(cuts);
    };

    const timer =
      window.setTimeout(
        measure,
        150
      );

    let observer:
      | ResizeObserver
      | null = null;

    if (
      typeof ResizeObserver !==
      'undefined' &&
      measureRef.current
    ) {
      observer =
        new ResizeObserver(
          measure
        );

      observer.observe(
        measureRef.current
      );
    }

    window.addEventListener(
      'resize',
      measure
    );

    return () => {
      window.clearTimeout(
        timer
      );

      observer?.disconnect();

      window.removeEventListener(
        'resize',
        measure
      );
    };
  }, [
    lang,
    cvData,
  ]);

  const pageCount =
    Math.max(
      1,
      pageCuts.length - 1
    );

  const stackHeight =
    pageCount *
      A4_HEIGHT *
      previewScale +
    (pageCount - 1) * 18;

  return (
    <>
      {/* Hidden measurement copy */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position:
            'absolute',
          left:
            '-100000px',
          top: 0,
          width:
            `${A4_WIDTH}px`,
          minHeight:
            `${A4_HEIGHT}px`,
          background:
            '#ffffff',
          visibility:
            'hidden',
          pointerEvents:
            'none',
        }}
      >
        <TemplateRenderer
          lang={lang}
          cvData={cvData}
        />
      </div>

      {/* Visible pages */}
      <div
        style={{
          width:
            `${A4_WIDTH}px`,
          transform:
            `scale(${previewScale})`,
          transformOrigin:
            'top left',
        }}
      >
        <div
          style={{
            width:
              `${A4_WIDTH}px`,
          }}
        >
          {Array.from(
            {
              length:
                pageCount,
            },
            (_, pageIndex) => {
              const offset =
                pageCuts[
                  pageIndex
                ] ?? 0;

              return (
                <div
                  key={`cv-preview-page-${pageIndex}`}
                  style={{
                    width:
                      `${A4_WIDTH}px`,
                    marginBottom:
                      pageIndex <
                      pageCount - 1
                        ? '18px'
                        : '0',
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        '12px',
                      color:
                        '#6b7280',
                      textAlign:
                        'center',
                      marginBottom:
                        '6px',
                      fontFamily:
                        'system-ui, sans-serif',
                    }}
                  >
                    {pageLabel}{' '}
                    {pageIndex +
                      1}{' '}
                    /{' '}
                    {pageCount}
                  </div>

                  <div
                    style={{
                      width:
                        `${A4_WIDTH}px`,
                      height:
                        `${A4_HEIGHT}px`,
                      overflow:
                        'hidden',
                      background:
                        '#ffffff',
                      boxShadow:
                        '0 4px 16px rgba(0,0,0,0.12)',
                      position:
                        'relative',
                    }}
                  >
                    <div
                      style={{
                        width:
                          `${A4_WIDTH}px`,
                        minHeight:
                          `${A4_HEIGHT}px`,
                        transform:
                          `translateY(-${offset}px)`,
                        transformOrigin:
                          'top left',
                      }}
                    >
                      <TemplateRenderer
                        lang={lang}
                        cvData={
                          cvData
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Spacer because transform does not affect layout */}
      <div
        style={{
          height:
            `${stackHeight}px`,
          pointerEvents:
            'none',
        }}
      />
    </>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function CVPreviewPanel({
  lang,
  cvData,
  onTemplateChange,
  onStyleChange,
}: Props) {
  const t =
    headerLabels[lang];

  const getName = (
    tpl: (typeof templates)[0]
  ) => {
    if (lang === 'es') {
      return tpl.nameEs;
    }

    if (lang === 'en') {
      return tpl.nameEn;
    }

    return tpl.namePt;
  };

  const currentColor =
    cvData.accentColor ||
    colorPresets[0].value;

  const currentFont =
    cvData.fontStyle ||
    'sans';

  const rawFontSize =
    cvData.fontSize as
      | string
      | undefined;

  const legacyMap: Record<
    string,
    number
  > = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const numericSize =
    rawFontSize &&
    /^\d+$/.test(
      rawFontSize
    )
      ? parseInt(
          rawFontSize,
          10
        )
      : legacyMap[
          rawFontSize || 'md'
        ] ?? 12;

  const handleFontSizeChange =
    (value: number) => {
      const clamped =
        Math.min(
          18,
          Math.max(
            10,
            value
          )
        );

      onStyleChange({
        fontSize:
          String(clamped),
      });
    };

  return (
    <div className="flex flex-col h-full">

      {/* TEMPLATE */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          {t.template}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {templates.map(
            (tpl) => (
              <button
                key={
                  `preview-tpl-${tpl.id}`
                }
                onClick={() =>
                  onTemplateChange(
                    tpl.id
                  )
                }
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                  cvData.templateId ===
                  tpl.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {cvData.templateId ===
                  tpl.id && (
                  <CheckCircle
                    size={11}
                  />
                )}

                {getName(tpl)}

                {tpl.recommended && (
                  <span className="badge-green ml-0.5">
                    ✓
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* COLOURS */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          {t.colors}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {colorPresets.map(
            (preset) => (
              <button
                key={
                  `color-${preset.value}`
                }
                onClick={() =>
                  onStyleChange({
                    accentColor:
                      preset.value,
                  })
                }
                title={
                  preset.label
                }
                className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                  currentColor ===
                  preset.value
                    ? 'border-foreground scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{
                  backgroundColor:
                    preset.value,
                }}
              />
            )
          )}

          <label
            className="relative cursor-pointer"
            title="Custom colour"
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-dashed border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground overflow-hidden"
              style={{
                backgroundColor:
                  colorPresets.some(
                    (c) =>
                      c.value ===
                      currentColor
                  )
                    ? 'transparent'
                    : currentColor,
              }}
            >
              {colorPresets.some(
                (c) =>
                  c.value ===
                  currentColor
              )
                ? '+'
                : ''}
            </div>

            <input
              type="color"
              value={
                currentColor
              }
              onChange={(e) =>
                onStyleChange({
                  accentColor:
                    e.target
                      .value,
                })
              }
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {/* FONT */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          {t.fonts}
        </div>

        <div className="flex gap-2 flex-wrap">
          {fontOptions.map(
            (option) => (
              <button
                key={
                  `font-${option.value}`
                }
                onClick={() =>
                  onStyleChange({
                    fontStyle:
                      option.value,
                  })
                }
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border text-xs transition-all duration-150 ${
                  currentFont ===
                  option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <span
                  className="text-base font-bold leading-none"
                  style={{
                    fontFamily:
                      option.fontFamily,
                  }}
                >
                  {
                    option.preview
                  }
                </span>

                <span className="text-[9px]">
                  {
                    option.label
                  }
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* FONT SIZE */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
          {t.fontSize}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              handleFontSizeChange(
                numericSize - 1
              )
            }
            disabled={
              numericSize <=
              10
            }
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-base font-bold text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30"
          >
            −
          </button>

          <div className="flex items-center gap-1">
            <input
              type="number"
              min={10}
              max={18}
              value={
                numericSize
              }
              onChange={(e) =>
                handleFontSizeChange(
                  parseInt(
                    e.target
                      .value,
                    10
                  ) || 12
                )
              }
              className="w-14 text-center border border-border rounded-lg px-2 py-1 text-sm font-semibold text-foreground bg-background focus:outline-none focus:border-primary"
            />

            <span className="text-xs text-muted-foreground">
              pt
            </span>
          </div>

          <button
            onClick={() =>
              handleFontSizeChange(
                numericSize + 1
              )
            }
            disabled={
              numericSize >=
              18
            }
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-base font-bold text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30"
          >
            +
          </button>

          <span className="text-xs text-muted-foreground">
            (10–18)
          </span>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="flex-1 overflow-hidden bg-muted/30 flex flex-col">
        <div className="text-xs font-medium text-muted-foreground py-2 text-center shrink-0">
          {t.preview}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">

          <div
            style={{
              width:
                '100%',
              position:
                'relative',
            }}
          >
            <PagedCVPreview
              lang={lang}
              cvData={cvData}
              pageLabel={
                t.page
              }
            />
          </div>

        </div>
      </div>

      {/* RICH TEXT / PAGE CSS */}
      <style>{`

        #cv-preview-root,
        .cv-preview-page {
          box-sizing: border-box;
        }

        .cv-rich-content ul {
          list-style-type: disc !important;
          list-style-position: outside !important;
          padding-left: 18px !important;
          margin: 6px 0 !important;
          display: block !important;
        }

        .cv-rich-content ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
          padding-left: 18px !important;
          margin: 6px 0 !important;
          display: block !important;
        }

        .cv-rich-content li {
          display: list-item !important;
          margin: 2px 0 !important;
          padding-left: 2px !important;
          list-style-position: outside !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .cv-rich-content ul li {
          list-style-type: disc !important;
        }

        .cv-rich-content ol li {
          list-style-type: decimal !important;
        }

        .cv-rich-content p {
          margin: 0.15em 0;
        }

        .cv-rich-content strong {
          font-weight: 700;
        }

        .cv-rich-content em {
          font-style: italic;
        }

        .cv-rich-content u {
          text-decoration: underline;
        }

        .cv-rich-content a {
          color: inherit;
          text-decoration: underline;
        }

        .cv-preview-page {
          page-break-after: always;
          break-after: page;
        }

      `}</style>
    </div>
  );
}
