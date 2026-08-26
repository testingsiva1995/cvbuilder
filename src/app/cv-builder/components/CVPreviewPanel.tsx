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

/* Page 1 starts with the header at the top.
 * Following pages have no repeated header/gap.
 * Keep a 3 cm protected bottom safety area.
 */
const CM_PX = 96 / 2.54;
const PAGE_TOP_MARGIN = 0;
const PAGE_BOTTOM_MARGIN = Math.round(3 * CM_PX);
const PAGE_CONTENT_HEIGHT =
  A4_HEIGHT - PAGE_BOTTOM_MARGIN;

/* ============================================================
   PAGE BREAK CALCULATOR
   ============================================================ */

/* ============================================================
   HIERARCHICAL A4 PAGE MAP
   ============================================================

   The CV is paginated as:

   section -> sub-block/entry -> rich-text item

   Rules:
   - 3 cm top and bottom are reserved on every page.
   - A normal section may contain many entries; entries move
     independently instead of moving the whole section.
   - A section marked data-cv-page-block is one indivisible block
     when it fits on a fresh page.
   - The first entry stays with its section heading.
   - An entry is kept together when it fits on a page.
   - Only an entry larger than the usable page can split, and then
     only at a protected rich-text boundary.
   - Preview and PDF use the exact same page-cut algorithm.
*/

function rectRelative(root: HTMLElement, el: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - rootRect.top,
    bottom: rect.bottom - rootRect.top,
    height: rect.height,
  };
}

function calculateContentHeight(root: HTMLElement): number {
  const body = root.querySelector(
    '[data-cv-body="true"]'
  ) as HTMLElement | null;

  if (!body) {
    return Math.max(1, Math.ceil(root.scrollHeight));
  }

  const rootRect = root.getBoundingClientRect();

  /*
   * IMPORTANT:
   * Use the bottom of the LAST REAL CV SECTION, not the body's
   * padding/min-height. This prevents an otherwise empty trailing
   * PDF/preview page.
   */
  const sections = Array.from(
    body.querySelectorAll(':scope > [data-cv-section]')
  ) as HTMLElement[];

  const visibleSections = sections.filter(
    (section) => section.getBoundingClientRect().height > 0
  );

  if (visibleSections.length) {
    const last = visibleSections[visibleSections.length - 1];
    const rect = last.getBoundingClientRect();
    return Math.max(
      1,
      Math.ceil(rect.bottom - rootRect.top)
    );
  }

  const bodyRect = body.getBoundingClientRect();
  return Math.max(
    1,
    Math.ceil(bodyRect.bottom - rootRect.top)
  );
}

type PageUnit = {
  top: number;
  bottom: number;
  hard: boolean;
  kind: 'section' | 'entry';
};

function buildPageUnits(root: HTMLElement): PageUnit[] {
  const body = root.querySelector(
    '[data-cv-body="true"]'
  ) as HTMLElement | null;

  if (!body) return [];

  const sections = Array.from(
    body.querySelectorAll(':scope > [data-cv-section]')
  ) as HTMLElement[];

  const units: PageUnit[] = [];

  for (const section of sections) {
    const sectionRect = rectRelative(root, section);
    if (sectionRect.height <= 0) continue;

    const hard = section.hasAttribute('data-cv-page-block');

    /*
     * Hard blocks are intentionally rare. Moderno uses one for the
     * two-column Skills/Languages/Certifications grid because splitting
     * the two-column grid creates a confusing visual result.
     */
    if (hard) {
      units.push({
        top: sectionRect.top,
        bottom: sectionRect.bottom,
        hard: true,
        kind: 'section',
      });
      continue;
    }

    const entries = Array.from(
      section.querySelectorAll(':scope [data-cv-entry]')
    ) as HTMLElement[];

    if (!entries.length) {
      units.push({
        top: sectionRect.top,
        bottom: sectionRect.bottom,
        hard: false,
        kind: 'section',
      });
      continue;
    }

    /* The first entry owns the section heading. */
    const first = rectRelative(root, entries[0]);
    units.push({
      top: sectionRect.top,
      bottom: first.bottom,
      hard: false,
      kind: 'entry',
    });

    for (let i = 1; i < entries.length; i++) {
      const entry = rectRelative(root, entries[i]);
      if (entry.height <= 0) continue;

      units.push({
        top: entry.top,
        bottom: entry.bottom,
        hard: false,
        kind: 'entry',
      });
    }
  }

  return units.sort((a, b) => a.top - b.top);
}

function getSafeBoundaries(
  root: HTMLElement,
  unit: PageUnit,
  pageStart: number,
  pageEnd: number
): number[] {
  const rootRect = root.getBoundingClientRect();
  const boundaries: number[] = [];

  const add = (value: number) => {
    const n = Math.round(value);

    if (
      n > pageStart + 30 &&
      n < pageEnd + 1 &&
      n > unit.top + 1 &&
      n < unit.bottom - 1
    ) {
      boundaries.push(n);
    }
  };

  const addElement = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const top = rect.top - rootRect.top;
    const bottom = rect.bottom - rootRect.top;

    /*
     * A cut is safe at the TOP or BOTTOM of a protected element.
     * Using both is important: if a bullet does not fit completely,
     * we can keep all previous bullets on page 1 and continue with the
     * next bullet on page 2.
     */
    add(top);
    add(bottom);
  };

  /* Individual CV entries. */
  root
    .querySelectorAll('[data-cv-entry]')
    .forEach((node) => {
      const el = node as HTMLElement;
      const rect = rectRelative(root, el);

      if (
        rect.top >= unit.top - 1 &&
        rect.bottom <= unit.bottom + 1
      ) {
        addElement(el);
      }
    });

  /* Rich-text paragraphs and list items. */
  root
    .querySelectorAll(
      '.cv-rich-content li, .cv-rich-content p'
    )
    .forEach((node) => {
      const el = node as HTMLElement;
      const rect = rectRelative(root, el);

      if (
        rect.top >= unit.top - 1 &&
        rect.bottom <= unit.bottom + 1
      ) {
        addElement(el);
      }
    });

  /* Headings are safe only at their TOP, never through their text. */
  root
    .querySelectorAll('h1,h2,h3,h4,h5,h6')
    .forEach((node) => {
      const el = node as HTMLElement;
      const rect = rectRelative(root, el);

      if (
        rect.top >= unit.top - 1 &&
        rect.top < unit.bottom - 1
      ) {
        add(rect.top);
      }
    });

  return Array.from(new Set(boundaries)).sort(
    (a, b) => a - b
  );
}

function calculatePageCuts(root: HTMLElement): number[] {
  const totalHeight = calculateContentHeight(root);

  if (totalHeight <= PAGE_CONTENT_HEIGHT) {
    return [0, totalHeight];
  }

  const units = buildPageUnits(root);

  if (!units.length) {
    const cuts = [0];
    let start = 0;

    while (start < totalHeight - 1) {
      const next = Math.min(
        start + PAGE_CONTENT_HEIGHT,
        totalHeight
      );

      if (next <= start) break;

      cuts.push(next);
      start = next;
    }

    return cuts;
  }

  const cuts = [0];
  let pageStart = 0;

  /*
   * IMPORTANT CHANGE:
   * Do NOT move an entire Job/Education/Project just because it does
   * not completely fit in the remaining space.
   *
   * We first try to fill the page with the LAST safe boundary before
   * A4's usable limit. Therefore a job can continue on page 2 with a
   * few bullets/lines instead of creating a huge white area on page 1.
   */
  while (pageStart < totalHeight - 1) {
    const nominalEnd = Math.min(
      pageStart + PAGE_CONTENT_HEIGHT,
      totalHeight
    );

    if (nominalEnd >= totalHeight - 1) {
      cuts.push(totalHeight);
      break;
    }

    const crossing = units.find(
      (unit) =>
        unit.top < nominalEnd - 1 &&
        unit.bottom > nominalEnd + 1
    );

    if (!crossing) {
      cuts.push(nominalEnd);
      pageStart = nominalEnd;
      continue;
    }

    /*
     * A hard block (currently the two-column skills grid) stays whole
     * when it fits on a fresh page. This is the one intentional case
     * where we prefer whitespace over a visually broken grid.
     */
    if (crossing.hard) {
      const hardHeight = crossing.bottom - crossing.top;

      if (
        hardHeight <= PAGE_CONTENT_HEIGHT &&
        crossing.top > pageStart + 30
      ) {
        const cut = Math.round(crossing.top);

        if (cut > pageStart) {
          cuts.push(cut);
          pageStart = cut;
          continue;
        }
      }
    }

    /*
     * For normal sections/entries, ALWAYS prefer the latest safe
     * internal boundary. This is what prevents large white spaces.
     */
    const safeBoundaries = getSafeBoundaries(
      root,
      crossing,
      pageStart,
      nominalEnd
    );

    if (safeBoundaries.length) {
      const cut = safeBoundaries[safeBoundaries.length - 1];

      if (cut > pageStart + 30) {
        cuts.push(cut);
        pageStart = cut;
        continue;
      }
    }

    /*
     * No safe internal boundary exists before the page edge.
     * If the crossing unit fits on a fresh page, move it as a last
     * resort. Otherwise use the A4 boundary; this only affects content
     * that has no safe break point at all.
     */
    const unitHeight = crossing.bottom - crossing.top;

    if (
      unitHeight <= PAGE_CONTENT_HEIGHT &&
      crossing.top > pageStart + 30
    ) {
      const cut = Math.round(crossing.top);
      cuts.push(cut);
      pageStart = cut;
      continue;
    }

    cuts.push(nominalEnd);
    pageStart = nominalEnd;
  }

  /*
   * Remove duplicates and any trailing empty/near-empty page.
   * A page with less than 12px of real content is not useful.
   */
  const cleaned = Array.from(
    new Set(
      cuts
        .map((n) =>
          Math.max(
            0,
            Math.min(totalHeight, Math.round(n))
          )
        )
    )
  )
    .sort((a, b) => a - b)
    .filter(
      (value, index, arr) =>
        index === 0 || value > arr[index - 1]
    );

  while (
    cleaned.length > 2 &&
    totalHeight - cleaned[cleaned.length - 2] < 12
  ) {
    cleaned.splice(cleaned.length - 2, 1);
  }

  return cleaned;
}
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
  const measureRef = useRef<HTMLDivElement | null>(null);

  const [pageCuts, setPageCuts] = useState<number[]>([
    0,
    A4_HEIGHT,
  ]);

  const [previewScale, setPreviewScale] = useState(0.58);

  /*
   * IMPORTANT:
   *
   * Preview does NOT create its own pagination.
   *
   * It uses the SAME calculatePageCuts() used by the PDF
   * pagination system.
   *
   * PDF:
   *   sourceTop = cuts[page] * PDF_SCALE
   *   sourceBottom = cuts[page + 1] * PDF_SCALE
   *
   * Preview:
   *   offset = cuts[page]
   *   visibleHeight = cuts[page + 1] - cuts[page]
   *
   * Therefore:
   *
   *       PREVIEW PAGE
   *            =
   *       PDF PAGE
   *
   * This is the important fix.
   */

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;

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

    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  /*
   * Re-measure whenever CV content/style/language changes.
   *
   * PDF waits for fonts before calculating its cuts.
   * Preview does the same so font-size/font-family changes
   * cannot create different page boundaries.
   */
  useEffect(() => {
    let cancelled = false;

    const measure = async () => {
      const root = measureRef.current;

      if (!root) return;

      /*
       * Wait for fonts exactly like the PDF renderer.
       */
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      /*
       * Give React/browser layout two frames to settle.
       */
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      if (cancelled) return;

      const cuts = calculatePageCuts(root);

      if (!cancelled) {
        setPageCuts(cuts);
      }
    };

    measure();

    const observer =
      typeof ResizeObserver !== 'undefined' &&
      measureRef.current
        ? new ResizeObserver(() => {
            measure();
          })
        : null;

    if (observer && measureRef.current) {
      observer.observe(measureRef.current);
    }

    window.addEventListener('resize', measure);

    return () => {
      cancelled = true;

      observer?.disconnect();

      window.removeEventListener('resize', measure);
    };
  }, [lang, cvData]);

  const pageCount = Math.max(
    1,
    pageCuts.length - 1
  );

  const scaledPageWidth =
    A4_WIDTH * previewScale;

  const scaledPageHeight =
    A4_HEIGHT * previewScale;

  return (
    <>
      {/* ============================================================
          HIDDEN MEASUREMENT COPY

          This is the exact same template structure used to calculate
          the PDF page cuts.
          ============================================================ */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-100000px',
          top: 0,
          width: `${A4_WIDTH}px`,
          minHeight: `${A4_HEIGHT}px`,
          background: '#ffffff',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <TemplateRenderer
          lang={lang}
          cvData={cvData}
        />
      </div>

      {/* ============================================================
          VISIBLE PREVIEW PAGE STACK
          ============================================================ */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          paddingTop: '4px',
          paddingBottom: '20px',
        }}
      >
        {Array.from(
          { length: pageCount },
          (_, pageIndex) => {
            /*
             * EXACT same boundaries used by PDF.
             */
            const pageStart =
              pageCuts[pageIndex] ?? 0;

            const pageEnd =
              pageCuts[pageIndex + 1] ??
              calculateContentHeight(
                measureRef.current as HTMLElement
              );

            /*
             * Content visible on this PDF page.
             *
             * PDF uses:
             *
             * sourceHeight =
             *   cuts[page + 1] - cuts[page]
             *
             * capped at PAGE_CONTENT_HEIGHT.
             *
             * Preview must use the same value.
             */
            const pageContentHeight = Math.min(
              Math.max(
                0,
                pageEnd - pageStart
              ),
              PAGE_CONTENT_HEIGHT
            );

            const scaledContentHeight =
              pageContentHeight *
              previewScale;

            return (
              <div
                key={`cv-preview-page-${pageIndex}`}
                style={{
                  width: `${scaledPageWidth}px`,
                  flex: '0 0 auto',
                }}
              >
                {/* ==================================================
                    PAGE NUMBER
                    ================================================== */}
                <div
                  style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    textAlign: 'center',
                    marginBottom: '6px',
                    fontFamily:
                      'system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {pageLabel}{' '}
                  {pageIndex + 1}{' '}
                  / {pageCount}
                </div>

                {/* ==================================================
                    REAL A4 PAGE
                    ================================================== */}
                <div
                  style={{
                    width: `${scaledPageWidth}px`,
                    height: `${scaledPageHeight}px`,
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#ffffff',
                    boxShadow:
                      '0 2px 12px rgba(0,0,0,0.14)',
                  }}
                >
                  {/* ==================================================
                      EXACT PDF CONTENT WINDOW

                      IMPORTANT:
                      The clipping height is NOT the whole A4 height.

                      It is exactly:

                      cuts[next] - cuts[current]

                      This prevents page 2 content from appearing
                      inside page 1 preview.
                      ================================================== */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: `${A4_WIDTH}px`,
                      height: `${pageContentHeight}px`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${A4_WIDTH}px`,
                        height: `${Math.max(
                          A4_HEIGHT,
                          pageStart +
                            pageContentHeight
                        )}px`,
                        transform:
                          `translateY(-${pageStart}px)`,
                        transformOrigin:
                          'top left',
                      }}
                    >
                      <TemplateRenderer
                        lang={lang}
                        cvData={cvData}
                      />
                    </div>
                  </div>

                  {/* ==================================================
                      REMAINING WHITE AREA

                      PDF pageCanvas starts white and only draws the
                      actual content height.

                      Preview therefore keeps the same white area.
                      ================================================== */}
                  {scaledContentHeight <
                    scaledPageHeight && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top:
                          scaledContentHeight,
                        bottom: 0,
                        background:
                          '#ffffff',
                        pointerEvents:
                          'none',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
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
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }

        #cv-preview-root,
        .cv-preview-page {
          box-sizing: border-box;
        }

        .cv-rich-content {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
        }

        .cv-rich-content p {
          margin: 0.15em 0 !important;
          max-width: 100% !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
        }

        .cv-rich-content ul,
        .cv-rich-content ol {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 5px 0 !important;
          padding: 0 !important;
          list-style: none !important;
          display: block !important;
        }

        .cv-rich-content ul li,
        .cv-rich-content ol li {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 2px 0 !important;
          padding-left: 19px !important;
          line-height: 1.35 !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .cv-rich-content ul li::before {
          content: '•';
          position: absolute;
          left: 0;
          top: 0.02em;
          width: 14px;
          text-align: center;
          font-size: 0.82em;
          line-height: 1.35;
          font-weight: 700;
        }

        .cv-rich-content ol {
          counter-reset: cv-list-item;
        }

        .cv-rich-content ol li {
          counter-increment: cv-list-item;
        }

        .cv-rich-content ol li::before {
          content: counter(cv-list-item) '.';
          position: absolute;
          left: 0;
          top: 0;
          width: 17px;
          text-align: right;
          font-size: 0.9em;
          line-height: 1.35;
          font-weight: 500;
        }

        .cv-rich-content li p {
          margin: 0 !important;
          padding: 0 !important;
        }

        .cv-rich-content li > ul,
        .cv-rich-content li > ol {
          margin-top: 3px !important;
          margin-bottom: 3px !important;
          margin-left: 2px !important;
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
          color: inherit !important;
          text-decoration: underline !important;
          pointer-events: auto !important;
          cursor: pointer !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .cv-rich-content img {
          max-width: 100% !important;
          height: auto !important;
        }

        .cv-preview-page {
          page-break-after: always;
          break-after: page;
        }

      `}</style>
    </div>
  );
}
