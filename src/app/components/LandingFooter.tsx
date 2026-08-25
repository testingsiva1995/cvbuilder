import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

type Lang = 'es' | 'en' | 'pt';
interface Props { lang: Lang; }

const copy: Record<Lang, {
  tagline: string;
  product: string; productLinks: { label: string; href: string }[];
  company: string; companyLinks: { label: string; href: string }[];
  legal: string; legalLinks: { label: string; href: string }[];
  copyright: string;
}> = {
  es: {
    tagline: 'Crea tu CV profesional gratis. Para profesionales de América Latina.',
    product: 'Producto',
    productLinks: [
      { label: 'Crear CV', href: '/sign-up-login-screen' },
      { label: 'Plantillas', href: '/templates' },
      { label: 'Cómo funciona', href: '/#how-it-works' },
    ],
    company: 'Empresa',
    companyLinks: [
      { label: 'Acerca de', href: '/about' },
      { label: 'BuscaCerca.uy', href: 'https://buscacerca.uy' },
      { label: 'Contacto', href: '/contact' },
    ],
    legal: 'Legal',
    legalLinks: [
      { label: 'Términos de uso', href: '/terms' },
      { label: 'Privacidad', href: '/privacy' },
    ],
    copyright: '© 2025 BuscaCerca LATAM. Todos los derechos reservados.',
  },
  en: {
    tagline: 'Create your professional CV for free. For Latin American professionals.',
    product: 'Product',
    productLinks: [
      { label: 'Create CV', href: '/sign-up-login-screen' },
      { label: 'Templates', href: '/templates' },
      { label: 'How it works', href: '/#how-it-works' },
    ],
    company: 'Company',
    companyLinks: [
      { label: 'About', href: '/about' },
      { label: 'BuscaCerca.uy', href: 'https://buscacerca.uy' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: 'Legal',
    legalLinks: [
      { label: 'Terms of use', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
    copyright: '© 2025 BuscaCerca LATAM. All rights reserved.',
  },
  pt: {
    tagline: 'Crie seu CV profissional grátis. Para profissionais da América Latina.',
    product: 'Produto',
    productLinks: [
      { label: 'Criar CV', href: '/sign-up-login-screen' },
      { label: 'Modelos', href: '/templates' },
      { label: 'Como funciona', href: '/#how-it-works' },
    ],
    company: 'Empresa',
    companyLinks: [
      { label: 'Sobre', href: '/about' },
      { label: 'BuscaCerca.uy', href: 'https://buscacerca.uy' },
      { label: 'Contato', href: '/contact' },
    ],
    legal: 'Legal',
    legalLinks: [
      { label: 'Termos de uso', href: '/terms' },
      { label: 'Privacidade', href: '/privacy' },
    ],
    copyright: '© 2025 BuscaCerca LATAM. Todos os direitos reservados.',
  },
};

export default function LandingFooter({ lang }: Props) {
  const t = copy[lang];

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <AppLogo size={36} />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm text-white tracking-tight">BuscaCerca</span>
                <span className="text-xs text-white/60">CV Builder</span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{t.tagline}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">🇪🇸 ES</span>
              <span className="text-xs bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">🇺🇸 EN</span>
              <span className="text-xs bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">🇧🇷 PT</span>
            </div>
          </div>

          {/* Links */}
          {[
            { title: t.product, links: t.productLinks },
            { title: t.company, links: t.companyLinks },
            { title: t.legal, links: t.legalLinks },
          ].map((col, ci) => (
            <div key={`footer-col-${ci}`}>
              <h4 className="font-semibold text-sm text-white/90 mb-4 uppercase tracking-wide">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={`footer-link-${link.href}`}>
                    <Link href={link.href} className="text-sm text-white/65 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">{t.copyright}</p>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span>Hecho con ❤️ en Uruguay para LATAM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}