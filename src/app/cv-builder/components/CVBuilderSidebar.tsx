'use client';
import React from 'react';
import { User, FileText, Briefcase, GraduationCap, FolderOpen, Zap, Globe, Award, Trophy, LogOut, Loader2 } from 'lucide-react';
import { SectionKey } from './CVBuilderClient';
import { CVData } from './cvData';

type Lang = 'es' | 'en' | 'pt';

interface Props {
  lang: Lang;
  activeSection: SectionKey;
  onSectionChange: (s: SectionKey) => void;
  cvData: CVData;
  collapsed: boolean;
  currentUser?: { fullName: string; email: string } | null;
  onLogout?: () => void;
  loggingOut?: boolean;
}

const sectionMeta: {
  key: SectionKey;
  icon: React.ReactNode;
  labelEs: string; labelEn: string; labelPt: string;
  groupEs?: string; groupEn?: string; groupPt?: string;
}[] = [
  { key: 'personal', icon: <User size={16} />, labelEs: 'Información Personal', labelEn: 'Personal Info', labelPt: 'Informações Pessoais' },
  { key: 'summary', icon: <FileText size={16} />, labelEs: 'Resumen Profesional', labelEn: 'Professional Summary', labelPt: 'Resumo Profissional' },
  { key: 'experience', icon: <Briefcase size={16} />, labelEs: 'Experiencia Laboral', labelEn: 'Work Experience', labelPt: 'Experiência Profissional', groupEs: 'Experiencia', groupEn: 'Experience', groupPt: 'Experiência' },
  { key: 'education', icon: <GraduationCap size={16} />, labelEs: 'Educación', labelEn: 'Education', labelPt: 'Educação' },
  { key: 'projects', icon: <FolderOpen size={16} />, labelEs: 'Proyectos', labelEn: 'Projects', labelPt: 'Projetos' },
  { key: 'skills', icon: <Zap size={16} />, labelEs: 'Habilidades', labelEn: 'Skills', labelPt: 'Habilidades', groupEs: 'Competencias', groupEn: 'Competencies', groupPt: 'Competências' },
  { key: 'languages', icon: <Globe size={16} />, labelEs: 'Idiomas', labelEn: 'Languages', labelPt: 'Idiomas' },
  { key: 'certifications', icon: <Award size={16} />, labelEs: 'Certificaciones', labelEn: 'Certifications', labelPt: 'Certificações' },
  { key: 'achievements', icon: <Trophy size={16} />, labelEs: 'Logros', labelEn: 'Achievements', labelPt: 'Conquistas' },
];

function getSectionCompletion(key: SectionKey, cvData: CVData): boolean {
  switch (key) {
    case 'personal': return !!(cvData.personal.fullName && cvData.personal.email);
    case 'summary': return cvData.personal.summary.length > 20;
    case 'experience': return cvData.experience.length > 0;
    case 'education': return cvData.education.length > 0;
    case 'projects': return cvData.projects.length > 0;
    case 'skills': return cvData.skills.length > 0;
    case 'languages': return cvData.languages.length > 0;
    case 'certifications': return cvData.certifications.length > 0;
    case 'achievements': return cvData.achievements.length > 0;
    default: return false;
  }
}

function getCompletionPercent(cvData: CVData): number {
  const keys: SectionKey[] = ['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certifications', 'achievements'];
  const completed = keys.filter(k => getSectionCompletion(k, cvData)).length;
  return Math.round((completed / keys.length) * 100);
}

function getSectionCount(key: SectionKey, cvData: CVData): number | null {
  switch (key) {
    case 'experience': return cvData.experience.length;
    case 'education': return cvData.education.length;
    case 'projects': return cvData.projects.length;
    case 'skills': return cvData.skills.length;
    case 'languages': return cvData.languages.length;
    case 'certifications': return cvData.certifications.length;
    case 'achievements': return cvData.achievements.length;
    default: return null;
  }
}

const progressLabels: Record<Lang, string> = {
  es: 'Completado',
  en: 'Complete',
  pt: 'Concluído',
};

export default function CVBuilderSidebar({ lang, activeSection, onSectionChange, cvData, collapsed, currentUser, onLogout, loggingOut }: Props) {
  const percent = getCompletionPercent(cvData);

  const getLabel = (s: typeof sectionMeta[0]) =>
    lang === 'es' ? s.labelEs : lang === 'en' ? s.labelEn : s.labelPt;

  const userInitials = currentUser?.fullName
    ? currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside
      className={`shrink-0 border-r border-border bg-sidebar-bg flex flex-col transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-0 lg:w-16' : 'w-64'
      }`}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Progress */}
      {!collapsed && (
        <div className="px-4 py-4 border-b shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--sidebar-muted)' }}>{progressLabels[lang]}</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--sidebar-fg)' }}>{percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full progress-bar-fill"
              style={{ width: `${percent}%`, backgroundColor: 'var(--secondary)' }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {sectionMeta.map((section, idx) => {
          const isActive = activeSection === section.key;
          const isComplete = getSectionCompletion(section.key, cvData);
          const count = getSectionCount(section.key, cvData);
          const showGroup = !collapsed && (idx === 2 || idx === 5);
          const groupLabel = lang === 'es'
            ? section.groupEs
            : lang === 'en' ? section.groupEn : section.groupPt;

          return (
            <React.Fragment key={`sidebar-section-${section.key}`}>
              {showGroup && groupLabel && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--sidebar-muted)' }}>
                    {groupLabel}
                  </span>
                </div>
              )}
              <button
                onClick={() => onSectionChange(section.key)}
                title={collapsed ? getLabel(section) : undefined}
                className={`section-nav-item w-full flex items-center gap-3 px-4 py-2.5 text-left relative group ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                  color: isActive ? 'var(--sidebar-fg)' : 'var(--sidebar-muted)',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-accent" />
                )}

                <span className="shrink-0">{section.icon}</span>

                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm truncate">{getLabel(section)}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {count !== null && count > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10" style={{ color: 'var(--sidebar-muted)' }}>
                          {count}
                        </span>
                      )}
                      {isComplete ? (
                        <div className="section-complete-dot" />
                      ) : (
                        <div className="section-empty-dot" />
                      )}
                    </div>
                  </>
                )}

                {/* Collapsed tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {getLabel(section)}
                  </div>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* User info + logout at bottom */}
      {!collapsed && (
        <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--sidebar-fg)' }}>
                {currentUser?.fullName || '—'}
              </div>
              <div className="text-[10px] truncate" style={{ color: 'var(--sidebar-muted)' }}>
                {currentUser?.email || ''}
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                disabled={loggingOut}
                title={lang === 'es' ? 'Cerrar sesión' : lang === 'en' ? 'Logout' : 'Sair'}
                className="shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors disabled:opacity-60"
                style={{ color: 'var(--sidebar-muted)' }}
              >
                {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}