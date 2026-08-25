'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Plus, FileText, Clock, Trash2, Copy, ExternalLink, Download,
  LayoutDashboard, Loader2, AlertTriangle, RefreshCw, LogOut, User
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

interface CVListItem {
  id: string;
  title: string;
  template_id: string;
  accent_color: string;
  updated_at: string;
  created_at: string;
}

interface AuthUser {
  id: number;
  email: string;
  fullName: string;
}

const templateLabels: Record<string, string> = {
  moderno: 'Moderno',
  clasico: 'Clásico',
  ejecutivo: 'Ejecutivo',
  creativo: 'Creativo',
  ats: 'ATS Pro',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(dateStr);
}

export default function CVDashboardClient() {
  const router = useRouter();
  const [cvs, setCVs] = useState<CVListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Load current user
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
          setAuthChecked(true);
        }
      })
      .catch(() => {
        router.replace('/sign-up-login-screen');
      });
  }, [router]);

  const loadCVs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cvs');
      if (res.status === 401) {
        router.replace('/sign-up-login-screen');
        return;
      }
      if (!res.ok) throw new Error('Failed to load CVs');
      const data = await res.json();
      setCVs(data.cvs || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los CVs. Verifica la conexión a la base de datos.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Only load CVs after auth is confirmed
  useEffect(() => {
    if (authChecked) {
      loadCVs();
    }
  }, [authChecked, loadCVs]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Sesión cerrada correctamente');
      router.replace('/sign-up-login-screen');
    } catch {
      toast.error('Error al cerrar sesión');
    } finally {
      setLoggingOut(false);
    }
  }, [router]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cvs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setCVs(prev => prev.filter(cv => cv.id !== id));
      toast.success('CV eliminado correctamente');
    } catch {
      toast.error('Error al eliminar el CV');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }, []);

  const handleDuplicate = useCallback(async (id: string) => {
    setDuplicatingId(id);
    try {
      const res = await fetch(`/api/cvs/${id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Duplicate failed');
      toast.success('CV duplicado correctamente');
      await loadCVs();
    } catch {
      toast.error('Error al duplicar el CV');
    } finally {
      setDuplicatingId(null);
    }
  }, [loadCVs]);

  const handleDownload = useCallback(async (cv: CVListItem) => {
    setDownloadingId(cv.id);
    try {
      router.push(`/cv-builder?id=${cv.id}&download=1`);
    } catch {
      toast.error('Error al preparar la descarga');
    } finally {
      setDownloadingId(null);
    }
  }, [router]);

  const handleNewCV = useCallback(() => {
    router.push('/cv-builder');
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center gap-4 px-6 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <AppLogo size={28} />
          <span className="font-bold text-sm text-primary hidden sm:block">BuscaCerca</span>
        </Link>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <LayoutDashboard size={16} className="text-primary" />
          <span>Mis CVs</span>
        </div>
        <div className="flex-1" />

        {/* User info + logout */}
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User size={14} />
              <span className="font-medium text-foreground truncate max-w-[160px]">{currentUser.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors text-muted-foreground disabled:opacity-60"
            >
              {loggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        )}

        <button
          onClick={handleNewCV}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg btn-primary"
        >
          <Plus size={15} />
          <span>Nuevo CV</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Mis CVs guardados</h1>
          {currentUser && (
            <p className="text-sm text-muted-foreground mt-0.5">{currentUser.email}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Cargando...' : `${cvs.length} CV${cvs.length !== 1 ? 's' : ''} guardado${cvs.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">Error de conexión</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">{error}</p>
            <button
              onClick={loadCVs}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cvs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No tienes CVs guardados</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Crea tu primer CV profesional y guárdalo para acceder desde cualquier lugar.
            </p>
            <button
              onClick={handleNewCV}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg btn-primary"
            >
              <Plus size={15} />
              Crear mi primer CV
            </button>
          </div>
        )}

        {/* CV Grid */}
        {!loading && !error && cvs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvs.map(cv => (
              <div
                key={cv.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-card-hover transition-all duration-200 group"
              >
                {/* Color accent bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: cv.accent_color || '#1B4F72' }}
                />

                <div className="p-5">
                  {/* CV icon + template badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {templateLabels[cv.template_id] || cv.template_id}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-foreground truncate mb-1" title={cv.title}>
                    {cv.title}
                  </h3>

                  {/* Last edited */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Clock size={11} />
                    <span>Editado {timeAgo(cv.updated_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Open */}
                    <Link
                      href={`/cv-builder?id=${cv.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg btn-primary"
                    >
                      <ExternalLink size={12} />
                      Abrir
                    </Link>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(cv.id)}
                      disabled={duplicatingId === cv.id}
                      title="Duplicar"
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {duplicatingId === cv.id ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                    </button>

                    {/* Download */}
                    <button
                      onClick={() => handleDownload(cv)}
                      disabled={downloadingId === cv.id}
                      title="Descargar PDF"
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {downloadingId === cv.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    </button>

                    {/* Delete */}
                    {confirmDeleteId === cv.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(cv.id)}
                          disabled={deletingId === cv.id}
                          className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                        >
                          {deletingId === cv.id ? <Loader2 size={12} className="animate-spin" /> : '✓'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(cv.id)}
                        title="Eliminar"
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* New CV card */}
            <button
              onClick={handleNewCV}
              className="bg-card border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 min-h-[180px] group"
            >
              <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                Nuevo CV
              </span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
