import React from 'react';
import { CVData } from '../cvData';

interface Props { cvData: CVData; }

const skillLevelWidth: Record<string, string> = {
  Básico: '25%', Intermedio: '50%', Avanzado: '75%', Experto: '100%',
};

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

export default function CVTemplateModerno({ cvData }: Props) {
  const p = cvData.personal;
  const accent = cvData.accentColor || '#1B4F72';
  const fontFamily = fontFamilyMap[cvData.fontStyle || 'sans'];
  const baseFontSize = resolveFontSize(cvData.fontSize);
  const fs = (n: number) => `${n}px`;

  const sectionTitle = (label: string) => (
    <div style={{
      ...sectionHeadingBreak,
      fontSize: fs(baseFontSize - 0.5),
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      color: accent,
      borderBottom: `2px solid ${accent}`,
      paddingBottom: '3px',
      marginBottom: '10px',
    }}>
      {label}
    </div>
  );

  const richStyle: React.CSSProperties = {
    marginTop: '4px',
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
        color: '#1a1a1a',
      }}
    >
      {/* ── Accent header ── */}
      <div style={{ backgroundColor: accent, padding: '36px 48px 28px 48px', ...entryStyle }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {cvData.photo && (
            <img
              src={cvData.photo}
              alt="Profile"
              style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid rgba(255,255,255,0.5)', flexShrink: 0 }}
            />
          )}
          <div style={{ color: '#fff' }}>
            <h1 style={{ fontSize: fs(26), fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
              {p.fullName || 'Tu Nombre'}
            </h1>
            {p.professionalTitle && (
              <p style={{ fontSize: fs(13), fontWeight: 500, marginTop: '4px', color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
                {p.professionalTitle}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 18px', marginTop: '10px', fontSize: fs(9.5), color: 'rgba(255,255,255,0.75)' }}>
              {p.email && <span>✉ {p.email}</span>}
              {p.phone && <span>📱 {p.phone}</span>}
              {p.city && p.country && <span>📍 {p.city}, {p.country}</span>}
              {p.linkedin && <span>in {p.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body — no top padding, content flows directly after header ── */}
      <div style={{ padding: '20px 48px 48px 48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {p.summary && (
          <div>
            {sectionTitle('Resumen Profesional')}
            <div
              style={{ color: '#333', lineHeight: '1.6', overflow: 'visible' }}
              className="cv-rich-content"
              dangerouslySetInnerHTML={{ __html: p.summary }}
            />
          </div>
        )}

        {cvData.experience.length > 0 && (
          <div>
            {sectionTitle('Experiencia Laboral')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cvData.experience.map(exp => (
                <div key={`mod-exp-${exp.id}`} style={entryStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{exp.jobTitle}</div>
                      <div style={{ fontWeight: 600, fontSize: fs(baseFontSize), color: accent }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
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
            {sectionTitle('Educación')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.education.map(edu => (
                <div key={`mod-edu-${edu.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', ...entryStyle }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{edu.degree}</div>
                    <div style={{ color: '#555', fontSize: fs(baseFontSize - 0.5) }}>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</div>
                    {edu.gpa && <div style={{ color: '#777', fontSize: fs(9.5) }}>Promedio: {edu.gpa}</div>}
                  </div>
                  <div style={{ fontSize: fs(9.5), color: '#666', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {edu.startYear} — {edu.isCurrent ? 'Presente' : edu.endYear}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-column: Skills + (Languages + Certs) */}
        {(cvData.skills.length > 0 || cvData.languages.length > 0 || cvData.certifications.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {cvData.skills.length > 0 && (
              <div>
                {sectionTitle('Habilidades')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {cvData.skills.slice(0, 8).map(skill => (
                    <div key={`mod-skill-${skill.id}`} style={entryStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 500, color: '#333' }}>{skill.name}</span>
                        <span style={{ fontSize: fs(9), color: '#888' }}>{skill.level}</span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '3px', backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '3px', width: skillLevelWidth[skill.level] || '50%', backgroundColor: accent }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cvData.languages.length > 0 && (
                <div>
                  {sectionTitle('Idiomas')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {cvData.languages.map(lang => (
                      <div key={`mod-lang-${lang.id}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 500, color: '#333' }}>{lang.language}</span>
                        <span style={{ fontWeight: 600, color: accent }}>{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cvData.certifications.length > 0 && (
                <div>
                  {sectionTitle('Certificaciones')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {cvData.certifications.map(cert => (
                      <div key={`mod-cert-${cert.id}`} style={entryStyle}>
                        <div style={{ fontWeight: 600, color: '#222' }}>{cert.name}</div>
                        <div style={{ color: '#666', fontSize: fs(9.5) }}>{cert.issuer} · {cert.issueDate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {cvData.projects.length > 0 && (
          <div>
            {sectionTitle('Proyectos')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.projects.map(proj => (
                <div key={`mod-proj-${proj.id}`} style={entryStyle}>
                  <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{proj.name}</div>
                  {proj.technologies && <div style={{ color: '#666', fontSize: fs(9.5), marginTop: '1px' }}>{proj.technologies}</div>}
                  {proj.description && (
                    <div style={{ ...richStyle, marginTop: '3px' }} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: proj.description }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.achievements.length > 0 && (
          <div>
            {sectionTitle('Logros y Reconocimientos')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {cvData.achievements.map(ach => (
                <div key={`mod-ach-${ach.id}`} style={{ display: 'flex', justifyContent: 'space-between', ...entryStyle }}>
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