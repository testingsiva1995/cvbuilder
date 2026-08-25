import React from 'react';
import { CVData } from '../cvData';

interface Props { cvData: CVData; }

const fontFamilyMap: Record<string, string> = {
  sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
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

export default function CVTemplateEjecutivo({ cvData }: Props) {
  const p = cvData.personal;
  const accent = cvData.accentColor || '#C0A060';
  const headerBg = '#1A1A2E';
  const fontFamily = fontFamilyMap[cvData.fontStyle || 'serif'];
  const baseFontSize = resolveFontSize(cvData.fontSize);
  const fs = (n: number) => `${n}px`;

  const sectionTitle = (label: string) => (
    <div style={{
      ...sectionHeadingBreak,
      fontSize: fs(baseFontSize - 1),
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.18em',
      color: accent,
      marginBottom: '10px',
      paddingBottom: '3px',
      borderBottom: `1px solid ${accent}`,
    }}>
      {label}
    </div>
  );

  const richStyle: React.CSSProperties = {
    marginTop: '5px',
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
        color: '#1a1a1a',
        fontSize: fs(baseFontSize),
        lineHeight: '1.55',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ── Premium dark header ── */}
      <div style={{ backgroundColor: headerBg, padding: '36px 52px 32px 52px', ...entryStyle }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: fs(28), fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: 0 }}>
              {p.fullName || 'Tu Nombre'}
            </h1>
            {p.professionalTitle && (
              <p style={{ fontSize: fs(13), fontWeight: 500, color: accent, marginTop: '5px', margin: '5px 0 0 0' }}>
                {p.professionalTitle}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 20px', marginTop: '12px', fontSize: fs(9.5), color: 'rgba(255,255,255,0.65)' }}>
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.city && p.country && <span>{p.city}, {p.country}</span>}
              {p.linkedin && <span>{p.linkedin}</span>}
            </div>
          </div>
          {cvData.photo ? (
            <img
              src={cvData.photo}
              alt="Profile"
              style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accent}`, flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs(20), fontWeight: 700, color: headerBg, flexShrink: 0 }}>
              {p.fullName ? p.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'}
            </div>
          )}
        </div>
      </div>

      {/* ── Gold accent line ── */}
      <div style={{ height: '4px', backgroundColor: accent }} />

      {/* ── Body ── */}
      <div style={{ padding: '20px 52px 48px 52px', backgroundColor: '#FAFAF8', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {p.summary && (
          <div>
            {sectionTitle('PERFIL EJECUTIVO')}
            <div
              style={{ color: '#333', lineHeight: '1.6', overflow: 'visible' }}
              className="cv-rich-content"
              dangerouslySetInnerHTML={{ __html: p.summary }}
            />
          </div>
        )}

        {cvData.experience.length > 0 && (
          <div>
            {sectionTitle('TRAYECTORIA PROFESIONAL')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cvData.experience.map(exp => (
                <div key={`eje-exp-${exp.id}`} style={{ borderLeft: `2.5px solid ${accent}`, paddingLeft: '12px', ...entryStyle }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{exp.jobTitle}</div>
                      <div style={{ fontWeight: 600, fontSize: fs(baseFontSize), color: headerBg }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                    </div>
                    <div style={{ fontSize: fs(9.5), color: '#666', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {exp.startDate} — {exp.isCurrent ? 'Presente' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <div style={richStyle} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: exp.description }} />
                  )}
                  {exp.achievements && (
                    <div style={{ ...richStyle, marginTop: '3px' }} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: exp.achievements }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.education.length > 0 && (
          <div>
            {sectionTitle('FORMACIÓN ACADÉMICA')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.education.map(edu => (
                <div key={`eje-edu-${edu.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', ...entryStyle }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{edu.degree}</div>
                    <div style={{ color: '#555', fontSize: fs(baseFontSize - 0.5) }}>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</div>
                  </div>
                  <div style={{ fontSize: fs(9.5), color: '#666', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {edu.startYear} — {edu.isCurrent ? 'Presente' : edu.endYear}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(cvData.skills.length > 0 || cvData.languages.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {cvData.skills.length > 0 && (
              <div>
                {sectionTitle('COMPETENCIAS')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {cvData.skills.map(skill => (
                    <span key={`eje-skill-${skill.id}`} style={{ fontSize: fs(9.5), padding: '3px 8px', borderRadius: '3px', fontWeight: 600, backgroundColor: headerBg, color: accent }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cvData.languages.length > 0 && (
              <div>
                {sectionTitle('IDIOMAS')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {cvData.languages.map(lang => (
                    <div key={`eje-lang-${lang.id}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500, color: '#333' }}>{lang.language}</span>
                      <span style={{ fontWeight: 600, color: headerBg }}>{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {cvData.certifications.length > 0 && (
          <div>
            {sectionTitle('CERTIFICACIONES')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {cvData.certifications.map(cert => (
                <div key={`eje-cert-${cert.id}`} style={{ display: 'flex', justifyContent: 'space-between', ...entryStyle }}>
                  <span style={{ fontWeight: 600, color: '#222' }}>{cert.name} — {cert.issuer}</span>
                  <span style={{ color: '#666' }}>{cert.issueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.projects.length > 0 && (
          <div>
            {sectionTitle('PROYECTOS')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.projects.map(proj => (
                <div key={`eje-proj-${proj.id}`} style={entryStyle}>
                  <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{proj.name}{proj.role ? ` — ${proj.role}` : ''}</div>
                  {proj.technologies && <div style={{ color: '#666', fontSize: fs(9.5) }}>{proj.technologies}</div>}
                  {proj.description && (
                    <div style={{ marginTop: '3px', color: '#444', lineHeight: '1.6', overflow: 'visible' }} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: proj.description }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.achievements.length > 0 && (
          <div>
            {sectionTitle('RECONOCIMIENTOS')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {cvData.achievements.map(ach => (
                <div key={`eje-ach-${ach.id}`} style={{ display: 'flex', justifyContent: 'space-between', ...entryStyle }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{ach.title}</span>
                    {ach.organization && <span style={{ color: '#555' }}> — {ach.organization}</span>}
                  </div>
                  <span style={{ color: '#555', flexShrink: 0 }}>{ach.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}