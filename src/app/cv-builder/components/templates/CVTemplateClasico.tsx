import React from 'react';
import { CVData } from '../cvData';

interface Props { cvData: CVData; }

const fontFamilyMap: Record<string, string> = {
  sans: 'system-ui, sans-serif',
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

export default function CVTemplateClasico({ cvData }: Props) {
  const p = cvData.personal;
  const accent = cvData.accentColor || '#8B4513';
  const fontFamily = fontFamilyMap[cvData.fontStyle || 'serif'];
  const baseFontSize = resolveFontSize(cvData.fontSize);
  const fs = (n: number) => `${n}px`;

  const sectionTitle = (label: string) => (
    <div style={{
      ...sectionHeadingBreak,
      fontSize: fs(baseFontSize - 0.5),
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      color: accent,
      borderBottom: `1.5px solid ${accent}`,
      paddingBottom: '3px',
      marginBottom: '10px',
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
        padding: '0 60px',
        fontFamily,
        color: '#2C2C2C',
        fontSize: fs(baseFontSize),
        lineHeight: '1.55',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ── Classic centered header ── */}
      <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '16px', borderBottom: `2px solid ${accent}`, marginBottom: '20px', ...entryStyle }}>
        {cvData.photo && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <img
              src={cvData.photo}
              alt="Profile"
              style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accent}` }}
            />
          </div>
        )}
        <h1 style={{ fontSize: fs(26), fontWeight: 700, letterSpacing: '0.06em', color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>
          {p.fullName || 'TU NOMBRE'}
        </h1>
        {p.professionalTitle && (
          <p style={{ fontSize: fs(12.5), fontWeight: 600, color: accent, marginTop: '5px', margin: '5px 0 0 0' }}>
            {p.professionalTitle}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 16px', marginTop: '8px', fontSize: fs(9.5), color: '#555' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.city && p.country && <span>{p.city}, {p.country}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '48px' }}>

        {p.summary && (
          <div>
            {sectionTitle('Objetivo Profesional')}
            <div
              style={{ color: '#444', lineHeight: '1.6', overflow: 'visible' }}
              className="cv-rich-content"
              dangerouslySetInnerHTML={{ __html: p.summary }}
            />
          </div>
        )}

        {cvData.experience.length > 0 && (
          <div>
            {sectionTitle('Experiencia Profesional')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cvData.experience.map(exp => (
                <div key={`cla-exp-${exp.id}`} style={entryStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{exp.jobTitle}</span>
                      <span style={{ color: '#555', fontSize: fs(baseFontSize) }}> — {exp.company}{exp.location ? `, ${exp.location}` : ''}</span>
                    </div>
                    <span style={{ fontSize: fs(9.5), color: '#666', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {exp.startDate} – {exp.isCurrent ? 'Presente' : exp.endDate}
                    </span>
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
            {sectionTitle('Formación Académica')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.education.map(edu => (
                <div key={`cla-edu-${edu.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', ...entryStyle }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5) }}>{edu.degree}</span>
                    <span style={{ color: '#555', fontSize: fs(baseFontSize - 0.5) }}> — {edu.institution}{edu.location ? `, ${edu.location}` : ''}</span>
                    {edu.gpa && <span style={{ color: '#777', fontSize: fs(9.5) }}> (Promedio: {edu.gpa})</span>}
                  </div>
                  <span style={{ fontSize: fs(9.5), color: '#666', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {edu.startYear} – {edu.isCurrent ? 'Presente' : edu.endYear}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(cvData.skills.length > 0 || cvData.languages.length > 0 || cvData.certifications.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {cvData.skills.length > 0 && (
              <div>
                {sectionTitle('Habilidades')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {cvData.skills.map(skill => (
                    <div key={`cla-skill-${skill.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#444' }}>
                      <span style={{ color: accent, fontSize: fs(10) }}>▪</span>
                      <span>{skill.name}</span>
                      <span style={{ color: '#888', fontSize: fs(9) }}>({skill.level})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cvData.languages.length > 0 && (
                <div>
                  {sectionTitle('Idiomas')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {cvData.languages.map(lang => (
                      <div key={`cla-lang-${lang.id}`} style={{ color: '#444' }}>
                        <span style={{ color: accent }}>▪</span> {lang.language} — {lang.proficiency}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cvData.certifications.length > 0 && (
                <div>
                  {sectionTitle('Certificaciones')}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {cvData.certifications.map(cert => (
                      <div key={`cla-cert-${cert.id}`} style={{ color: '#444', ...entryStyle }}>
                        <span style={{ color: accent }}>▪</span> {cert.name}
                        <span style={{ color: '#666', fontSize: fs(9.5) }}> ({cert.issuer}, {cert.issueDate})</span>
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
            {sectionTitle('Proyectos Destacados')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cvData.projects.map(proj => (
                <div key={`cla-proj-${proj.id}`} style={entryStyle}>
                  <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5), color: '#111' }}>{proj.name}{proj.role ? ` (${proj.role})` : ''}</div>
                  {proj.technologies && <div style={{ color: '#666', fontSize: fs(9.5), fontStyle: 'italic' }}>{proj.technologies}</div>}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {cvData.achievements.map(ach => (
                <div key={`cla-ach-${ach.id}`} style={{ color: '#444', ...entryStyle }}>
                  <span style={{ color: accent }}>▪</span>{' '}
                  <span style={{ fontWeight: 700 }}>{ach.title}</span>
                  {ach.organization && <span> — {ach.organization}</span>}
                  {ach.date && <span style={{ color: '#666', fontSize: fs(9.5) }}> ({ach.date})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}