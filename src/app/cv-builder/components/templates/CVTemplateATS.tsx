import React from 'react';
import { CVData } from '../cvData';

interface Props { cvData: CVData; }

const fontFamilyMap: Record<string, string> = {
  sans: 'Arial, Helvetica, sans-serif',
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

export default function CVTemplateATS({ cvData }: Props) {
  const p = cvData.personal;
  const fontFamily = fontFamilyMap[cvData.fontStyle || 'sans'];
  const baseFontSize = resolveFontSize(cvData.fontSize);
  const fs = (n: number) => `${n}px`;

  const sectionHeadingStyle: React.CSSProperties = {
    ...sectionHeadingBreak,
    fontSize: fs(baseFontSize - 0.5),
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#1a1a1a',
    borderBottom: '1.5px solid #1a1a1a',
    paddingBottom: '3px',
    marginBottom: '8px',
    marginTop: '0',
  };

  const richStyle: React.CSSProperties = {
    marginTop: '4px',
    color: '#333',
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
        color: '#1a1a1a',
        fontSize: fs(baseFontSize),
        lineHeight: '1.55',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '16px', borderBottom: '2px solid #1a1a1a', marginBottom: '18px', ...entryStyle }}>
        <h1 style={{ fontSize: fs(26), fontWeight: 700, letterSpacing: '0.04em', margin: 0, lineHeight: 1.2 }}>
          {p.fullName || 'TU NOMBRE'}
        </h1>
        {p.professionalTitle && (
          <p style={{ fontSize: fs(12), fontWeight: 600, marginTop: '4px', color: '#333', letterSpacing: '0.02em', margin: '4px 0 0 0' }}>
            {p.professionalTitle}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 16px', marginTop: '6px', fontSize: fs(9.5), color: '#444' }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.city && p.country && <span>{p.city}, {p.country}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </div>

      {/* ── Summary ── */}
      {p.summary && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionHeadingStyle}>RESUMEN PROFESIONAL</div>
          <div
            style={{ fontSize: fs(baseFontSize), lineHeight: '1.6', color: '#222', overflow: 'visible' }}
            className="cv-rich-content"
            dangerouslySetInnerHTML={{ __html: p.summary }}
          />
        </div>
      )}

      {/* ── Experience ── */}
      {cvData.experience.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionHeadingStyle}>EXPERIENCIA LABORAL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cvData.experience.map(exp => (
              <div key={`ats-exp-${exp.id}`} style={entryStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5) }}>{exp.jobTitle}</div>
                    <div style={{ fontWeight: 600, color: '#333', fontSize: fs(baseFontSize) }}>
                      {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: fs(9.5), color: '#555', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {exp.startDate} – {exp.isCurrent ? 'Presente' : exp.endDate}
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

      {/* ── Education ── */}
      {cvData.education.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionHeadingStyle}>EDUCACIÓN</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {cvData.education.map(edu => (
              <div key={`ats-edu-${edu.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', ...entryStyle }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5) }}>{edu.degree}</div>
                  <div style={{ color: '#444', fontSize: fs(baseFontSize - 0.5) }}>
                    {edu.institution}{edu.location ? `, ${edu.location}` : ''}{edu.gpa ? ` — Promedio: ${edu.gpa}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: fs(9.5), color: '#555', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {edu.startYear} – {edu.isCurrent ? 'Presente' : edu.endYear}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills ── */}
      {cvData.skills.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionHeadingStyle}>HABILIDADES</div>
          <p style={{ lineHeight: '1.6', color: '#222', margin: 0 }}>
            {cvData.skills.map(s => s.name).join(' · ')}
          </p>
        </div>
      )}

      {/* ── Languages ── */}
      {cvData.languages.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionHeadingStyle}>IDIOMAS</div>
          <p style={{ color: '#222', margin: 0 }}>
            {cvData.languages.map(l => `${l.language} (${l.proficiency})`).join(' · ')}
          </p>
        </div>
      )}

      {/* ── Certifications ── */}
      {cvData.certifications.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionHeadingStyle}>CERTIFICACIONES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {cvData.certifications.map(cert => (
              <div key={`ats-cert-${cert.id}`} style={{ display: 'flex', justifyContent: 'space-between', ...entryStyle }}>
                <span style={{ fontWeight: 600 }}>{cert.name} — {cert.issuer}</span>
                <span style={{ color: '#555' }}>{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ── */}
      {cvData.projects.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionHeadingStyle}>PROYECTOS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {cvData.projects.map(proj => (
              <div key={`ats-proj-${proj.id}`} style={entryStyle}>
                <div style={{ fontWeight: 700, fontSize: fs(baseFontSize + 0.5) }}>{proj.name}{proj.role ? ` — ${proj.role}` : ''}</div>
                {proj.technologies && <div style={{ color: '#555', fontSize: fs(9.5) }}>Tecnologías: {proj.technologies}</div>}
                {proj.description && (
                  <div style={{ ...richStyle, marginTop: '2px' }} className="cv-rich-content" dangerouslySetInnerHTML={{ __html: proj.description }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Achievements ── */}
      {cvData.achievements.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={sectionHeadingStyle}>LOGROS Y RECONOCIMIENTOS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {cvData.achievements.map(ach => (
              <div key={`ats-ach-${ach.id}`} style={{ display: 'flex', justifyContent: 'space-between', ...entryStyle }}>
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
  );
}