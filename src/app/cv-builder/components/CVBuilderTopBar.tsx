'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Save, Download, Eye, EyeOff, Globe, PanelLeftClose, PanelLeftOpen, Loader2, ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Lang = 'es' | 'en' | 'pt';

interface Props {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  cvTitle: string;
  onTitleChange: (t: string) => void;
  isSaving: boolean;
  isDownloading: boolean;
  onSave: () => void;
  onDownload: () => void;
  showPreviewMobile: boolean;
  onTogglePreviewMobile: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  savedCvId?: string | null;
  currentUser?: { fullName: string; email: string } | null;
}

const copy: Record<Lang, { save: string; saving: string; download: string; downloading: string; preview: string; dashboard: string }> = {
  es: { save: 'Guardar', saving: 'Guardando...', download: 'Descargar PDF', downloading: 'Generando...', preview: 'Vista previa', dashboard: 'Mis CVs' },
  en: { save: 'Save', saving: 'Saving...', download: 'Download PDF', downloading: 'Generating...', preview: 'Preview', dashboard: 'My CVs' },
  pt: { save: 'Salvar', saving: 'Salvando...', download: 'Baixar PDF', downloading: 'Gerando...', preview: 'Visualizar', dashboard: 'Meus CVs' },
};

const langOptions: { code: Lang; flag: string; label: string }[] = [
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
];

export default function CVBuilderTopBar({ lang, onLangChange, cvTitle, onTitleChange, isSaving, isDownloading, onSave, onDownload, showPreviewMobile, onTogglePreviewMobile, sidebarCollapsed, onToggleSidebar, savedCvId, currentUser }: Props) {
  const t = copy[lang];
  const [langOpen, setLangOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const currentLang = langOptions.find(l => l.code === lang)!;
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success(lang === 'es' ? 'Sesión cerrada' : lang === 'en' ? 'Logged out' : 'Sessão encerrada');
      router.replace('/sign-up-login-screen');
      router.refresh();
    } catch {
      toast.error('Error al cerrar sesión');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center gap-3 px-3 shrink-0 z-40">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      {/* Logo */}
      <Link href="/" className="hidden sm:flex items-center gap-1.5 shrink-0">
        <AppLogo size={28} />
        <span className="font-bold text-xs text-primary hidden md:block">BuscaCerca</span>
      </Link>

      <div className="w-px h-6 bg-border hidden sm:block shrink-0" />

      {/* Dashboard link */}
      <Link
        href="/cv-dashboard"
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground shrink-0"
      >
        <LayoutDashboard size={13} />
        <span className="hidden md:inline">{t.dashboard}</span>
      </Link>

      <div className="w-px h-6 bg-border hidden sm:block shrink-0" />

      {/* CV Title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            type="text"
            value={cvTitle}
            onChange={e => onTitleChange(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
            className="input-base py-1 px-2 text-sm font-semibold max-w-xs"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-sm font-semibold text-foreground truncate max-w-xs hover:text-primary transition-colors flex items-center gap-1"
            title="Editar nombre del CV"
          >
            <span className="truncate">{cvTitle}</span>
            <ChevronDown size={12} className="text-muted-foreground shrink-0" />
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile preview toggle */}
        <button
          onClick={onTogglePreviewMobile}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
        >
          {showPreviewMobile ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden sm:inline">{t.preview}</span>
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(v => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
            aria-expanded={langOpen}
          >
            <Globe size={13} />
            <span>{currentLang.flag} {currentLang.label}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-card-hover py-1 min-w-[130px] animate-scale-in z-50">
              {langOptions.map(opt => (
                <button
                  key={`topbar-lang-${opt.code}`}
                  onClick={() => { onLangChange(opt.code); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-muted transition-colors ${lang === opt.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                >
                  <span>{opt.flag}</span>
                  <span>{opt.code === 'es' ? 'Español' : opt.code === 'en' ? 'English' : 'Português'}</span>
                  {lang === opt.code && <span className="ml-auto text-primary">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User name (desktop) */}
        {currentUser && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
            <User size={12} />
            <span className="truncate max-w-[120px] font-medium text-foreground">{currentUser.fullName}</span>
          </div>
        )}

        {/* Logout */}
        {currentUser && (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Cerrar sesión"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors text-muted-foreground disabled:opacity-60"
          >
            {loggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
            <span className="hidden md:inline">
              {lang === 'es' ? 'Salir' : lang === 'en' ? 'Logout' : 'Sair'}
            </span>
          </button>
        )}

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors text-foreground disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin-slow" /> : <Save size={13} />}
          <span className="hidden sm:inline">{isSaving ? t.saving : t.save}</span>
        </button>

        {/* Download PDF */}
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg btn-primary disabled:opacity-60"
        >
          {isDownloading ? <Loader2 size={13} className="animate-spin-slow" /> : <Download size={13} />}
          <span className="hidden sm:inline">{isDownloading ? t.downloading : t.download}</span>
        </button>
      </div>
    </header>
  );
}