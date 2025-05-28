import {screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

import {render} from '@/__tests__/customRender'
import Home from '@/app/page'

describe("Page d'accueil", () => {
  it("affiche le texte d'introduction", () => {
    render(<Home />)

    // Vérifie le texte d'introduction
    expect(screen.getByText(/Get started by editing/)).toBeInTheDocument()
    expect(
      screen.getByText(/Save and see your changes instantly/)
    ).toBeInTheDocument()
  })

  it('affiche les liens de navigation', () => {
    render(<Home />)

    // Vérifie les liens de navigation
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('affiche les liens du footer', () => {
    render(<Home />)

    // Vérifie les liens du footer
    expect(screen.getByText('Learn')).toBeInTheDocument()
    expect(screen.getByText('Examples')).toBeInTheDocument()
    expect(screen.getByText(/Go to nextjs.org/)).toBeInTheDocument()
  })
})
