import React from 'react';
import { FileText, Download, Shield, Globe, Zap, Palette } from 'lucide-react';

type Lang = 'es' | 'en' | 'pt';

const copy: Record<Lang, { title: string; sub: string; features: { icon: React.ReactNode; title: string; desc: string; badge?: string }[] }> = {
  es: {
    title: '¿Por qué elegir BuscaCerca CV Builder?',
    sub: 'Todo lo que necesitas para crear un CV profesional, sin costo y sin complicaciones.',
    features: [
      { icon: <Palette size={24} />, title: '5 Plantillas Profesionales', desc: 'Desde la clásica hasta la más creativa. Cambia de plantilla en cualquier momento sin perder tus datos.', badge: 'Nuevo' },
      { icon: <Download size={24} />, title: 'Descarga en PDF', desc: 'Descarga tu CV como PDF de alta calidad, listo para enviar a empleadores o imprimir.', badge: 'Gratis' },
      { icon: <Shield size={24} />, title: 'Compatible con ATS', desc: 'Nuestra plantilla ATS Pro está optimizada para pasar los filtros automáticos de las empresas.', badge: 'ATS' },
      { icon: <Globe size={24} />, title: 'Multiidioma', desc: 'Interfaz disponible en español, inglés y portugués. Tu contenido nunca se traduce automáticamente.' },
      { icon: <Zap size={24} />, title: 'Vista Previa en Tiempo Real', desc: 'Ve cómo queda tu CV mientras lo editas. Cambios reflejados al instante.' },
      { icon: <FileText size={24} />, title: 'Múltiples CVs', desc: 'Crea y guarda varios CVs para diferentes empleos o industrias, todos desde tu cuenta.' },
    ],
  },
  en: {
    title: 'Why choose BuscaCerca CV Builder?',
    sub: 'Everything you need to create a professional CV, free and hassle-free.',
    features: [
      { icon: <Palette size={24} />, title: '5 Professional Templates', desc: 'From classic to creative. Switch templates anytime without losing your data.', badge: 'New' },
      { icon: <Download size={24} />, title: 'PDF Download', desc: 'Download your CV as a high-quality PDF, ready to send to employers or print.', badge: 'Free' },
      { icon: <Shield size={24} />, title: 'ATS Compatible', desc: 'Our ATS Pro template is optimized to pass automated applicant tracking filters.', badge: 'ATS' },
      { icon: <Globe size={24} />, title: 'Multilingual', desc: 'Interface available in Spanish, English and Portuguese. Your content is never auto-translated.' },
      { icon: <Zap size={24} />, title: 'Real-Time Preview', desc: 'See how your CV looks as you edit it. Changes reflected instantly.' },
      { icon: <FileText size={24} />, title: 'Multiple CVs', desc: 'Create and save multiple CVs for different jobs or industries, all from your account.' },
    ],
  },
  pt: {
    title: 'Por que escolher BuscaCerca CV Builder?',
    sub: 'Tudo o que você precisa para criar um CV profissional, grátis e sem complicações.',
    features: [
      { icon: <Palette size={24} />, title: '5 Modelos Profissionais', desc: 'Do clássico ao criativo. Troque de modelo a qualquer momento sem perder seus dados.', badge: 'Novo' },
      { icon: <Download size={24} />, title: 'Download em PDF', desc: 'Baixe seu CV como PDF de alta qualidade, pronto para enviar a empregadores ou imprimir.', badge: 'Grátis' },
      { icon: <Shield size={24} />, title: 'Compatível com ATS', desc: 'Nosso modelo ATS Pro é otimizado para passar pelos filtros automáticos das empresas.', badge: 'ATS' },
      { icon: <Globe size={24} />, title: 'Multilíngue', desc: 'Interface disponível em espanhol, inglês e português. Seu conteúdo nunca é traduzido automaticamente.' },
      { icon: <Zap size={24} />, title: 'Visualização em Tempo Real', desc: 'Veja como seu CV fica enquanto você edita. Alterações refletidas instantaneamente.' },
      { icon: <FileText size={24} />, title: 'Múltiplos CVs', desc: 'Crie e salve vários CVs para diferentes empregos ou indústrias, tudo da sua conta.' },
    ],
  },
};

const badgeColors: Record<string, string> = {
  'Nuevo': 'badge-green', 'New': 'badge-green', 'Novo': 'badge-green',
  'Gratis': 'badge-orange', 'Free': 'badge-orange', 'Grátis': 'badge-orange',
  'ATS': 'badge-blue',
};

interface Props { lang: Lang; }

export default function FeaturesSection({ lang }: Props) {
  const t = copy[lang];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t.title}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.map((feature, i) => (
            <div
              key={`feature-${i}`}
              className="card-base p-6 flex flex-col gap-4 hover:shadow-card-hover transition-shadow duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  {feature.icon}
                </div>
                {feature.badge && (
                  <span className={badgeColors[feature.badge] || 'badge-blue'}>
                    {feature.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}