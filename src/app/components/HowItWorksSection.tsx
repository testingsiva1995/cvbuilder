import React from 'react';
import Link from 'next/link';
import { UserPlus, Edit3, Download } from 'lucide-react';

type Lang = 'es' | 'en' | 'pt';

interface Props { lang: Lang; }

const copy: Record<Lang, {
  title: string; sub: string; cta: string;
  steps: { icon: React.ReactNode; step: string; title: string; desc: string }[];
}> = {
  es: {
    title: 'Crea tu CV en 3 simples pasos',
    sub: 'Sin complicaciones. Sin costos ocultos. Listo en minutos.',
    cta: 'Empezar ahora',
    steps: [
      { icon: <UserPlus size={28} />, step: '01', title: 'Regístrate gratis', desc: 'Crea tu cuenta en segundos. Solo necesitas tu correo electrónico y una contraseña.' },
      { icon: <Edit3 size={28} />, step: '02', title: 'Completa tu CV', desc: 'Rellena tus datos: experiencia, educación, habilidades y más. Elige tu plantilla favorita.' },
      { icon: <Download size={28} />, step: '03', title: 'Descarga tu PDF', desc: 'Descarga tu CV profesional en PDF al instante. Listo para enviar a empleadores.' },
    ],
  },
  en: {
    title: 'Create your CV in 3 simple steps',
    sub: 'No complications. No hidden costs. Ready in minutes.',
    cta: 'Get started now',
    steps: [
      { icon: <UserPlus size={28} />, step: '01', title: 'Register for free', desc: 'Create your account in seconds. You only need your email and a password.' },
      { icon: <Edit3 size={28} />, step: '02', title: 'Complete your CV', desc: 'Fill in your details: experience, education, skills and more. Choose your favorite template.' },
      { icon: <Download size={28} />, step: '03', title: 'Download your PDF', desc: 'Download your professional CV as PDF instantly. Ready to send to employers.' },
    ],
  },
  pt: {
    title: 'Crie seu CV em 3 passos simples',
    sub: 'Sem complicações. Sem custos ocultos. Pronto em minutos.',
    cta: 'Começar agora',
    steps: [
      { icon: <UserPlus size={28} />, step: '01', title: 'Cadastre-se grátis', desc: 'Crie sua conta em segundos. Você só precisa do seu e-mail e uma senha.' },
      { icon: <Edit3 size={28} />, step: '02', title: 'Complete seu CV', desc: 'Preencha seus dados: experiência, educação, habilidades e mais. Escolha seu modelo favorito.' },
      { icon: <Download size={28} />, step: '03', title: 'Baixe seu PDF', desc: 'Baixe seu CV profissional em PDF instantaneamente. Pronto para enviar a empregadores.' },
    ],
  },
};

export default function HowItWorksSection({ lang }: Props) {
  const t = copy[lang];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t.title}</h2>
          <p className="text-muted-foreground text-lg">{t.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {t.steps.map((step, i) => (
            <div key={`step-${i}`} className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/sign-up-login-screen"
            className="inline-flex items-center gap-2 px-8 py-3.5 btn-secondary rounded-xl text-base font-bold"
          >
            {t.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}