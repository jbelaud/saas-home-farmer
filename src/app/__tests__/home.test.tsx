import {screen} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {render} from '@/__tests__/customRender'
import Home from '@/app/[locale]/page'

// Mock du composant ButtonConnexionDashboard pour les tests car c'est un RSC
vi.mock('@/components/features/auth/button-connexion-dashboard', () => ({
  default: () => <button>Connexion Dashboard Mock</button>,
}))

// Mock du composant LangToggle
vi.mock('@/components/lang-toggle', () => ({
  LangToggle: () => <div>Lang Toggle Mock</div>,
}))

// Mock de next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
  setRequestLocale: vi.fn(),
}))

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}))

// Mock des hooks de navigation next-intl
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(() => ({replace: vi.fn()})),
  usePathname: vi.fn(() => '/'),
}))

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({locale: 'fr'})),
}))

describe.skip("Page d'accueil", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it("affiche le texte d'introduction", async () => {
    render(<Home params={Promise.resolve({locale: 'fr'})} />)

    expect(
      screen.getByText(/La plateforme SaaS moderne pour booster votre business/)
    ).toBeInTheDocument()
    expect(screen.getByText(/By Mike Codeur/)).toBeInTheDocument()
  })

  it('affiche les liens de navigation du CTA', () => {
    render(<Home params={Promise.resolve({locale: 'fr'})} />)
    expect(screen.getByText(/Essayez gratuitement/)).toBeInTheDocument()
  })

  it('affiche les liens du footer', () => {
    render(<Home params={Promise.resolve({locale: 'fr'})} />)
    expect(screen.getByText(/Mentions légales/)).toBeInTheDocument()
    expect(screen.getByText(/Politique de confidentialité/)).toBeInTheDocument()
    expect(screen.getByText(/Recrutement/)).toBeInTheDocument()
  })

  it('affiche le bouton de connexion dashboard mocké', () => {
    render(<Home params={Promise.resolve({locale: 'fr'})} />)
    expect(screen.getByText(/Connexion Dashboard Mock/)).toBeInTheDocument()
  })
})
