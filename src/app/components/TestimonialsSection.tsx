import React from 'react';
import { Star } from 'lucide-react';

type Lang = 'es' | 'en' | 'pt';

interface Props { lang: Lang; }

const sectionCopy: Record<Lang, { title: string; sub: string }> = {
  es: { title: 'Lo que dicen nuestros usuarios', sub: 'Profesionales de toda América Latina ya crearon su CV con BuscaCerca.' },
  en: { title: 'What our users say', sub: 'Professionals across Latin America have already created their CV with BuscaCerca.' },
  pt: { title: 'O que nossos usuários dizem', sub: 'Profissionais de toda a América Latina já criaram seu CV com BuscaCerca.' },
};

const testimonials = [
  {
    id: 'test-maria',
    name: 'María Camila Rodríguez',
    role: 'Gerente de Recursos Humanos',
    country: '🇨🇴 Colombia',
    avatar: 'MC',
    avatarColor: '#8E44AD',
    rating: 5,
    textEs: 'BuscaCerca CV Builder me ayudó a actualizar mi CV en menos de 30 minutos. La plantilla Ejecutivo tiene exactamente el nivel de profesionalismo que necesitaba para postularme a cargos directivos.',
    textEn: 'BuscaCerca CV Builder helped me update my CV in less than 30 minutes. The Executive template has exactly the level of professionalism I needed to apply for management positions.',
    textPt: 'O BuscaCerca CV Builder me ajudou a atualizar meu CV em menos de 30 minutos. O modelo Executivo tem exatamente o nível de profissionalismo que eu precisava para me candidatar a cargos gerenciais.',
  },
  {
    id: 'test-carlos',
    name: 'Carlos Andrés Fuentes',
    role: 'Desarrollador de Software Senior',
    country: '🇲🇽 México',
    avatar: 'CF',
    avatarColor: '#1B4F72',
    rating: 5,
    textEs: 'La plantilla ATS Pro es exactamente lo que buscaba. Conseguí 3 entrevistas en la primera semana de usarla. El editor es muy intuitivo y la vista previa en tiempo real es genial.',
    textEn: 'The ATS Pro template is exactly what I was looking for. I got 3 interviews in the first week of using it. The editor is very intuitive and the real-time preview is great.',
    textPt: 'O modelo ATS Pro é exatamente o que eu estava procurando. Consegui 3 entrevistas na primeira semana de uso. O editor é muito intuitivo e a visualização em tempo real é ótima.',
  },
  {
    id: 'test-ana',
    name: 'Ana Sofía Herrera',
    role: 'Diseñadora UX/UI',
    country: '🇨🇱 Chile',
    avatar: 'AH',
    avatarColor: '#E74C3C',
    rating: 5,
    textEs: 'Usé la plantilla Creativa para mi portafolio de diseño y quedó espectacular. Me encanta poder cambiar de plantilla sin perder mis datos. Totalmente gratuito y sin trampas.',
    textEn: 'I used the Creative template for my design portfolio and it looked spectacular. I love being able to switch templates without losing my data. Completely free and no tricks.',
    textPt: 'Usei o modelo Criativo para meu portfólio de design e ficou espetacular. Adoro poder trocar de modelo sem perder meus dados. Totalmente gratuito e sem truques.',
  },
];

export default function TestimonialsSection({ lang }: Props) {
  const t = sectionCopy[lang];

  return (
    <section className="py-20 bg-muted/40">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t.title}</h2>
          <p className="text-muted-foreground text-lg">{t.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(item => {
            const text = lang === 'es' ? item.textEs : lang === 'en' ? item.textEn : item.textPt;
            return (
              <div key={item.id} className="card-base p-6 flex flex-col gap-4">
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, si) => (
                    <Star key={`star-${item.id}-${si}`} size={14} className="text-accent fill-accent" />
                  ))}
                </div>
                {/* Quote */}
                <blockquote className="text-sm text-foreground leading-relaxed flex-1">
                  &ldquo;{text}&rdquo;
                </blockquote>
                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: item.avatarColor }}
                  >
                    {item.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.role}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.country}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}