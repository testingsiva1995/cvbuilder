import React from 'react';
import { CVData } from '../cvData';

interface Props { cvData: CVData; }

const skillLevelWidth: Record<string, string> = {
  Básico: '25%', Intermedio: '50%', Avanzado: '75%', Experto: '100%',
};

const fontFamilyMap: Record<string, string> = {
  sans: "'Inter', 'Helvetica Neue', system-ui, sans-serif",
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
  calibri: "'Calibri', 'Carlito', 'Trebuchet MS', Arial, sans-serif",
};

function resolveFontSize(raw: string | undefined): number {
  const legacyMap: Record<string, number> = { sm: 10, md: 10.5, lg: 12 };
  if (!raw) return 10.5;
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  return legacyMap[raw] ?? 10.5;
}

const entryStyle: React.CSSProperties = {
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const sectionHeadingBreak: React.CSSProperties = {
  breakAfter: 'avoid',
  pageBreakAfter: 'avoid',
};

export default function CVTemplateCreativo({ cvData }: Props) {
  const p = cvData.personal;
  const accent = cvData.accentColor || '#6C3483';
  const secondary = '#E74C3C';
  const fontFamily = fontFamilyMap[cvData.fontStyle || 'sans'];
  const baseFontSize = resolveFontSize(cvData.fontSize);
  const fs = (n: number) => `${n}px`;

  const sidebarSectionTitle = (label: string) => (
    <div style={{
      ...sectionHeadingBreak,
      fontSize: fs(8.5),
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.14em',
      color: secondary,
      marginBottom: '7px',
    }}>
      {label}
    </div>
  );

  const mainSectionTitle = (label: string, color = accent) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', ...sectionHeadingBreak }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: color, flexShrink: 0 }} />
      <div style={{ fontSize: fs(10), fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color }}>
        {label}
      </div>
    </div>
  );

  const richStyle: React.CSSProperties = {
    marginTop: '6px',
    color: '#444',
    lineHeight: '1.6',
    overflow: 'visible',
  };

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        fontFamily,
        fontSize: fs(baseFontSize),
        lineHeight: '1.55',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        display: 'flex',
      }}
    >
      {/* ── Left sidebar ── */}
      <div style={{ width: '200px', flexShrink: 0, backgroundColor: accent, padding: '36px 18px 40px 18px', display: 'flex', flexDirection: 'column', gap: '20px', color: '#fff' }}>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {cvData.photo ? (
            <img
              src={cvData.photo}
              alt="Profile"
              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid rgba(255,255,255,0.5)' }}
            />
          ) : (
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs(22), fontWeight: 800, color: '#fff' }}>
              {p.fullName ? p.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'JG'}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: fs(12), fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{p.fullName || 'Tu Nombre'}</div>
            {p.professionalTitle && (
              <div style={{ fontSize: fs(9.5), marginTop: '3px', color: 'rgba(255,255,255,0.8)' }}>{p.professionalTitle}</div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div>
          {sidebarSectionTitle('Contacto')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: fs(9), color: 'rgba(255,255,255,0.85)' }}>
            {p.email && <span style={{ wordBreak: 'break-all' }}>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.city && p.country && <span>{p.city}, {p.country}</span>}
            {p.linkedin && <span style={{ wordBreak: 'break-all' }}>{p.linkedin}</span>}
          </div>
        </div>

        {/* Skills */}
        {cvData.skills.length > 0 && (
          <div>
            {sidebarSectionTitle('Habilidades')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {cvData.skills.slice(0, 7).map(skill => (
                <div key={`cre-skill-${skill.id}`}>
                  <div style={{ fontSize: fs(9), color: 'rgba(255,255,255,0.9)', marginBottom: '3px' }}>{skill.name}</div>
                  <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <div style={{ height: '100%', borderRadius: '2px', width: skillLevelWidth[skill.level] || '50%', backgroundColor: secondary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {cvData.languages.length > 0 && (
          <div>
            {sidebarSectionTitle('Idiomas')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {cvData.languages.map(lang => (
                <div key={`cre-lang-${lang.id}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs(9) }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>{lang.language}</span>
                  <span style={{ color: secondary, fontWeight: 700 }}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div>
            {sidebarSectionTitle('Certificaciones')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cvData.certifications.map(cert => (
                <div key={`cre-cert-${cert.id}`} style={{ fontSize: fs(9) }}>
                  <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>{cert.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)' }}>{cert.issuer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right main content ── */}
      <div style={{ flex: 1, padding: '36px 36px 48px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {p.summary && (
          <div>
            {mainSectionTitle('Sobre mí')}
            <div
              style={{ color: '#444', lineHeight: '1.6', overflow: 'visible' }}
              className="cv-rich-content"
              dangerouslySetInnerHTML={{ __html: p.summary }}
            />
          </div>
        )}

        {cvData.experience.length > 0 && (
          <div>
            {mainSectionTitle('Experiencia', secondary)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cvData.experience.map(exp => (
                <div key={`cre-exp-${exp.id}`} style={{ borderRadius: '6px', padding: '10px 12px', backgroundColor: '#F8F0FB', ...entryStyle }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: fs(baseFontSize + 0.5), color: accent }}>{exp.jobTitle}</div>
                      <div style={{ fontWeight: 600, fontSize: fs(baseFontSize), color: '#555' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                    </div>
                    <div style={{ fontSize: fs(9), padding: '2px 7px', borderRadius: '10px', backgroundColor: secondary, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {exp.startDate} — {exp.isCurrent ? 'Hoy' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <div style={{ marginTop: '6px', color: '#444', lineHeight: '1.6', overflow: 'visible' }} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: exp.description }} />
                  )}
                  {exp.achievements && (
                    <div style={{ marginTop: '4px', color: '#444', lineHeight: '1.6', overflow: 'visible' }} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: exp.achievements }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.education.length > 0 && (
          <div>
            {mainSectionTitle('Educación')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.education.map(edu => (
                <div key={`cre-edu-${edu.id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', ...entryStyle }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', marginTop: '5px', flexShrink: 0, backgroundColor: secondary }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{edu.degree}</div>
                    <div style={{ color: '#555', fontSize: fs(baseFontSize) }}>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</div>
                    <div style={{ fontSize: fs(9), color: '#888' }}>{edu.startYear} — {edu.isCurrent ? 'Presente' : edu.endYear}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.projects.length > 0 && (
          <div>
            {mainSectionTitle('Proyectos', secondary)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.projects.map(proj => (
                <div key={`cre-proj-${proj.id}`} style={{ borderRadius: '6px', padding: '8px 10px', backgroundColor: '#FEF9F0', ...entryStyle }}>
                  <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: accent }}>{proj.name}</div>
                  {proj.technologies && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
                      {proj.technologies.split(',').map((tech, ti) => (
                        <span key={`cre-tech-${proj.id}-${ti}`} style={{ fontSize: fs(8.5), padding: '2px 6px', borderRadius: '3px', backgroundColor: accent, color: '#fff', fontWeight: 600 }}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && (
                    <div style={{ marginTop: '4px', color: '#444', lineHeight: '1.6', overflow: 'visible' }} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: proj.description }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.achievements.length > 0 && (
          <div>
            {mainSectionTitle('Logros')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cvData.achievements.map(ach => (
                <div key={`cre-ach-${ach.id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', ...entryStyle }}>
                  <span style={{ fontSize: fs(14), flexShrink: 0, color: secondary }}>🏆</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{ach.title}</div>
                    {ach.organization && <div style={{ color: '#666', fontSize: fs(9.5) }}>{ach.organization} · {ach.date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}