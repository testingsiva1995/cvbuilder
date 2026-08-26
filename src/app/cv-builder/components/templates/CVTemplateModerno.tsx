import React from 'react';
import { CVData } from '../cvData';

type Lang = 'es' | 'en' | 'pt';

interface Props {
  lang: Lang;
  cvData: CVData;
}

const labels: Record<
  Lang,
  {
    summary: string;
    experience: string;
    education: string;
    average: string;
    present: string;
    skills: string;
    languages: string;
    certifications: string;
    projects: string;
    achievements: string;
  }
> = {
  es: {
    summary: 'Resumen Profesional',
    experience: 'Experiencia Laboral',
    education: 'Educación',
    average: 'Promedio',
    present: 'Presente',
    skills: 'Habilidades',
    languages: 'Idiomas',
    certifications: 'Certificaciones',
    projects: 'Proyectos',
    achievements: 'Logros y Reconocimientos',
  },

  en: {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    average: 'GPA',
    present: 'Present',
    skills: 'Skills',
    languages: 'Languages',
    certifications: 'Certifications',
    projects: 'Projects',
    achievements: 'Achievements & Awards',
  },

  pt: {
    summary: 'Resumo Profissional',
    experience: 'Experiência Profissional',
    education: 'Educação',
    average: 'Média',
    present: 'Atual',
    skills: 'Habilidades',
    languages: 'Idiomas',
    certifications: 'Certificações',
    projects: 'Projetos',
    achievements: 'Conquistas e Reconhecimentos',
  },
};

const skillLevelWidth: Record<string, string> = {
  Básico: '25%',
  Intermedio: '50%',
  Avanzado: '75%',
  Experto: '100%',

  Basic: '25%',
  Intermediate: '50%',
  Advanced: '75%',
  Expert: '100%',

  Intermediário: '50%',
  Avançado: '75%',
  Especialista: '100%',
};

const fontFamilyMap: Record<string, string> = {
  sans: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
  calibri:
    "'Calibri', 'Carlito', 'Trebuchet MS', Arial, sans-serif",
};

function resolveFontSize(
  raw: string | undefined
): number {
  const legacyMap: Record<string, number> = {
    sm: 10,
    md: 10.5,
    lg: 12,
  };

  if (!raw) return 10.5;

  if (/^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }

  return legacyMap[raw] ?? 10.5;
}

/*
 * ============================================================
 * PAGE-BREAK HELPERS
 * ============================================================
 *
 * These styles tell the browser/html2canvas rendering system:
 *
 * - Do not split individual CV entries when possible.
 * - Do not leave a section heading by itself.
 * - Do not split individual bullets.
 *
 * Important:
 * We protect SMALL logical blocks rather than the entire
 * section. This prevents huge blank spaces when a section
 * itself is very long.
 */

const entryStyle: React.CSSProperties = {
  breakInside: 'avoid',
  pageBreakInside: 'avoid',
};

const sectionStyle: React.CSSProperties = {
  breakInside: 'auto',
  pageBreakInside: 'auto',
};

const sectionHeadingBreak: React.CSSProperties = {
  breakAfter: 'avoid',
  pageBreakAfter: 'avoid',
};

/*
 * ============================================================
 * MAIN TEMPLATE
 * ============================================================
 */

export default function CVTemplateModerno({
  lang,
  cvData,
}: Props) {
  const p = cvData.personal;
  const t = labels[lang];

  const accent =
    cvData.accentColor ||
    '#1B4F72';

  const fontFamily =
    fontFamilyMap[
      cvData.fontStyle || 'sans'
    ];

  const baseFontSize =
    resolveFontSize(
      cvData.fontSize
    );

  const fs = (n: number) =>
    `${n}px`;

  /*
   * ==========================================================
   * SECTION TITLE
   * ==========================================================
   */

  const sectionTitle = (
    label: string
  ) => (
    <div
      style={{
        ...sectionHeadingBreak,

        fontSize: fs(
          Math.max(
            9,
            baseFontSize - 0.5
          )
        ),

        fontWeight: 800,

        textTransform:
          'uppercase',

        letterSpacing:
          '0.12em',

        color: accent,

        borderBottom:
          `2px solid ${accent}`,

        paddingBottom:
          '3px',

        marginBottom:
          '10px',

        /*
         * Keep heading with the content immediately following it.
         */
        breakAfter:
          'avoid',

        pageBreakAfter:
          'avoid',
      }}
    >
      {label}
    </div>
  );

  /*
   * ==========================================================
   * RICH TEXT
   * ==========================================================
   */

  const richStyle: React.CSSProperties =
    {
      marginTop: '4px',
      color: '#444',
      lineHeight: '1.55',
      overflow: 'visible',
      maxWidth: '100%',
      overflowWrap: 'anywhere',
      wordBreak: 'normal',

      /*
       * Prevent the rich-text container itself from being
       * unnecessarily split when it is small.
       */
      breakInside: 'auto',
      pageBreakInside: 'auto',
    };

  /*
   * ==========================================================
   * TEMPLATE
   * ==========================================================
   */

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',

        fontFamily,

        fontSize:
          fs(baseFontSize),

        lineHeight:
          '1.55',

        boxSizing:
          'border-box',

        overflowWrap:
          'anywhere',

        wordBreak:
          'normal',

        backgroundColor:
          '#ffffff',

        color: '#1a1a1a',
      }}
    >
      {/* ======================================================
          ACCENT HEADER
          ====================================================== */}

      <div
        style={{
          backgroundColor:
            accent,

          /*
           * Header starts immediately at the top.
           * No artificial white space above it.
           */
          padding:
            '36px 48px 28px 48px',

          ...entryStyle,
        }}
      >
        <div
          style={{
            display:
              'flex',

            alignItems:
              'center',

            gap:
              '20px',
          }}
        >
          {/* PROFILE PHOTO */}

          {cvData.photo && (
            <img
              src={
                cvData.photo
              }
              alt="Profile"
              style={{
                width:
                  '72px',

                height:
                  '72px',

                borderRadius:
                  '50%',

                objectFit:
                  'cover',

                border:
                  '2.5px solid rgba(255,255,255,0.5)',

                flexShrink:
                  0,
              }}
            />
          )}

          {/* NAME + CONTACT */}

          <div
            style={{
              color:
                '#fff',

              minWidth:
                0,
            }}
          >
            <h1
              style={{
                fontSize:
                  fs(26),

                fontWeight:
                  800,

                lineHeight:
                  1.15,

                margin:
                  0,

                wordBreak:
                  'break-word',
              }}
            >
              {p.fullName ||
                'Tu Nombre'}
            </h1>

            {p.professionalTitle && (
              <p
                style={{
                  fontSize:
                    fs(13),

                  fontWeight:
                    500,

                  color:
                    'rgba(255,255,255,0.85)',

                  margin:
                    '4px 0 0 0',

                  lineHeight:
                    1.3,

                  wordBreak:
                    'break-word',
                }}
              >
                {
                  p.professionalTitle
                }
              </p>
            )}

            {/*
             * CONTACT INFORMATION
             *
             * Increased from 9.5px to 11px.
             */}

            <div
              style={{
                display:
                  'flex',

                flexWrap:
                  'wrap',

                gap:
                  '5px 18px',

                marginTop:
                  '10px',

                fontSize:
                  fs(11),

                lineHeight:
                  1.35,

                color:
                  'rgba(255,255,255,0.82)',
              }}
            >
              {p.email && (
                <span
                  style={{
                    wordBreak:
                      'break-word',
                  }}
                >
                  ✉ {p.email}
                </span>
              )}

              {p.phone && (
                <span
                  style={{
                    wordBreak:
                      'break-word',
                  }}
                >
                  📱 {p.phone}
                </span>
              )}

              {p.city &&
                p.country && (
                  <span>
                    📍 {p.city},{' '}
                    {p.country}
                  </span>
                )}

              {p.linkedin && (
                <span
                  style={{
                    wordBreak:
                      'break-word',
                  }}
                >
                  in {p.linkedin}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          BODY
          ====================================================== */}

      <div
        data-cv-body="true"
        style={{
          padding:
            '20px 48px 48px 48px',

          display:
            'flex',

          flexDirection:
            'column',

          gap:
            '16px',
        }}
      >
        {/* ====================================================
            PROFESSIONAL SUMMARY
            ==================================================== */}

        {p.summary && (
          <div
            style={{
              ...sectionStyle,
            }}
          >
            {sectionTitle(
              t.summary
            )}

            <div
              style={{
                color:
                  '#333',

                lineHeight:
                  '1.6',

                overflow:
                  'visible',

                breakInside:
                  'avoid',

                pageBreakInside:
                  'avoid',
              }}
              className="cv-rich-content"
              dangerouslySetInnerHTML={{
                __html:
                  p.summary,
              }}
            />
          </div>
        )}

        {/* ====================================================
            WORK EXPERIENCE
            ==================================================== */}

        {cvData.experience
          .length > 0 && (
          <div
            style={{
              ...sectionStyle,
            }}
          >
            {sectionTitle(
              t.experience
            )}

            <div
              style={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  '12px',
              }}
            >
              {cvData.experience.map(
                (exp) => (
                  <div
                    key={`mod-exp-${exp.id}`}
                    style={{
                      ...entryStyle,

                      /*
                       * Keep a complete job together when
                       * it reasonably fits.
                       */
                      orphans: 3,
                      widows: 3,
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',

                        justifyContent:
                          'space-between',

                        alignItems:
                          'flex-start',

                        gap:
                          '8px',
                      }}
                    >
                      <div
                        style={{
                          minWidth:
                            0,
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              700,

                            fontSize:
                              fs(
                                baseFontSize +
                                  0.5
                              ),

                            color:
                              '#111',

                            lineHeight:
                              1.3,

                            wordBreak:
                              'break-word',
                          }}
                        >
                          {
                            exp.jobTitle
                          }
                        </div>

                        <div
                          style={{
                            fontWeight:
                              600,

                            fontSize:
                              fs(
                                baseFontSize
                              ),

                            color:
                              accent,

                            lineHeight:
                              1.3,

                            wordBreak:
                              'break-word',
                          }}
                        >
                          {
                            exp.company
                          }

                          {exp.location
                            ? ` · ${exp.location}`
                            : ''}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize:
                            fs(9.5),

                          color:
                            '#666',

                          whiteSpace:
                            'nowrap',

                          flexShrink:
                            0,
                        }}
                      >
                        {
                          exp.startDate
                        }{' '}
                        —{' '}
                        {exp.isCurrent
                          ? t.present
                          : exp.endDate}
                      </div>
                    </div>

                    {exp.description && (
                      <div
                        style={{
                          ...richStyle,

                          marginTop:
                            '5px',
                        }}
                        className="cv-rich-content"
                        dangerouslySetInnerHTML={{
                          __html:
                            exp.description,
                        }}
                      />
                    )}

                    {exp.achievements && (
                      <div
                        style={{
                          ...richStyle,

                          marginTop:
                            '3px',
                        }}
                        className="cv-rich-content"
                        dangerouslySetInnerHTML={{
                          __html:
                            exp.achievements,
                        }}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            EDUCATION
            ==================================================== */}

        {cvData.education
          .length > 0 && (
          <div
            style={{
              ...sectionStyle,
            }}
          >
            {sectionTitle(
              t.education
            )}

            <div
              style={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  '8px',
              }}
            >
              {cvData.education.map(
                (edu) => (
                  <div
                    key={`mod-edu-${edu.id}`}
                    style={{
                      ...entryStyle,

                      display:
                        'flex',

                      justifyContent:
                        'space-between',

                      alignItems:
                        'flex-start',

                      gap:
                        '8px',
                    }}
                  >
                    <div
                      style={{
                        minWidth:
                          0,
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            700,

                          fontSize:
                            fs(
                              baseFontSize +
                                0.5
                            ),

                          color:
                            '#111',

                          lineHeight:
                            1.3,

                          wordBreak:
                            'break-word',
                        }}
                      >
                        {
                          edu.degree
                        }
                      </div>

                      <div
                        style={{
                          color:
                            '#555',

                          fontSize:
                            fs(
                              Math.max(
                                9,
                                baseFontSize -
                                  0.5
                              )
                            ),

                          lineHeight:
                            1.3,

                          wordBreak:
                            'break-word',
                        }}
                      >
                        {
                          edu.institution
                        }

                        {edu.location
                          ? `, ${edu.location}`
                          : ''}
                      </div>

                      {edu.gpa && (
                        <div
                          style={{
                            color:
                              '#777',

                            fontSize:
                              fs(9.5),

                            marginTop:
                              '2px',
                          }}
                        >
                          {
                            t.average
                          }
                          :{' '}
                          {edu.gpa}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize:
                          fs(9.5),

                        color:
                          '#666',

                        whiteSpace:
                          'nowrap',

                        flexShrink:
                          0,
                      }}
                    >
                      {
                        edu.startYear
                      }{' '}
                      —{' '}
                      {edu.isCurrent
                        ? t.present
                        : edu.endYear}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            SKILLS + LANGUAGES + CERTIFICATIONS
            ==================================================== */}

        {(cvData.skills
          .length > 0 ||
          cvData.languages
            .length > 0 ||
          cvData.certifications
            .length > 0) && (
          <div
            data-cv-page-block="skills-languages-certifications"
            style={{
              ...sectionStyle,

              display:
                'grid',

              gridTemplateColumns:
                '1fr 1fr',

              gap:
                '20px',

              alignItems:
                'start',

              /* HARD PAGE BLOCK: Skills + Languages + Certifications. */
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
              breakBefore: 'auto',
              pageBreakBefore: 'auto',
            }}
          >
            {/* ==================================================
                SKILLS
                ================================================== */}

            {cvData.skills
              .length > 0 && (
              <div
                style={{
                  ...sectionStyle,
                }}
              >
                {sectionTitle(
                  t.skills
                )}

                <div
                  style={{
                    display:
                      'flex',

                    flexDirection:
                      'column',

                    gap:
                      '7px',
                  }}
                >
                  {cvData.skills
                    .slice(
                      0,
                      8
                    )
                    .map(
                      (
                        skill
                      ) => (
                        <div
                          key={`mod-skill-${skill.id}`}
                          style={{
                            ...entryStyle,
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',

                              justifyContent:
                                'space-between',

                              alignItems:
                                'center',

                              gap:
                                '8px',

                              marginBottom:
                                '3px',
                            }}
                          >
                            <span
                              style={{
                                fontWeight:
                                  500,

                                color:
                                  '#333',

                                minWidth:
                                  0,

                                wordBreak:
                                  'break-word',
                              }}
                            >
                              {
                                skill.name
                              }
                            </span>

                            <span
                              style={{
                                fontSize:
                                  fs(9),

                                color:
                                  '#888',

                                flexShrink:
                                  0,
                              }}
                            >
                              {
                                skill.level
                              }
                            </span>
                          </div>

                          <div
                            style={{
                              height:
                                '5px',

                              borderRadius:
                                '3px',

                              backgroundColor:
                                '#E5E7EB',

                              overflow:
                                'hidden',
                            }}
                          >
                            <div
                              style={{
                                height:
                                  '100%',

                                borderRadius:
                                  '3px',

                                width:
                                  skillLevelWidth[
                                    skill.level
                                  ] ||
                                  '50%',

                                backgroundColor:
                                  accent,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}

            {/* ==================================================
                LANGUAGES + CERTIFICATIONS
                ================================================== */}

            <div
              style={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  '16px',

                minWidth:
                  0,
              }}
            >
              {/* ==================================================
                  LANGUAGES
                  ================================================== */}

              {cvData.languages
                .length > 0 && (
                <div
                  style={{
                    ...sectionStyle,
                  }}
                >
                  {sectionTitle(
                    t.languages
                  )}

                  <div
                    style={{
                      display:
                        'flex',

                      flexDirection:
                        'column',

                      gap:
                        '4px',
                    }}
                  >
                    {cvData.languages.map(
                      (
                        langItem
                      ) => (
                        <div
                          key={`mod-lang-${langItem.id}`}
                          style={{
                            ...entryStyle,

                            display:
                              'flex',

                            justifyContent:
                              'space-between',

                            gap:
                              '8px',
                          }}
                        >
                          <span
                            style={{
                              fontWeight:
                                500,

                              color:
                                '#333',

                              minWidth:
                                0,

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {
                              langItem.language
                            }
                          </span>

                          <span
                            style={{
                              fontWeight:
                                600,

                              color:
                                accent,

                              flexShrink:
                                0,
                            }}
                          >
                            {
                              langItem.proficiency
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================
                  CERTIFICATIONS
                  ================================================== */}

              {cvData.certifications
                .length > 0 && (
                <div
                  style={{
                    ...sectionStyle,
                  }}
                >
                  {sectionTitle(
                    t.certifications
                  )}

                  <div
                    style={{
                      display:
                        'flex',

                      flexDirection:
                        'column',

                      gap:
                        '5px',
                    }}
                  >
                    {cvData.certifications.map(
                      (
                        cert
                      ) => (
                        <div
                          key={`mod-cert-${cert.id}`}
                          style={{
                            ...entryStyle,
                          }}
                        >
                          <div
                            style={{
                              fontWeight:
                                600,

                              color:
                                '#222',

                              lineHeight:
                                1.3,

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {
                              cert.name
                            }
                          </div>

                          <div
                            style={{
                              color:
                                '#666',

                              fontSize:
                                fs(9.5),

                              lineHeight:
                                1.3,

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {
                              cert.issuer
                            }{' '}
                            ·{' '}
                            {
                              cert.issueDate
                            }
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            PROJECTS
            ==================================================== */}

        {cvData.projects
          .length > 0 && (
          <div
            style={{
              ...sectionStyle,
            }}
          >
            {sectionTitle(
              t.projects
            )}

            <div
              style={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  '8px',
              }}
            >
              {cvData.projects.map(
                (proj) => (
                  <div
                    key={`mod-proj-${proj.id}`}
                    style={{
                      ...entryStyle,
                    }}
                  >
                    <div
                      style={{
                        fontWeight:
                          700,

                        fontSize:
                          fs(
                            baseFontSize +
                              0.5
                          ),

                        color:
                          '#111',

                        lineHeight:
                          1.3,

                        wordBreak:
                          'break-word',
                      }}
                    >
                      {
                        proj.name
                      }
                    </div>

                    {proj.technologies && (
                      <div
                        style={{
                          color:
                            '#666',

                          fontSize:
                            fs(9.5),

                          marginTop:
                            '1px',

                          lineHeight:
                            1.3,

                          wordBreak:
                            'break-word',
                        }}
                      >
                        {
                          proj.technologies
                        }
                      </div>
                    )}

                    {proj.description && (
                      <div
                        style={{
                          ...richStyle,

                          marginTop:
                            '3px',
                        }}
                        className="cv-rich-content"
                        dangerouslySetInnerHTML={{
                          __html:
                            proj.description,
                        }}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            ACHIEVEMENTS
            ==================================================== */}

        {cvData.achievements
          .length > 0 && (
          <div
            style={{
              ...sectionStyle,
            }}
          >
            {sectionTitle(
              t.achievements
            )}

            <div
              style={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  '5px',
              }}
            >
              {cvData.achievements.map(
                (ach) => (
                  <div
                    key={`mod-ach-${ach.id}`}
                    style={{
                      ...entryStyle,

                      display:
                        'flex',

                      justifyContent:
                        'space-between',

                      alignItems:
                        'flex-start',

                      gap:
                        '8px',
                    }}
                  >
                    <div
                      style={{
                        minWidth:
                          0,

                        wordBreak:
                          'break-word',
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            700,
                        }}
                      >
                        {
                          ach.title
                        }
                      </span>

                      {ach.organization && (
                        <span
                          style={{
                            color:
                              '#555',
                          }}
                        >
                          {' '}
                          —{' '}
                          {
                            ach.organization
                          }
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        color:
                          '#555',

                        flexShrink:
                          0,

                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {
                        ach.date
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          GLOBAL CV RICH-TEXT / PAGINATION CSS
          ====================================================== */}

      <style>{`
        /* ======================================================
           RICH TEXT — SAFE WIDTH / WRAPPING
           ====================================================== */

        .cv-rich-content {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
        }

        .cv-rich-content p {
          margin: 0.15em 0 !important;
          max-width: 100% !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
        }

        /* ======================================================
           BULLETS — CUSTOM MARKER

           Browser ::marker can sit slightly above/below the first
           text line depending on the font. A controlled pseudo
           marker keeps the bullet vertically aligned and gives
           wrapped lines a perfect hanging indent.
           ====================================================== */

        .cv-rich-content ul,
        .cv-rich-content ol {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          margin: 5px 0 !important;
          padding: 0 !important;
          list-style: none !important;
        }

        .cv-rich-content ul li,
        .cv-rich-content ol li {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;

          margin: 2px 0 !important;
          padding-left: 19px !important;

          line-height: 1.35 !important;

          overflow-wrap: anywhere !important;
          word-break: normal !important;

          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        /* Bullet marker */
        .cv-rich-content ul li::before {
          content: '•';
          position: absolute;
          left: 0;
          top: 0.02em;
          width: 14px;
          text-align: center;
          font-size: 0.82em;
          line-height: 1.35;
          font-weight: 700;
        }

        /* Number marker */
        .cv-rich-content ol {
          counter-reset: cv-list-item;
        }

        .cv-rich-content ol li {
          counter-increment: cv-list-item;
        }

        .cv-rich-content ol li::before {
          content: counter(cv-list-item) '.';
          position: absolute;
          left: 0;
          top: 0;
          width: 17px;
          text-align: right;
          font-size: 0.9em;
          line-height: 1.35;
          font-weight: 500;
        }

        .cv-rich-content li p {
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Nested lists retain indentation without losing alignment. */
        .cv-rich-content li > ul,
        .cv-rich-content li > ol {
          margin-top: 3px !important;
          margin-bottom: 3px !important;
          margin-left: 2px !important;
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

        /* ======================================================
           LINKS
           ====================================================== */

        .cv-rich-content a {
          color: inherit !important;
          text-decoration: underline !important;
          pointer-events: auto !important;
          cursor: pointer !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .cv-rich-content table {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          border-collapse: collapse !important;
        }

        .cv-rich-content td,
        .cv-rich-content th {
          vertical-align: top !important;
          overflow-wrap: anywhere !important;
        }

        .cv-rich-content img {
          max-width: 100% !important;
          height: auto !important;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          orphans: 3;
          widows: 3;
        }
      `}</style>
    </div>
  );
}
