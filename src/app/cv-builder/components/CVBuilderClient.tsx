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

export default function CVBuilderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cvId = searchParams.get('id');

  const [lang, setLang] = useState<Lang>('es');
  const [cvData, setCVData] = useState<CVData>(defaultCVData);
  const [activeSection, setActiveSection] = useState<SectionKey>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [savedCvId, setSavedCvId] = useState<string | null>(cvId);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Check authentication — must complete before loading any CV data
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

  // Load CV from database only after auth is confirmed and only if id is provided
  useEffect(() => {
    if (!authReady) return;

    if (cvId) {
      fetch(`/api/cvs/${cvId}`)
        .then(res => {
          if (res.status === 401) {
            router.replace('/sign-up-login-screen');
            return null;
          }
          if (!res.ok) throw new Error('CV not found');
          return res.json();
        })
        .then(data => {
          if (data?.cv) {
            setCVData(data.cv);
            setSavedCvId(cvId);
          }
        })
        .catch(err => {
          console.error('Failed to load CV:', err);
          toast.error('No se pudo cargar el CV');
        });
    } else {
      // No CV id — reset to a completely blank CV with the authenticated user's name/email pre-filled
      setCVData({
        ...defaultCVData,
        personal: {
          ...defaultCVData.personal,
          fullName: currentUser?.fullName || '',
          email: currentUser?.email || '',
        },
      });
      setSavedCvId(null);
    }
  }, [authReady, cvId, router, currentUser]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success(lang === 'es' ? 'Sesión cerrada' : lang === 'en' ? 'Logged out' : 'Sessão encerrada');
      router.replace('/sign-up-login-screen');
    } catch {
      toast.error('Error al cerrar sesión');
    } finally {
      setLoggingOut(false);
    }
  }, [lang, router]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Send nested personal object — API stores it correctly in cv_data
      const payload = {
        personal: cvData.personal,
        experience: cvData.experience,
        education: cvData.education,
        projects: cvData.projects,
        skills: cvData.skills,
        languages: cvData.languages,
        certifications: cvData.certifications,
        achievements: cvData.achievements,
        title: cvData.title,
        templateId: cvData.templateId,
        accentColor: cvData.accentColor,
        fontStyle: cvData.fontStyle,
        photo: cvData.photo,
      };

      if (savedCvId) {
        // Update existing
        const res = await fetch(`/api/cvs/${savedCvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          router.replace('/sign-up-login-screen');
          return;
        }
        if (!res.ok) throw new Error('Update failed');
      } else {
        // Create new
        const res = await fetch('/api/cvs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          router.replace('/sign-up-login-screen');
          return;
        }
        if (!res.ok) throw new Error('Create failed');
        const data = await res.json();
        setSavedCvId(data.id);
        // Update URL without reload
        router.replace(`/cv-builder?id=${data.id}`);
      }

      toast.success(
        lang === 'es' ? 'CV guardado correctamente' :
        lang === 'en'? 'CV saved successfully' : 'CV salvo com sucesso'
      );
    } catch (err) {
      console.error('Save error:', err);
      toast.error(
        lang === 'es' ? 'Error al guardar el CV' :
        lang === 'en'? 'Error saving CV' : 'Erro ao salvar CV'
      );
    } finally {
      setIsSaving(false);
    }
  }, [lang, cvData, savedCvId, router]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // A4 at 96dpi: 794×1123px. Scale 3 for quality.
      const A4_WIDTH_PX = 794;
      const A4_HEIGHT_PX = 1123;
      const SCALE = 3;

      // Margin: 15mm = ~57px at 96dpi
      const MARGIN_PX = 57;
      // Content area per page (no margins)
      const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - MARGIN_PX * 2; // 1009px

      // Create hidden container — no extra padding, template provides its own internal spacing
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -99999px;
        left: -99999px;
        width: ${A4_WIDTH_PX}px;
        background: #ffffff;
        z-index: -1;
        pointer-events: none;
      `;

      // Inject rich-text CSS
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        * { box-sizing: border-box; }
        .cv-rich-content ul {
          list-style-type: disc !important;
          list-style-position: outside !important;
          padding-left: 20px !important;
          margin: 6px 0 !important;
          display: block !important;
          overflow: visible !important;
        }
        .cv-rich-content ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
          padding-left: 20px !important;
          margin: 6px 0 !important;
          display: block !important;
          overflow: visible !important;
        }
        .cv-rich-content li {
          display: list-item !important;
          margin: 2px 0 !important;
          padding-left: 3px !important;
          list-style: inherit !important;
          overflow: visible !important;
        }
        .cv-rich-content ul li { list-style-type: disc !important; }
        .cv-rich-content ol li { list-style-type: decimal !important; }
        .cv-rich-content p { margin: 0.15em 0; }
        .cv-rich-content strong { font-weight: 700; }
        .cv-rich-content em { font-style: italic; }
        .cv-rich-content u { text-decoration: underline; }
        .cv-rich-content a { color: inherit; text-decoration: underline; }
      `;
      container.appendChild(styleEl);
      document.body.appendChild(container);

      const { createRoot } = await import('react-dom/client');
      const React = (await import('react')).default;

      let TemplateComponent: React.ComponentType<{ cvData: CVData }>;
      switch (cvData.templateId) {
        case 'ats': TemplateComponent = (await import('./templates/CVTemplateATS')).default; break;
        case 'ejecutivo': TemplateComponent = (await import('./templates/CVTemplateEjecutivo')).default; break;
        case 'clasico': TemplateComponent = (await import('./templates/CVTemplateClasico')).default; break;
        case 'creativo': TemplateComponent = (await import('./templates/CVTemplateCreativo')).default; break;
        default: TemplateComponent = (await import('./templates/CVTemplateModerno')).default; break;
      }

      const root = createRoot(container);
      root.render(React.createElement(TemplateComponent, { cvData }));

      // Wait for render + images
      await new Promise(r => setTimeout(r, 700));

      const canvas = await html2canvas(container, {
        scale: SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: A4_WIDTH_PX,
        height: container.scrollHeight,
        windowWidth: A4_WIDTH_PX,
        imageTimeout: 0,
        removeContainer: false,
      });

      root.unmount();
      document.body.removeChild(container);

      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;
      const MARGIN_MM = 15; // 15mm margins on all sides

      const imgWidthPx = canvas.width; // A4_WIDTH_PX * SCALE
      const imgHeightPx = canvas.height;

      // Content area per page in scaled pixels
      const contentHeightScaled = CONTENT_HEIGHT_PX * SCALE;
      const marginScaled = MARGIN_PX * SCALE;

      const totalPages = Math.ceil(imgHeightPx / contentHeightScaled);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: false });

      // Content area in mm
      const contentWidthMM = A4_WIDTH_MM - MARGIN_MM * 2;
      const contentHeightMM = A4_HEIGHT_MM - MARGIN_MM * 2;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        const srcY = page * contentHeightScaled;
        const srcH = Math.min(contentHeightScaled, imgHeightPx - srcY);

        // Create page canvas with margins (white background)
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = A4_HEIGHT_PX * SCALE;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          // Fill white (margins)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          // Draw content with top margin offset
          ctx.drawImage(
            canvas,
            0, srcY, imgWidthPx, srcH,
            0, marginScaled, imgWidthPx, srcH
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(pageImgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'NONE');
      }

      const fileName = (cvData.title || 'CV').replace(/[^a-zA-Z0-9\s\-_]/g, '').trim() || 'CV';
      pdf.save(`${fileName}.pdf`);

      toast.success(
        lang === 'es' ? 'PDF descargado correctamente' :
        lang === 'en' ? 'PDF downloaded successfully' :
        'PDF baixado com sucesso'
      );
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error(
        lang === 'es' ? 'Error al generar el PDF' :
        lang === 'en'? 'Error generating PDF' : 'Erro ao gerar PDF'
      );
    } finally {
      setIsDownloading(false);
    }
  }, [lang, cvData]);

  const updateCVData = useCallback((updates: Partial<CVData>) => {
    setCVData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleStyleChange = useCallback((updates: { accentColor?: string; fontStyle?: 'sans' | 'serif' | 'mono' | 'calibri'; fontSize?: string }) => {
    setCVData(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <CVBuilderTopBar
        lang={lang}
        onLangChange={setLang}
        cvTitle={cvData.title}
        onTitleChange={title => updateCVData({ title })}
        isSaving={isSaving}
        isDownloading={isDownloading}
        onSave={handleSave}
        onDownload={handleDownload}
        showPreviewMobile={showPreviewMobile}
        onTogglePreviewMobile={() => setShowPreviewMobile(v => !v)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(v => !v)}
        savedCvId={savedCvId}
        currentUser={currentUser}
      />

      <div className="flex-1 flex overflow-hidden">
        <CVBuilderSidebar
          lang={lang}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          cvData={cvData}
          collapsed={sidebarCollapsed}
          currentUser={currentUser}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />

        <div className={`flex-1 overflow-y-auto scrollbar-thin ${showPreviewMobile ? 'hidden lg:block' : 'block'}`}>
          <CVSectionForm
            lang={lang}
            section={activeSection}
            cvData={cvData}
            onUpdate={updateCVData}
            onSectionChange={setActiveSection}
          />
        </div>

        <div className="hidden lg:flex lg:w-[600px] xl:w-[660px] 2xl:w-[740px] border-l border-border bg-muted/30 overflow-hidden flex-col">
          <CVPreviewPanel
            lang={lang}
            cvData={cvData}
            onTemplateChange={templateId => updateCVData({ templateId })}
            onStyleChange={handleStyleChange}
          />
        </div>

        {showPreviewMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <span className="font-semibold text-sm text-foreground">Vista previa</span>
              <button
                onClick={() => setShowPreviewMobile(false)}
                className="text-sm text-primary font-medium"
              >
                ← Volver al editor
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <CVPreviewPanel
                lang={lang}
                cvData={cvData}
                onTemplateChange={templateId => updateCVData({ templateId })}
                onStyleChange={handleStyleChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}