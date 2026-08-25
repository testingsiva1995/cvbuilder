'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Lang = 'es' | 'en' | 'pt';

interface Props { lang: Lang; }

const copy: Record<Lang, { title: string; sub: string; faqs: { q: string; a: string }[] }> = {
  es: {
    title: 'Preguntas frecuentes',
    sub: 'Resolvemos tus dudas más comunes sobre BuscaCerca CV Builder.',
    faqs: [
      { q: '¿Es realmente gratis?', a: 'Sí, BuscaCerca CV Builder es 100% gratuito. Puedes crear, editar y descargar tu CV en PDF sin pagar nada. No hay funciones de pago ocultas en la versión actual.' },
      { q: '¿Qué es una plantilla ATS y por qué es importante?', a: 'ATS (Applicant Tracking System) es el software que usan las empresas para filtrar CVs automáticamente. Nuestra plantilla ATS Pro está diseñada con formato limpio y simple para que los sistemas la puedan leer correctamente, aumentando tus posibilidades de pasar a la entrevista.' },
      { q: '¿Puedo cambiar de plantilla después de crear mi CV?', a: 'Absolutamente. Puedes cambiar de plantilla en cualquier momento desde el editor. Tu información, experiencias, educación y todos tus datos se mantienen intactos. Solo cambia el diseño visual.' },
      { q: '¿En qué países de América Latina está disponible?', a: 'BuscaCerca CV Builder está disponible para todos los países de América Latina: Argentina, Bolivia, Brasil, Chile, Colombia, Costa Rica, Ecuador, El Salvador, Guatemala, Honduras, México, Nicaragua, Panamá, Paraguay, Perú, República Dominicana, Uruguay, Venezuela y más.' },
      { q: '¿Puedo crear CVs en inglés o portugués?', a: 'Sí. La interfaz del editor está disponible en español, inglés y portugués. Puedes escribir el contenido de tu CV en cualquier idioma que necesites, independientemente del idioma de la interfaz. Cambiar el idioma de la interfaz nunca traduce automáticamente tu contenido.' },
    ],
  },
  en: {
    title: 'Frequently asked questions',
    sub: 'We answer your most common questions about BuscaCerca CV Builder.',
    faqs: [
      { q: 'Is it really free?', a: 'Yes, BuscaCerca CV Builder is 100% free. You can create, edit and download your CV as PDF without paying anything. There are no hidden payment features in the current version.' },
      { q: 'What is an ATS template and why is it important?', a: 'ATS (Applicant Tracking System) is software companies use to automatically filter CVs. Our ATS Pro template is designed with clean, simple formatting so systems can read it correctly, increasing your chances of making it to the interview.' },
      { q: 'Can I change templates after creating my CV?', a: 'Absolutely. You can change templates at any time from the editor. Your information, experiences, education and all your data remain intact. Only the visual design changes.' },
      { q: 'Which Latin American countries is it available in?', a: 'BuscaCerca CV Builder is available for all Latin American countries: Argentina, Bolivia, Brazil, Chile, Colombia, Costa Rica, Ecuador, El Salvador, Guatemala, Honduras, Mexico, Nicaragua, Panama, Paraguay, Peru, Dominican Republic, Uruguay, Venezuela and more.' },
      { q: 'Can I create CVs in Spanish or Portuguese?', a: 'Yes. The editor interface is available in Spanish, English and Portuguese. You can write your CV content in any language you need, regardless of the interface language. Changing the interface language never auto-translates your content.' },
    ],
  },
  pt: {
    title: 'Perguntas frequentes',
    sub: 'Respondemos suas dúvidas mais comuns sobre o BuscaCerca CV Builder.',
    faqs: [
      { q: 'É realmente grátis?', a: 'Sim, o BuscaCerca CV Builder é 100% gratuito. Você pode criar, editar e baixar seu CV em PDF sem pagar nada. Não há recursos de pagamento ocultos na versão atual.' },
      { q: 'O que é um modelo ATS e por que é importante?', a: 'ATS (Applicant Tracking System) é o software que as empresas usam para filtrar CVs automaticamente. Nosso modelo ATS Pro foi projetado com formatação limpa e simples para que os sistemas possam lê-lo corretamente, aumentando suas chances de passar para a entrevista.' },
      { q: 'Posso mudar de modelo depois de criar meu CV?', a: 'Com certeza. Você pode mudar de modelo a qualquer momento no editor. Suas informações, experiências, educação e todos os seus dados permanecem intactos. Apenas o design visual muda.' },
      { q: 'Em quais países da América Latina está disponível?', a: 'O BuscaCerca CV Builder está disponível para todos os países da América Latina: Argentina, Bolívia, Brasil, Chile, Colômbia, Costa Rica, Equador, El Salvador, Guatemala, Honduras, México, Nicarágua, Panamá, Paraguai, Peru, República Dominicana, Uruguai, Venezuela e mais.' },
      { q: 'Posso criar CVs em espanhol ou inglês?', a: 'Sim. A interface do editor está disponível em espanhol, inglês e português. Você pode escrever o conteúdo do seu CV em qualquer idioma que precisar, independentemente do idioma da interface. Mudar o idioma da interface nunca traduz automaticamente seu conteúdo.' },
    ],
  },
};

export default function FAQSection({ lang }: Props) {
  const t = copy[lang];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t.title}</h2>
          <p className="text-muted-foreground text-lg">{t.sub}</p>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {t.faqs.map((faq, i) => (
            <div key={`faq-${i}`} className="card-base overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                aria-expanded={openIdx === i}
              >
                <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground shrink-0 transition-transform duration-200 ${openIdx === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`faq-answer ${openIdx === i ? 'open' : ''}`}>
                <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}