'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CVBuilderSidebar from './CVBuilderSidebar';
import CVBuilderTopBar from './CVBuilderTopBar';
import CVSectionForm from './CVSectionForm';
import CVPreviewPanel from './CVPreviewPanel';
import { defaultCVData, CVData } from './cvData';

export type SectionKey =
  | 'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'languages' | 'certifications' | 'achievements';

type Lang = 'es' | 'en' | 'pt';

interface AuthUser {
  id: number;
  email: string;
  fullName: string;
}

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

/* A4 at 96 CSS dpi.
 * Page 1 starts with the CV header at the very top.
 * Following pages have NO repeated header and therefore no
 * artificial header gap. We keep a 3 cm protected bottom area.
 */
const CM_PX = 96 / 2.54;
const PAGE_TOP_MARGIN_PX = 0;
// Keep the 3 cm bottom safety area.
// Additional small safety buffer prevents the last text line,
// descenders, bullet dots, etc. from being clipped at the page cut.
const PAGE_CUT_SAFETY_PX = 12;

const PAGE_BOTTOM_MARGIN_PX = Math.round(3 * CM_PX);

const PAGE_CONTENT_HEIGHT_PX =
  A4_HEIGHT_PX -
  PAGE_BOTTOM_MARGIN_PX -
  PAGE_CUT_SAFETY_PX;

const PDF_SCALE = 2;

/* ============================================================
   HIERARCHICAL A4 PAGE MAP
   ============================================================

   The CV is paginated as:

   section -> sub-block/entry -> rich-text item

   Rules:
   - Page 1 starts with the header at the physical top.
   - Following pages have no repeated header or artificial header gap.
   - A 3 cm bottom safety area is reserved on every page.
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

  if (totalHeight <= PAGE_CONTENT_HEIGHT_PX) {
    return [0, totalHeight];
  }

  const units = buildPageUnits(root);

  if (!units.length) {
    const cuts = [0];
    let start = 0;

    while (start < totalHeight - 1) {
      const next = Math.min(
        start + PAGE_CONTENT_HEIGHT_PX,
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
      pageStart + PAGE_CONTENT_HEIGHT_PX,
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
        hardHeight <= PAGE_CONTENT_HEIGHT_PX &&
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
      unitHeight <= PAGE_CONTENT_HEIGHT_PX &&
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
function addPdfLinks(
  pdf: {
    link: (
      x: number,
      y: number,
      w: number,
      h: number,
      options: { url: string }
    ) => void;
  },
  root: HTMLElement,
  cuts: number[],
  pageWidthMM: number,
  pageHeightMM: number
) {
  const rootRect = root.getBoundingClientRect();

  root.querySelectorAll('a[href]').forEach((anchor) => {
    const element = anchor as HTMLAnchorElement;
    const href = element.href?.trim();

    if (!href) return;

    /*
     * getClientRects handles links that wrap across two lines.
     */
    Array.from(element.getClientRects()).forEach((rect) => {
      const top = rect.top - rootRect.top;
      const bottom = rect.bottom - rootRect.top;
      const left = rect.left - rootRect.left;
      const right = rect.right - rootRect.left;

      const rectHeight = Math.max(
        1,
        bottom - top
      );

      for (let page = 0; page < cuts.length - 1; page++) {
        const pageTop = cuts[page];
        const pageBottom = cuts[page + 1];

        /*
         * A link rectangle is added to the page if any part
         * of the link falls inside that page.
         */
        if (
          bottom <= pageTop ||
          top >= pageBottom
        ) {
          continue;
        }

        const visibleTop = Math.max(
          top,
          pageTop
        );

        const visibleBottom = Math.min(
          bottom,
          pageBottom
        );

        if (visibleBottom <= visibleTop) {
          continue;
        }

        const x =
          (left / A4_WIDTH_PX) *
          pageWidthMM;

        const y =
          ((visibleTop - pageTop) /
            PAGE_CONTENT_HEIGHT_PX) *
          (pageHeightMM - 30);

        const w =
          ((right - left) /
            A4_WIDTH_PX) *
          pageWidthMM;

        const h =
          ((visibleBottom - visibleTop) /
            PAGE_CONTENT_HEIGHT_PX) *
          237;

        try {
          pdf.link(
            Math.max(0, x),
            Math.max(0, y),
            Math.max(0.5, w),
            Math.max(0.5, h),
            { url: href }
          );
        } catch {
          /*
           * A malformed/unsupported URL must not make
           * the entire PDF download fail.
           */
        }
      }
    });
  });
}

export default function CVBuilderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get('id');

  const [lang, setLang] =
    useState<Lang>('es');

  const [cvData, setCVData] =
    useState<CVData>(defaultCVData);

  const [activeSection, setActiveSection] =
    useState<SectionKey>('personal');

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [showPreviewMobile, setShowPreviewMobile] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [savedCvId, setSavedCvId] =
    useState<string | null>(cvId);

  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(null);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [authReady, setAuthReady] =
    useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.replace('/sign-up-login-screen');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.user) {
          setCurrentUser(data.user);
          setAuthReady(true);
        }
      })
      .catch(() => {
        router.replace('/sign-up-login-screen');
      });
  }, [router]);

  useEffect(() => {
    if (!authReady) return;

    if (cvId) {
      fetch(`/api/cvs/${cvId}`)
        .then(res => {
          if (res.status === 401) {
            router.replace('/sign-up-login-screen');
            return null;
          }

          if (!res.ok) {
            throw new Error('CV not found');
          }

          return res.json();
        })
        .then(data => {
          if (data?.cv) {
            setCVData(data.cv);
            setSavedCvId(cvId);
          }
        })
        .catch(err => {
          console.error(
            'Failed to load CV:',
            err
          );
          toast.error(
            'No se pudo cargar el CV'
          );
        });
    } else {
      setCVData({
        ...defaultCVData,
        personal: {
          ...defaultCVData.personal,
          fullName:
            currentUser?.fullName || '',
          email:
            currentUser?.email || '',
        },
      });

      setSavedCvId(null);
    }
  }, [
    authReady,
    cvId,
    router,
    currentUser,
  ]);

  const handleLogout =
    useCallback(async () => {
      setLoggingOut(true);

      try {
        await fetch(
          '/api/auth/logout',
          { method: 'POST' }
        );

        toast.success(
          lang === 'es'
            ? 'Sesión cerrada'
            : lang === 'en'
              ? 'Logged out'
              : 'Sessão encerrada'
        );

        router.replace(
          '/sign-up-login-screen'
        );
      } catch {
        toast.error(
          'Error al cerrar sesión'
        );
      } finally {
        setLoggingOut(false);
      }
    }, [lang, router]);

  const handleSave =
    useCallback(async () => {
      setIsSaving(true);

      try {
        const payload = {
          personal: cvData.personal,
          experience: cvData.experience,
          education: cvData.education,
          projects: cvData.projects,
          skills: cvData.skills,
          languages: cvData.languages,
          certifications:
            cvData.certifications,
          achievements:
            cvData.achievements,
          title: cvData.title,
          templateId:
            cvData.templateId,
          accentColor:
            cvData.accentColor,
          fontStyle:
            cvData.fontStyle,
          photo: cvData.photo,
        };

        if (savedCvId) {
          const res = await fetch(
            `/api/cvs/${savedCvId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify(
                payload
              ),
            }
          );

          if (res.status === 401) {
            router.replace(
              '/sign-up-login-screen'
            );
            return;
          }

          if (!res.ok) {
            throw new Error(
              'Update failed'
            );
          }
        } else {
          const res = await fetch(
            '/api/cvs',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify(
                payload
              ),
            }
          );

          if (res.status === 401) {
            router.replace(
              '/sign-up-login-screen'
            );
            return;
          }

          if (!res.ok) {
            throw new Error(
              'Create failed'
            );
          }

          const data =
            await res.json();

          setSavedCvId(data.id);

          router.replace(
            `/cv-builder?id=${data.id}`
          );
        }

        toast.success(
          lang === 'es'
            ? 'CV guardado correctamente'
            : lang === 'en'
              ? 'CV saved successfully'
              : 'CV salvo com sucesso'
        );
      } catch (err) {
        console.error(
          'Save error:',
          err
        );

        toast.error(
          lang === 'es'
            ? 'Error al guardar el CV'
            : lang === 'en'
              ? 'Error saving CV'
              : 'Erro ao salvar CV'
        );
      } finally {
        setIsSaving(false);
      }
    }, [
      lang,
      cvData,
      savedCvId,
      router,
    ]);

  const handleDownload =
    useCallback(async () => {
      setIsDownloading(true);

      let container:
        | HTMLDivElement
        | null = null;

      let root:
        | { unmount: () => void; render: (children: React.ReactNode) => void }
        | null = null;

      try {
        const html2canvas =
          (
            await import(
              'html2canvas'
            )
          ).default;

        const jsPDF =
          (
            await import('jspdf')
          ).default;

        /*
         * ======================================================
         * 1. Render the EXACT template used by the preview.
         * ======================================================
         */
        container =
          document.createElement(
            'div'
          );

        container.style.cssText = `
          position: fixed;
          left: -100000px;
          top: 0;
          width: ${A4_WIDTH_PX}px;
          min-height: ${A4_HEIGHT_PX}px;
          background: #ffffff;
          z-index: -1;
          pointer-events: none;
          visibility: visible;
        `;

        const styleEl =
          document.createElement(
            'style'
          );

        styleEl.textContent = `
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

        .cv-rich-content a {
          color: inherit !important;
          text-decoration: underline !important;
          pointer-events: auto !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .cv-rich-content img {
            max-width: 100% !important;
            height: auto !important;
          }
        `;

        container.appendChild(
          styleEl
        );

        document.body.appendChild(
          container
        );

        const {
          createRoot,
        } = await import(
          'react-dom/client'
        );

        const ReactModule =
          await import('react');

        let TemplateComponent:
          React.ComponentType<{
            lang: Lang;
            cvData: CVData;
          }>;

        switch (
          cvData.templateId
        ) {
          case 'ats':
            TemplateComponent =
              (
                await import(
                  './templates/CVTemplateATS'
                )
              ).default;
            break;

          case 'ejecutivo':
            TemplateComponent =
              (
                await import(
                  './templates/CVTemplateEjecutivo'
                )
              ).default;
            break;

          case 'clasico':
            TemplateComponent =
              (
                await import(
                  './templates/CVTemplateClasico'
                )
              ).default;
            break;

          case 'creativo':
            TemplateComponent =
              (
                await import(
                  './templates/CVTemplateCreativo'
                )
              ).default;
            break;

          default:
            TemplateComponent =
              (
                await import(
                  './templates/CVTemplateModerno'
                )
              ).default;
            break;
        }

        root =
          createRoot(container);

        /*
         * IMPORTANT:
         * Pass the same language as the visible preview.
         * This fixes the situation where English was selected
         * but the PDF was generated with Spanish labels.
         */
        root.render(
          ReactModule.createElement(
            TemplateComponent,
            {
              lang,
              cvData,
            }
          )
        );

        /*
         * Wait for React layout, fonts and images.
         */
        if (
          document.fonts?.ready
        ) {
          await document.fonts.ready;
        }

        await new Promise(
          (resolve) =>
            requestAnimationFrame(
              () =>
                requestAnimationFrame(
                  resolve
                )
            )
        );

        /*
         * Give profile images a chance to finish loading.
         */
        const images =
          Array.from(
            container.querySelectorAll(
              'img'
            )
          );

        await Promise.all(
          images.map(
            (img) => {
              if (
                img.complete
              ) {
                return Promise.resolve();
              }

              return new Promise(
                (resolve) => {
                  img.addEventListener(
                    'load',
                    resolve,
                    {
                      once: true,
                    }
                  );

                  img.addEventListener(
                    'error',
                    resolve,
                    {
                      once: true,
                    }
                  );
                }
              );
            }
          )
        );

        /*
         * ======================================================
         * 2. Calculate automatic page boundaries BEFORE
         *    converting to canvas.
         * ======================================================
         */
        const cuts =
          calculatePageCuts(
            container
          );

        /*
         * ======================================================
         * 3. Rasterise at 2x.
         *
         * 2x is enough for an A4 CV and dramatically smaller
         * than the old 3x + uncompressed PNG approach.
         * ======================================================
         */
        const canvas =
          await html2canvas(
            container,
            {
              scale: PDF_SCALE,
              useCORS: true,
              allowTaint: false,
              backgroundColor:
                '#ffffff',
              logging: false,
              width:
                A4_WIDTH_PX,
              height:
                Math.ceil(
                  container.scrollHeight
                ),
              windowWidth:
                A4_WIDTH_PX,
              imageTimeout: 15000,
              removeContainer: false,
            }
          );

        /*
         * ======================================================
         * 4. Build the PDF page-by-page using the SAME safe
         *    cut positions.
         * ======================================================
         */
        const pdf =
          new jsPDF({
            orientation:
              'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
            putOnlyUsedFonts: true,
          });

        const pageWidthMM =
          210;

        const pageHeightMM =
          297;

        const pageCount =
          cuts.length - 1;

        for (
          let page = 0;
          page < pageCount;
          page++
        ) {
          if (page > 0) {
            pdf.addPage();
          }

          const sourceTop =
            cuts[page] *
            PDF_SCALE;

          const sourceBottom =
            Math.min(
              cuts[page + 1] *
                PDF_SCALE,
              canvas.height
            );

          const sourceHeight =
            Math.max(
              1,
              sourceBottom -
                sourceTop
            );

          /*
           * Page canvas is A4 at the same scale.
           */
          const pageCanvas =
            document.createElement(
              'canvas'
            );

          pageCanvas.width =
            A4_WIDTH_PX *
            PDF_SCALE;

          pageCanvas.height =
            A4_HEIGHT_PX * PDF_SCALE;

          const ctx =
            pageCanvas.getContext(
              '2d'
            );

          if (!ctx) {
            throw new Error(
              'Could not create PDF canvas'
            );
          }

          ctx.fillStyle =
            '#ffffff';

          ctx.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          /*
           * IMPORTANT:
           * The CV header belongs to page 1 only and starts at the
           * physical top of the page. Subsequent pages start exactly
           * where the previous page cut ended; there is NO repeated
           * header and NO artificial header-sized white gap.
           *
           * A 3 cm protected white area remains at the bottom.
           *
           * Never vertically stretch the content.
           */
          const maxContentPx =
            PAGE_CONTENT_HEIGHT_PX *
            PDF_SCALE;

          const drawHeight =
            Math.min(
              sourceHeight,
              maxContentPx
            );

          ctx.drawImage(
            canvas,
            0,
            sourceTop,
            canvas.width,
            drawHeight,
            0,
            0,
            canvas.width,
            drawHeight
          );

          /*
           * JPEG at high quality dramatically reduces the PDF size
           * compared with full-page PNG while remaining sharp enough
           * for normal CV viewing and printing.
           *
           * 0.94 is deliberately conservative for text clarity.
           */
          const pageImg =
            pageCanvas.toDataURL(
              'image/jpeg',
              0.94
            );

          pdf.addImage(
            pageImg,
            'JPEG',
            0,
            0,
            pageWidthMM,
            pageHeightMM,
            undefined,
            'FAST'
          );
        }

        /*
         * ======================================================
         * 5. Restore clickable hyperlinks.
         *
         * The visual CV is rasterised, so links must be added
         * as PDF annotations separately.
         * ======================================================
         */
        addPdfLinks(
          pdf,
          container,
          cuts,
          pageWidthMM,
          pageHeightMM
        );

        const fileName =
          (
            cvData.title ||
            'CV'
          )
            .replace(
              /[^a-zA-Z0-9\s\-_]/g,
              ''
            )
            .trim() ||
          'CV';

        pdf.save(
          `${fileName}.pdf`
        );

        toast.success(
          lang === 'es'
            ? 'PDF descargado correctamente'
            : lang === 'en'
              ? 'PDF downloaded successfully'
              : 'PDF baixado com sucesso'
        );
      } catch (err) {
        console.error(
          'PDF generation error:',
          err
        );

        toast.error(
          lang === 'es'
            ? 'Error al generar el PDF'
            : lang === 'en'
              ? 'Error generating PDF'
              : 'Erro ao gerar PDF'
        );
      } finally {
        try {
          root?.unmount();
        } catch {}

        if (container?.parentNode) {
          container.parentNode.removeChild(
            container
          );
        }

        setIsDownloading(false);
      }
    }, [lang, cvData]);

  const updateCVData =
    useCallback(
      (
        updates: Partial<CVData>
      ) => {
        setCVData((prev) => ({
          ...prev,
          ...updates,
        }));
      },
      []
    );

  const handleStyleChange =
    useCallback(
      (updates: {
        accentColor?: string;
        fontStyle?:
          | 'sans'
          | 'serif'
          | 'mono'
          | 'calibri';
        fontSize?: string;
      }) => {
        setCVData((prev) => ({
          ...prev,
          ...updates,
        }));
      },
      []
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <CVBuilderTopBar
        lang={lang}
        onLangChange={setLang}
        cvTitle={cvData.title}
        onTitleChange={(title) =>
          updateCVData({ title })
        }
        isSaving={isSaving}
        isDownloading={
          isDownloading
        }
        onSave={handleSave}
        onDownload={
          handleDownload
        }
        showPreviewMobile={
          showPreviewMobile
        }
        onTogglePreviewMobile={() =>
          setShowPreviewMobile(
            (v) => !v
          )
        }
        sidebarCollapsed={
          sidebarCollapsed
        }
        onToggleSidebar={() =>
          setSidebarCollapsed(
            (v) => !v
          )
        }
        savedCvId={savedCvId}
        currentUser={
          currentUser
        }
      />

      <div className="flex-1 flex overflow-hidden">
        <CVBuilderSidebar
          lang={lang}
          activeSection={
            activeSection
          }
          onSectionChange={
            setActiveSection
          }
          cvData={cvData}
          collapsed={
            sidebarCollapsed
          }
          currentUser={
            currentUser
          }
          onLogout={
            handleLogout
          }
          loggingOut={
            loggingOut
          }
        />

        <div
          className={`flex-1 overflow-y-auto scrollbar-thin ${
            showPreviewMobile
              ? 'hidden lg:block'
              : 'block'
          }`}
        >
          <CVSectionForm
            lang={lang}
            section={
              activeSection
            }
            cvData={cvData}
            onUpdate={
              updateCVData
            }
            onSectionChange={
              setActiveSection
            }
          />
        </div>

        <div className="hidden lg:flex lg:w-[600px] xl:w-[660px] 2xl:w-[740px] border-l border-border bg-muted/30 overflow-hidden flex-col">
          <CVPreviewPanel
            lang={lang}
            cvData={cvData}
            onTemplateChange={(
              templateId
            ) =>
              updateCVData({
                templateId,
              })
            }
            onStyleChange={
              handleStyleChange
            }
          />
        </div>

        {showPreviewMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <span className="font-semibold text-sm text-foreground">
                Vista previa
              </span>

              <button
                onClick={() =>
                  setShowPreviewMobile(
                    false
                  )
                }
                className="text-sm text-primary font-medium"
              >
                ← Volver al editor
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <CVPreviewPanel
                lang={lang}
                cvData={cvData}
                onTemplateChange={(
                  templateId
                ) =>
                  updateCVData({
                    templateId,
                  })
                }
                onStyleChange={
                  handleStyleChange
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
