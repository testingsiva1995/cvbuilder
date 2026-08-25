'use client';
import React from 'react';
import { SectionKey } from './CVBuilderClient';
import { CVData } from './cvData';
import PersonalInfoForm from './forms/PersonalInfoForm';
import SummaryForm from './forms/SummaryForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import ProjectsForm from './forms/ProjectsForm';
import SkillsForm from './forms/SkillsForm';
import LanguagesForm from './forms/LanguagesForm';
import CertificationsForm from './forms/CertificationsForm';
import AchievementsForm from './forms/AchievementsForm';

type Lang = 'es' | 'en' | 'pt';

interface Props {
  lang: Lang;
  section: SectionKey;
  cvData: CVData;
  onUpdate: (updates: Partial<CVData>) => void;
  onSectionChange: (s: SectionKey) => void;
}

export default function CVSectionForm({ lang, section, cvData, onUpdate, onSectionChange }: Props) {
  const commonProps = { lang, cvData, onUpdate, onSectionChange };

  const forms: Record<SectionKey, React.ReactNode> = {
    personal: <PersonalInfoForm {...commonProps} />,
    summary: <SummaryForm {...commonProps} />,
    experience: <ExperienceForm {...commonProps} />,
    education: <EducationForm {...commonProps} />,
    projects: <ProjectsForm {...commonProps} />,
    skills: <SkillsForm {...commonProps} />,
    languages: <LanguagesForm {...commonProps} />,
    certifications: <CertificationsForm {...commonProps} />,
    achievements: <AchievementsForm {...commonProps} />,
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      {forms[section]}
    </div>
  );
}