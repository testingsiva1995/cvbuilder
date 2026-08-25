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
  const candidates: number[] = [];

  const addCandidate = (value: number) => {
    const rounded = Math.round(value);
    if (
      rounded > PAGE_BREAK_MIN &&
      rounded < totalHeight
    ) {
      candidates.push(rounded);
    }
  };

  /*
   * Protect logical entries, headings and list items.
   * The template already marks entries with breakInside: avoid.
   */
  const protectedElements = Array.from(
    root.querySelectorAll(
      [
        '.cv-rich-content li',
        '[style*="break-inside"]',
        '[style*="page-break-inside"]',
        '[style*="break-after"]',
        '[style*="page-break-after"]',
      ].join(',')
    )
  ) as HTMLElement[];

  protectedElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const top = rect.top - rootRect.top;
    const bottom = rect.bottom - rootRect.top;

    const style = window.getComputedStyle(element);
    const protectedBlock =
      element.matches('.cv-rich-content li') ||
      style.breakInside === 'avoid' ||
      style.pageBreakInside === 'avoid' ||
      style.breakAfter === 'avoid' ||
      style.pageBreakAfter === 'avoid';

    if (!protectedBlock) return;

    /*
     * For a protected entry, the top is the important cut:
     * if the entry does not fit, start it on the next page.
     */
    addCandidate(top);
    addCandidate(bottom);
  });

  /*
   * Every direct child of the CV body is a section boundary.
   * This is what prevents EDUCATION / CERTIFICATIONS headings
   * from being stranded at the bottom.
   */
  /*
   * Moderno and the other templates render the A4 root as:
   *   1. header
   *   2. body
   *   3. style
   *
   * Use the second child when available. Falling back to the
   * last non-style element keeps this helper usable with the
   * other templates too.
   */
  const body =
    (root.children[1] as HTMLElement | undefined) ||
    (Array.from(root.children).find(
      (child) =>
        child.tagName.toLowerCase() !== 'style' &&
        (child as HTMLElement).children.length > 0
    ) as HTMLElement | undefined);

  if (body) {
    Array.from(body.children).forEach((child) => {
      const element = child as HTMLElement;
      const rect = element.getBoundingClientRect();

      addCandidate(rect.top - rootRect.top);
      addCandidate(rect.bottom - rootRect.top);

      /*
       * Also inspect first-level section children.
       */
      Array.from(element.children).forEach((nested) => {
        const nestedElement = nested as HTMLElement;
        const nestedRect =
          nestedElement.getBoundingClientRect();

        addCandidate(
          nestedRect.top - rootRect.top
        );
      });
    });
  }

  /*
   * Explicit headings are safe places to begin a new page.
   */
  root.querySelectorAll(
    '.cv-rich-content + div, h1, h2, h3, h4, h5, h6'
  ).forEach((element) => {
    const rect = (
      element as HTMLElement
    ).getBoundingClientRect();

    addCandidate(
      rect.top - rootRect.top
    );
  });

  const safe = Array.from(
    new Set(candidates)
  ).sort((a, b) => a - b);

  const cuts = [0];
  let start = 0;

  while (start + A4_HEIGHT_PX < totalHeight) {
    const target = start + A4_HEIGHT_PX;

    /*
     * Choose the latest safe boundary before the A4 limit.
     * Avoid a tiny fragment at the bottom of the page.
     */
    let cut = safe
      .filter(
        (value) =>
          value > start + PAGE_BREAK_MIN &&
          value <= target
      )
      .pop();

    if (!cut || cut <= start) {
      cut = target;
    }

    /*
     * If the chosen candidate would leave almost an empty
     * page, use the exact A4 boundary instead.
     */
    if (cut - start < PAGE_BREAK_MIN) {
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
            overflow-wrap: anywhere !important;
            word-break: normal !important;
          }

          .cv-rich-content ul,
          .cv-rich-content ol {
            width: 100% !important;
            max-width: 100% !important;
            margin: 5px 0 !important;
            padding-left: 22px !important;
            list-style-position: outside !important;
          }

          .cv-rich-content ul {
            list-style-type: disc !important;
          }

          .cv-rich-content ol {
            list-style-type: decimal !important;
          }

          .cv-rich-content li {
            display: list-item !important;
            list-style-position: outside !important;
            margin: 2px 0 !important;
            padding-left: 3px !important;
            line-height: 1.35 !important;
            max-width: 100% !important;
            overflow-wrap: anywhere !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .cv-rich-content li p {
            margin: 0 !important;
            padding: 0 !important;
          }

          .cv-rich-content a {
            color: inherit !important;
            text-decoration: underline !important;
            pointer-events: auto !important;
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
            A4_HEIGHT_PX *
            PDF_SCALE;

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
          ctx.drawImage(
            canvas,
            0,
            sourceTop,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            Math.min(
              sourceHeight,
              pageCanvas.height
            )
          );

          /*
           * PNG preserves text edges/colors better than JPEG.
           * jsPDF compression is enabled, unlike the old code.
           */
          const pageImg =
            pageCanvas.toDataURL(
              'image/png'
            );

          pdf.addImage(
            pageImg,
            'PNG',
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
