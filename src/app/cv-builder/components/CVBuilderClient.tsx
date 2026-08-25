'use client';

import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { toast } from 'sonner';

import CVBuilderSidebar from './CVBuilderSidebar';
import CVBuilderTopBar from './CVBuilderTopBar';
import CVSectionForm from './CVSectionForm';
import CVPreviewPanel from './CVPreviewPanel';

import {
  defaultCVData,
  CVData,
} from './cvData';

export type SectionKey =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'achievements';

type Lang =
  | 'es'
  | 'en'
  | 'pt';

interface AuthUser {
  id: number;
  email: string;
  fullName: string;
}

/* ============================================================
   A4 PAGE HELPERS
   ============================================================ */

const A4_WIDTH_PX =
  794;

const A4_HEIGHT_PX =
  1123;

/*
 * Same pagination logic used by the preview.
 *
 * It tries to end a page at a main CV section instead of
 * cutting through Certifications / Projects / Education.
 */

function calculatePageCuts(
  root: HTMLElement,
  pageHeight = A4_HEIGHT_PX
): number[] {
  const totalHeight =
    Math.max(
      pageHeight,
      Math.ceil(
        root.scrollHeight
      )
    );

  if (
    totalHeight <=
    pageHeight
  ) {
    return [
      0,
      totalHeight,
    ];
  }

  const cuts: number[] =
    [0];

  const body =
    root.children.length >
    1
      ? (root.children[1] as HTMLElement)
      : null;

  const candidates: number[] =
    [];

  const rootRect =
    root.getBoundingClientRect();

  /*
   * Main section boundaries.
   */
  if (body) {
    Array.from(
      body.children
    ).forEach(
      (child) => {
        const rect =
          (
            child as HTMLElement
          ).getBoundingClientRect();

        const bottom =
          rect.bottom -
          rootRect.top;

        if (
          bottom > 50 &&
          bottom < totalHeight
        ) {
          candidates.push(
            Math.round(
              bottom
            )
          );
        }
      }
    );
  }

  /*
   * Elements explicitly marked break-inside: avoid.
   */
  root
    .querySelectorAll(
      '*'
    )
    .forEach(
      (node) => {
        const element =
          node as HTMLElement;

        const style =
          window.getComputedStyle(
            element
          );

        if (
          style.breakInside ===
            'avoid' ||
          style.pageBreakInside ===
            'avoid'
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
              Math.round(
                bottom
              )
            );
          }
        }
      }
    );

  /*
   * Never split a bullet item.
   */
  root
    .querySelectorAll(
      '.cv-rich-content li'
    )
    .forEach(
      (node) => {
        const rect =
          (
            node as HTMLElement
          ).getBoundingClientRect();

        const bottom =
          rect.bottom -
          rootRect.top;

        if (
          bottom > 50 &&
          bottom < totalHeight
        ) {
          candidates.push(
            Math.round(
              bottom
            )
          );
        }
      }
    );

  const uniqueCandidates =
    Array.from(
      new Set(candidates)
    ).sort(
      (a, b) =>
        a - b
    );

  let start = 0;

  while (
    start +
      pageHeight <
    totalHeight
  ) {
    const target =
      start +
      pageHeight;

    let safeCut =
      uniqueCandidates
        .filter(
          (value) =>
            value >
              start +
                80 &&
            value <=
              target
        )
        .pop();

    if (
      !safeCut ||
      safeCut <= start
    ) {
      safeCut =
        target;
    }

    cuts.push(
      Math.min(
        safeCut,
        totalHeight
      )
    );

    start =
      safeCut;
  }

  if (
    cuts[
      cuts.length - 1
    ] !== totalHeight
  ) {
    cuts.push(
      totalHeight
    );
  }

  return cuts;
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function CVBuilderClient() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const cvId =
    searchParams.get(
      'id'
    );

  const [
    lang,
    setLang,
  ] = useState<Lang>(
    'es'
  );

  const [
    cvData,
    setCVData,
  ] =
    useState<CVData>(
      defaultCVData
    );

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SectionKey>(
      'personal'
    );

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
    isDownloading,
    setIsDownloading,
  ] =
    useState(false);

  const [
    showPreviewMobile,
    setShowPreviewMobile,
  ] =
    useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] =
    useState(false);

  const [
    savedCvId,
    setSavedCvId,
  ] =
    useState<
      string | null
    >(cvId);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      null
    );

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  /* ==========================================================
     AUTH
     ========================================================== */

  useEffect(() => {
    fetch(
      '/api/auth/me'
    )
      .then(
        (res) => {
          if (
            !res.ok
          ) {
            router.replace(
              '/sign-up-login-screen'
            );

            return null;
          }

          return res.json();
        }
      )
      .then(
        (data) => {
          if (
            data?.user
          ) {
            setCurrentUser(
              data.user
            );

            setAuthReady(
              true
            );
          }
        }
      )
      .catch(() => {
        router.replace(
          '/sign-up-login-screen'
        );
      });
  }, [router]);

  /* ==========================================================
     LOAD CV
     ========================================================== */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (cvId) {
      fetch(
        `/api/cvs/${cvId}`
      )
        .then(
          (res) => {
            if (
              res.status ===
              401
            ) {
              router.replace(
                '/sign-up-login-screen'
              );

              return null;
            }

            if (
              !res.ok
            ) {
              throw new Error(
                'CV not found'
              );
            }

            return res.json();
          }
        )
        .then(
          (data) => {
            if (
              data?.cv
            ) {
              setCVData(
                data.cv
              );

              setSavedCvId(
                cvId
              );
            }
          }
        )
        .catch(
          (err) => {
            console.error(
              'Failed to load CV:',
              err
            );

            toast.error(
              'No se pudo cargar el CV'
            );
          }
        );
    } else {
      setCVData({
        ...defaultCVData,

        personal: {
          ...defaultCVData.personal,

          fullName:
            currentUser
              ?.fullName ||
            '',

          email:
            currentUser
              ?.email ||
            '',
        },
      });

      setSavedCvId(
        null
      );
    }
  }, [
    authReady,
    cvId,
    router,
    currentUser,
  ]);

  /* ==========================================================
     LOGOUT
     ========================================================== */

  const handleLogout =
    useCallback(
      async () => {
        setLoggingOut(
          true
        );

        try {
          await fetch(
            '/api/auth/logout',
            {
              method:
                'POST',
            }
          );

          toast.success(
            lang ===
              'es'
              ? 'Sesión cerrada'
              : lang ===
                  'en'
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
          setLoggingOut(
            false
          );
        }
      },
      [
        lang,
        router,
      ]
    );

  /* ==========================================================
     SAVE
     ========================================================== */

  const handleSave =
    useCallback(
      async () => {
        setIsSaving(
          true
        );

        try {
          const payload = {
            personal:
              cvData.personal,

            experience:
              cvData.experience,

            education:
              cvData.education,

            projects:
              cvData.projects,

            skills:
              cvData.skills,

            languages:
              cvData.languages,

            certifications:
              cvData.certifications,

            achievements:
              cvData.achievements,

            title:
              cvData.title,

            templateId:
              cvData.templateId,

            accentColor:
              cvData.accentColor,

            fontStyle:
              cvData.fontStyle,

            photo:
              cvData.photo,
          };

          if (
            savedCvId
          ) {
            const res =
              await fetch(
                `/api/cvs/${savedCvId}`,
                {
                  method:
                    'PUT',

                  headers: {
                    'Content-Type':
                      'application/json',
                  },

                  body:
                    JSON.stringify(
                      payload
                    ),
                }
              );

            if (
              res.status ===
              401
            ) {
              router.replace(
                '/sign-up-login-screen'
              );

              return;
            }

            if (
              !res.ok
            ) {
              throw new Error(
                'Update failed'
              );
            }
          } else {
            const res =
              await fetch(
                '/api/cvs',
                {
                  method:
                    'POST',

                  headers: {
                    'Content-Type':
                      'application/json',
                  },

                  body:
                    JSON.stringify(
                      payload
                    ),
                }
              );

            if (
              res.status ===
              401
            ) {
              router.replace(
                '/sign-up-login-screen'
              );

              return;
            }

            if (
              !res.ok
            ) {
              throw new Error(
                'Create failed'
              );
            }

            const data =
              await res.json();

            setSavedCvId(
              data.id
            );

            router.replace(
              `/cv-builder?id=${data.id}`
            );
          }

          toast.success(
            lang ===
              'es'
              ? 'CV guardado correctamente'
              : lang ===
                  'en'
                ? 'CV saved successfully'
                : 'CV salvo com sucesso'
          );
        } catch (err) {
          console.error(
            'Save error:',
            err
          );

          toast.error(
            lang ===
              'es'
              ? 'Error al guardar el CV'
              : lang ===
                  'en'
                ? 'Error saving CV'
                : 'Erro ao salvar CV'
          );
        } finally {
          setIsSaving(
            false
          );
        }
      },
      [
        lang,
        cvData,
        savedCvId,
        router,
      ]
    );

  /* ==========================================================
     DOWNLOAD PDF
     ========================================================== */

  const handleDownload =
    useCallback(
      async () => {
        setIsDownloading(
          true
        );

        let container:
          | HTMLDivElement
          | null =
          null;

        let root:
          | {
              unmount: () => void;
            }
          | null =
          null;

        try {
          const html2canvas =
            (
              await import(
                'html2canvas'
              )
            ).default;

          const jsPDF =
            (
              await import(
                'jspdf'
              )
            ).default;

          /*
           * Scale 2 is enough for a CV and much smaller than
           * the old scale 3 PNG approach.
           */
          const SCALE =
            2;

          /*
           * IMPORTANT:
           *
           * No 15mm artificial top margin.
           * The CV header starts at the top of the page.
           */
          const PAGE_HEIGHT_SCALED =
            A4_HEIGHT_PX *
            SCALE;

          /*
           * Hidden rendering container.
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
            background: #ffffff;
            pointer-events: none;
            z-index: 999999;
          `;

          const styleEl =
            document.createElement(
              'style'
            );

          styleEl.textContent = `
            * {
              box-sizing: border-box;
            }

            .cv-rich-content ul {
              list-style-type: disc !important;
              list-style-position: outside !important;
              padding-left: 18px !important;
              margin: 6px 0 !important;
              display: block !important;
              overflow: visible !important;
            }

            .cv-rich-content ol {
              list-style-type: decimal !important;
              list-style-position: outside !important;
              padding-left: 18px !important;
              margin: 6px 0 !important;
              display: block !important;
              overflow: visible !important;
            }

            .cv-rich-content li {
              display: list-item !important;
              list-style-position: outside !important;
              margin: 2px 0 !important;
              padding-left: 2px !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .cv-rich-content p {
              margin: 0.15em 0 !important;
            }

            .cv-rich-content strong {
              font-weight: 700 !important;
            }

            .cv-rich-content em {
              font-style: italic !important;
            }

            .cv-rich-content u {
              text-decoration: underline !important;
            }

            .cv-rich-content a {
              color: inherit !important;
              text-decoration: underline !important;
            }
          `;

          container.appendChild(
            styleEl
          );

          const cvRoot =
            document.createElement(
              'div'
            );

          cvRoot.id =
            'cv-download-root';

          cvRoot.style.cssText = `
            width: ${A4_WIDTH_PX}px;
            min-height: ${A4_HEIGHT_PX}px;
            background: #ffffff;
            overflow: visible;
          `;

          container.appendChild(
            cvRoot
          );

          document.body.appendChild(
            container
          );

          /*
           * React root.
           */
          const {
            createRoot,
          } =
            await import(
              'react-dom/client'
            );

          let TemplateComponent:
            React.ComponentType<any>;

          let isModern =
            false;

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

            case 'moderno':
            default:
              TemplateComponent =
                (
                  await import(
                    './templates/CVTemplateModerno'
                  )
                ).default;

              isModern =
                true;

              break;
          }

          root =
            createRoot(
              cvRoot
            );

          /*
           * Modern receives the selected language.
           */
          if (
            isModern
          ) {
            root.render(
              React.createElement(
                TemplateComponent,
                {
                  lang,
                  cvData,
                }
              )
            );
          } else {
            root.render(
              React.createElement(
                TemplateComponent,
                {
                  cvData,
                }
              )
            );
          }

          /*
           * Wait for React.
           */
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                900
              )
          );

          /*
           * Wait for images.
           */
          const images =
            Array.from(
              cvRoot.querySelectorAll(
                'img'
              )
            );

          await Promise.all(
            images.map(
              (img) =>
                new Promise<void>(
                  (
                    resolve
                  ) => {
                    if (
                      img.complete
                    ) {
                      resolve();
                      return;
                    }

                    img.onload =
                      () =>
                        resolve();

                    img.onerror =
                      () =>
                        resolve();
                  }
                )
            )
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                250
              )
          );

          /*
           * Make sure something was actually rendered.
           */
          if (
            !cvRoot.innerHTML.trim()
          ) {
            throw new Error(
              'CV render is empty'
            );
          }

          /*
           * Determine safe page cuts before canvas rendering.
           */
          const pageCuts =
            calculatePageCuts(
              cvRoot,
              A4_HEIGHT_PX
            );

          /*
           * Capture complete CV at scale 2.
           */
          const canvas =
            await html2canvas(
              cvRoot,
              {
                scale:
                  SCALE,

                useCORS:
                  true,

                allowTaint:
                  true,

                backgroundColor:
                  '#ffffff',

                logging:
                  false,

                width:
                  A4_WIDTH_PX,

                height:
                  cvRoot.scrollHeight,

                windowWidth:
                  A4_WIDTH_PX,

                imageTimeout:
                  0,

                removeContainer:
                  false,
              }
            );

          /*
           * Cleanup React before PDF work.
           */
          root.unmount();
          root =
            null;

          /*
           * PDF.
           */
          const pdf =
            new jsPDF({
              orientation:
                'portrait',

              unit:
                'mm',

              format:
                'a4',

              compress:
                true,
            });

          const A4_WIDTH_MM =
            210;

          const A4_HEIGHT_MM =
            297;

          /*
           * Every page is a full A4 canvas.
           * Content is drawn at the top.
           * No artificial white top margin.
           */
          for (
            let pageIndex = 0;
            pageIndex <
            pageCuts.length -
              1;
            pageIndex++
          ) {
            if (
              pageIndex >
              0
            ) {
              pdf.addPage();
            }

            const start =
              pageCuts[
                pageIndex
              ];

            const end =
              pageCuts[
                pageIndex +
                  1
              ];

            const sourceY =
              start *
              SCALE;

            const sourceHeight =
              Math.max(
                1,
                (end -
                  start) *
                  SCALE
              );

            /*
             * A4-sized page canvas.
             */
            const pageCanvas =
              document.createElement(
                'canvas'
              );

            pageCanvas.width =
              canvas.width;

            pageCanvas.height =
              PAGE_HEIGHT_SCALED;

            const ctx =
              pageCanvas.getContext(
                '2d'
              );

            if (!ctx) {
              continue;
            }

            /*
             * White page.
             */
            ctx.fillStyle =
              '#ffffff';

            ctx.fillRect(
              0,
              0,
              pageCanvas.width,
              pageCanvas.height
            );

            /*
             * Draw content at the exact original scale.
             *
             * If the page ends early because a section was kept
             * together, the remaining area stays white.
             */
            ctx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceHeight,
              0,
              0,
              canvas.width,
              sourceHeight
            );

            /*
             * JPEG instead of PNG.
             *
             * This is the major file-size reduction.
             */
            const pageImage =
              pageCanvas.toDataURL(
                'image/jpeg',
                0.82
              );

            pdf.addImage(
              pageImage,
              'JPEG',
              0,
              0,
              A4_WIDTH_MM,
              A4_HEIGHT_MM,
              undefined,
              'FAST'
            );
          }

          /*
           * File name.
           */
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
            lang ===
              'es'
              ? 'PDF descargado correctamente'
              : lang ===
                  'en'
                ? 'PDF downloaded successfully'
                : 'PDF baixado com sucesso'
          );
        } catch (err) {
          console.error(
            'PDF generation error:',
            err
          );

          toast.error(
            lang ===
              'es'
              ? 'Error al generar el PDF'
              : lang ===
                  'en'
                ? 'Error generating PDF'
                : 'Erro ao gerar PDF'
          );
        } finally {
          try {
            if (root) {
              root.unmount();
            }
          } catch {}

          try {
            if (
              container &&
              container.parentNode
            ) {
              container.parentNode.removeChild(
                container
              );
            }
          } catch {}

          setIsDownloading(
            false
          );
        }
      },
      [
        lang,
        cvData,
      ]
    );

  /* ==========================================================
     DATA UPDATE
     ========================================================== */

  const updateCVData =
    useCallback(
      (
        updates: Partial<CVData>
      ) => {
        setCVData(
          (prev) => ({
            ...prev,
            ...updates,
          })
        );
      },
      []
    );

  /* ==========================================================
     STYLE UPDATE
     ========================================================== */

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
        setCVData(
          (prev) => ({
            ...prev,
            ...updates,
          })
        );
      },
      []
    );

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      <CVBuilderTopBar
        lang={lang}
        onLangChange={
          setLang
        }
        cvTitle={
          cvData.title
        }
        onTitleChange={(
          title
        ) =>
          updateCVData({
            title,
          })
        }
        isSaving={
          isSaving
        }
        isDownloading={
          isDownloading
        }
        onSave={
          handleSave
        }
        onDownload={
          handleDownload
        }
        showPreviewMobile={
          showPreviewMobile
        }
        onTogglePreviewMobile={() =>
          setShowPreviewMobile(
            (value) =>
              !value
          )
        }
        sidebarCollapsed={
          sidebarCollapsed
        }
        onToggleSidebar={() =>
          setSidebarCollapsed(
            (value) =>
              !value
          )
        }
        savedCvId={
          savedCvId
        }
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
          cvData={
            cvData
          }
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
            cvData={
              cvData
            }
            onUpdate={
              updateCVData
            }
            onSectionChange={
              setActiveSection
            }
          />
        </div>

        {/* DESKTOP PREVIEW */}
        <div className="hidden lg:flex lg:w-[600px] xl:w-[660px] 2xl:w-[740px] border-l border-border bg-muted/30 overflow-hidden flex-col">

          <CVPreviewPanel
            lang={lang}
            cvData={
              cvData
            }
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

        {/* MOBILE PREVIEW */}
        {showPreviewMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col">

            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">

              <span className="font-semibold text-sm text-foreground">
                {lang ===
                'es'
                  ? 'Vista previa'
                  : lang ===
                      'en'
                    ? 'Preview'
                    : 'Visualização'}
              </span>

              <button
                onClick={() =>
                  setShowPreviewMobile(
                    false
                  )
                }
                className="text-sm text-primary font-medium"
              >
                ←{' '}
                {lang ===
                'es'
                  ? 'Volver al editor'
                  : lang ===
                      'en'
                    ? 'Back to editor'
                    : 'Voltar ao editor'}
              </button>

            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">

              <CVPreviewPanel
                lang={lang}
                cvData={
                  cvData
                }
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
