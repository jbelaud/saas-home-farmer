import fs from 'fs'
import path from 'path'

// Chemin vers le dossier des fichiers MDX
const MDX_DIR = path.join(
  process.cwd(),
  'src/app/[locale]/(public)/blog/mdx/_files'
)

// Interface pour un article de blog
export interface BlogPost {
  slug: string
  title: string
  description: string
  readTime: string
  content?: string
}

// Obtenir tous les slugs des fichiers MDX
export function getMDXSlugs(): string[] {
  if (!fs.existsSync(MDX_DIR)) {
    return []
  }

  const files = fs.readdirSync(MDX_DIR)
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace('.mdx', ''))
}

// Obtenir le contenu d'un fichier MDX par slug
export function getMDXContent(slug: string): string {
  const filePath = path.join(MDX_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Article non trouvé: ${slug}`)
  }

  return fs.readFileSync(filePath, 'utf8')
}

// Obtenir les métadonnées d'un article à partir de son contenu
export function extractPostMetadata(
  content: string,
  slug: string
): Omit<BlogPost, 'content'> {
  // Extraire le titre (première ligne H1)
  const titleMatch = content.match(/^#\s+(.+)/m)
  const title = titleMatch ? titleMatch[1] : slug

  // Extraire le premier paragraphe comme description
  const paragraphMatch = content.match(/^(?!#)(.+)/m)
  const description = paragraphMatch
    ? `${paragraphMatch[1].slice(0, 150)}...`
    : 'Aucune description disponible.'

  // Calculer le temps de lecture
  const readTime = `${Math.ceil(content.length / 1000)} min`

  return {
    slug,
    title,
    description,
    readTime,
  }
}

// Obtenir tous les articles avec leurs métadonnées
export function getAllBlogPosts(): BlogPost[] {
  const slugs = getMDXSlugs()

  return slugs
    .map((slug) => {
      const content = getMDXContent(slug)
      return {
        ...extractPostMetadata(content, slug),
        content,
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

// Obtenir un article spécifique par slug
export function getBlogPost(slug: string): BlogPost {
  const content = getMDXContent(slug)
  return {
    ...extractPostMetadata(content, slug),
    content,
  }
}

// Vérifier si un slug existe
export function blogPostExists(slug: string): boolean {
  return getMDXSlugs().includes(slug)
}
