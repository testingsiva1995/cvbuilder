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

/*
 * The template itself is already an A4 canvas.
 * Do not add another 15mm margin around it here.
 * The old PDF code did that and then rasterised the result again.
 */
const PDF_SCALE = 2;
const PAGE_BREAK_MIN = 60;

function getSafePageCuts(root: HTMLElement): number[] {
  const totalHeight = Math.max(
    A4_HEIGHT_PX,
    Math.ceil(root.scrollHeight)
  );

  if (totalHeight <= A4_HEIGHT_PX) {
    return [0, totalHeight];
  }

  const rootRect = root.getBoundingClientRect();
  const toRootY = (element: HTMLElement) =>
    element.getBoundingClientRect().top - rootRect.top;
  const bottomRootY = (element: HTMLElement) =>
    element.getBoundingClientRect().bottom - rootRect.top;

  /*
   * A page should be filled as much as possible, but a section should
   * not be reduced to a tiny fragment just to use the last few pixels.
   * 90px is roughly one short CV line + its surrounding spacing.
   */
  const MIN_USABLE_FRAGMENT = 90;
  const MIN_PAGE_CONTENT = 120;

  /*
   * Moderno renders:
   *   root -> header, body, style
   * and the direct children of body are the major CV blocks.
   * We use those blocks for the primary pagination decision.
   */
  const body =
    root.querySelector(
      '[data-cv-body="true"]'
    ) as HTMLElement | null;

  const topLevelBlocks = body
    ? Array.from(body.children)
        .map((child) => child as HTMLElement)
        .filter((element) => element.getBoundingClientRect().height > 0)
        .map((element) => ({
          element,
          top: toRootY(element),
          bottom: bottomRootY(element),
        }))
    : [];

  /*
   * Safe internal boundaries. These are the tops/bottoms of entries,
   * bullets and headings. We NEVER cut through a protected element.
   */
  const safeBoundaries: number[] = [];

  const addBoundary = (value: number) => {
    const rounded = Math.round(value);
    if (
      rounded > 20 &&
      rounded < totalHeight - 1
    ) {
      safeBoundaries.push(rounded);
    }
  };

  topLevelBlocks.forEach((block) => {
    addBoundary(block.top);
    addBoundary(block.bottom);
  });

  const descendants = Array.from(
    root.querySelectorAll('*')
  ) as HTMLElement[];

  descendants.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.height <= 0) return;

    const style = window.getComputedStyle(element);
    const isListItem = element.matches('.cv-rich-content li');
    const isProtected =
      isListItem ||
      style.breakInside === 'avoid' ||
      style.pageBreakInside === 'avoid' ||
      style.breakAfter === 'avoid' ||
      style.pageBreakAfter === 'avoid';

    if (!isProtected) return;

    addBoundary(rect.top - rootRect.top);
    addBoundary(rect.bottom - rootRect.top);
  });

  root.querySelectorAll(
    'h1,h2,h3,h4,h5,h6'
  ).forEach((element) => {
    addBoundary(
      element.getBoundingClientRect().top - rootRect.top
    );
  });

  const uniqueBoundaries = Array.from(
    new Set(safeBoundaries)
  ).sort((a, b) => a - b);

  const getBlockAt = (y: number) =>
    topLevelBlocks.find(
      (block) =>
        y > block.top + 1 &&
        y < block.bottom - 1
    );

  const getInternalCut = (
    start: number,
    target: number,
    block: {
      top: number;
      bottom: number;
    }
  ) => {
    const candidates = uniqueBoundaries.filter(
      (value) =>
        value > start + MIN_PAGE_CONTENT &&
        value <= target &&
        value > block.top + 1 &&
        value < block.bottom - 1
    );

    /*
     * Prefer the latest safe boundary. This maximises page usage.
     */
    return candidates.length
      ? candidates[candidates.length - 1]
      : null;
  };

  const cuts = [0];
  let start = 0;

  while (start + A4_HEIGHT_PX < totalHeight - 1) {
    const target = start + A4_HEIGHT_PX;
    const crossingBlock = getBlockAt(target - 1);

    /*
     * CASE 1: the next complete top-level section fits on the current
     * page. There is no reason to move it to the next page.
     */
    if (crossingBlock) {
      const blockHeight =
        crossingBlock.bottom - crossingBlock.top;
      const spaceBeforeBlock =
        crossingBlock.top - start;

      /*
       * If the whole section fits on a fresh A4 page but only a tiny
       * part of it would fit here, move the COMPLETE section forward.
       * This is the key rule that prevents a one-line orphan section.
       */
      if (
        blockHeight <= A4_HEIGHT_PX &&
        spaceBeforeBlock > MIN_PAGE_CONTENT &&
        target - crossingBlock.top < MIN_USABLE_FRAGMENT
      ) {
        cuts.push(Math.round(crossingBlock.top));
        start = Math.round(crossingBlock.top);
        continue;
      }

      /*
       * If the section is larger than one page, it must split internally.
       * Use the latest safe entry/bullet boundary that fits.
       */
      if (blockHeight > A4_HEIGHT_PX) {
        const internalCut = getInternalCut(
          start,
          target,
          crossingBlock
        );

        if (internalCut && internalCut > start) {
          cuts.push(internalCut);
          start = internalCut;
          continue;
        }
      }

      /*
       * The section is normal-sized but doesn't fit in the remaining
       * space. If the previous content is already substantial, start the
       * whole section on the next page.
       */
      if (
        blockHeight <= A4_HEIGHT_PX &&
        crossingBlock.top > start + MIN_PAGE_CONTENT
      ) {
        cuts.push(Math.round(crossingBlock.top));
        start = Math.round(crossingBlock.top);
        continue;
      }
    }

    /*
     * CASE 2: no useful top-level block boundary exists. Use the latest
     * safe internal boundary. This handles long experience/summary blocks.
     */
    const internalCandidates = uniqueBoundaries.filter(
      (value) =>
        value > start + MIN_PAGE_CONTENT &&
        value <= target
    );

    let cut = internalCandidates.length
      ? internalCandidates[internalCandidates.length - 1]
      : target;

    /*
     * Never leave only a tiny fragment of the current block on a page.
     * If the candidate is extremely close to the beginning of a block,
     * move to that block's top instead.
     */
    const candidateBlock = getBlockAt(cut + 1);
    if (
      candidateBlock &&
      cut - candidateBlock.top < MIN_USABLE_FRAGMENT &&
      candidateBlock.top > start + MIN_PAGE_CONTENT
    ) {
      cut = Math.round(candidateBlock.top);
    }

    if (cut <= start) {
      cut = target;
    }

    cuts.push(Math.min(cut, totalHeight));
    start = cut;
  }

  if (cuts[cuts.length - 1] !== totalHeight) {
    cuts.push(totalHeight);
  }

  return cuts;
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
            A4_HEIGHT_PX) *
          pageHeightMM;

        const w =
          ((right - left) /
            A4_WIDTH_PX) *
          pageWidthMM;

        const h =
          ((visibleBottom - visibleTop) /
            A4_HEIGHT_PX) *
          pageHeightMM;

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
        | { unmount: () => void }
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
          getSafePageCuts(
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
            Math.min(
              sourceHeight,
              A4_HEIGHT_PX * PDF_SCALE
            );

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
           * Draw the actual content at the top of the A4 page.
           * No artificial 15mm white border is added.
           */
          const destinationHeight = Math.min(
            sourceHeight,
            pageCanvas.height
          );

          ctx.drawImage(
            canvas,
            0,
            sourceTop,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            destinationHeight
          );

          /*
           * PNG preserves text edges/colors better than JPEG.
           * jsPDF compression is enabled, unlike the old code.
           */
          const pageImg =
            pageCanvas.toDataURL(
              'image/png'
            );

          const physicalHeightMM =
            (pageCanvas.height /
              (A4_HEIGHT_PX * PDF_SCALE)) *
            pageHeightMM;

          pdf.addImage(
            pageImg,
            'PNG',
            0,
            0,
            pageWidthMM,
            Math.min(
              pageHeightMM,
              physicalHeightMM
            ),
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
