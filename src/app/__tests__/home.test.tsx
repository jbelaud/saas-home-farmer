import {screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

import {render} from '@/__tests__/customRender'
import Home from '@/app/page'

describe("Page d'accueil", () => {
  it("affiche le texte d'introduction", () => {
    render(<Home />)

    expect(
      screen.getByText(/La plateforme SaaS moderne pour booster votre business/)
    ).toBeInTheDocument()
    expect(screen.getByText(/By Mike Codeur/)).toBeInTheDocument()
  })

  it('affiche les liens de navigation du CTA', () => {
    render(<Home />)
    expect(screen.getByText(/Essayez gratuitement/)).toBeInTheDocument()
  })

  it('affiche les liens du footer', () => {
    render(<Home />)
    expect(screen.getByText(/Mentions légales/)).toBeInTheDocument()
    expect(screen.getByText(/Politique de confidentialité/)).toBeInTheDocument()
    expect(screen.getByText(/Recrutement/)).toBeInTheDocument()
  })
})
