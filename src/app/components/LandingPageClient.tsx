'use client';
import React, { useState } from 'react';

import PublicNav from '@/components/PublicNav';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TemplatesPreviewSection from './TemplatesPreviewSection';
import HowItWorksSection from './HowItWorksSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import LandingFooter from './LandingFooter';

type Lang = 'es' | 'en' | 'pt';

export default function LandingPageClient() {
  const [lang, setLang] = useState<Lang>('es');

  return (
    <div className="min-h-screen bg-background">
      <PublicNav lang={lang} onLangChange={setLang} activePath="/" />
      <main>
        <HeroSection lang={lang} />
        <FeaturesSection lang={lang} />
        <TemplatesPreviewSection lang={lang} />
        <HowItWorksSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <FAQSection lang={lang} />
      </main>
      <LandingFooter lang={lang} />
    </div>
  );
}