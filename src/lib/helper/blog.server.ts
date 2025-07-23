import 'server-only'

import fs from 'fs'
import path from 'path'

import {BlogPost} from './blog'

// Chemin vers le dossier des fichiers MDX/MDC
const CONTENT_DIR = path.join(
  process.cwd(),
  'src/app/[locale]/(public)/blog/mdx/_files'
)

// Extensions supportées
const SUPPORTED_EXTENSIONS = ['.mdx', '.mdc']

// Obtenir tous les slugs des fichiers MDX/MDC
export function getContentSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return []
  }

  const files = fs.readdirSync(CONTENT_DIR)
  return files
    .filter((file) => SUPPORTED_EXTENSIONS.some((ext) => file.endsWith(ext)))
    .map((file) => {
      // Retirer l'extension (.mdx ou .mdc)
      return file.replace(/\.(mdx|mdc)$/, '')
    })
}

// Alias pour compatibilité
export const getMDXSlugs = getContentSlugs

// Obtenir le contenu d'un fichier par slug (MDX ou MDC)
export function getContentBySlug(slug: string): {
  content: string
  extension: string
} {
  // Essayer chaque extension supportée
  for (const ext of SUPPORTED_EXTENSIONS) {
    const filePath = path.join(CONTENT_DIR, `${slug}${ext}`)
    if (fs.existsSync(filePath)) {
      return {
        content: fs.readFileSync(filePath, 'utf8'),
        extension: ext,
      }
    }
  }

  throw new Error(`Article non trouvé: ${slug}`)
}

// Alias pour compatibilité
export function getMDXContent(slug: string): string {
  return getContentBySlug(slug).content
}

// Obtenir les métadonnées d'un article à partir de son contenu
export function extractPostMetadata(
  content: string,
  slug: string,
  extension?: string
): Omit<BlogPost, 'content'> {
  // Extraire le titre (première ligne H1 ou titre dans frontmatter)
  let title = slug

  // Pour les fichiers .mdc, chercher dans le frontmatter YAML
  if (extension === '.mdc') {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
    if (frontmatterMatch) {
      const yamlContent = frontmatterMatch[1]
      const titleMatch = yamlContent.match(/title:\s*(.+)/m)
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/['"]/g, '')
      }
    }
  }

  // Fallback sur H1 pour tous les types de fichiers
  if (title === slug) {
    const titleMatch = content.match(/^#\s+(.+)/m)
    title = titleMatch ? titleMatch[1] : slug
  }

  // Extraire le premier paragraphe comme description
  const paragraphMatch = content.match(/^(?!#|---)(.+)/m)
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
  const slugs = getContentSlugs()

  return slugs
    .map((slug) => {
      const {content, extension} = getContentBySlug(slug)
      return {
        ...extractPostMetadata(content, slug, extension),
        content,
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

// Obtenir un article spécifique par slug
export function getBlogPost(slug: string): BlogPost {
  const {content, extension} = getContentBySlug(slug)
  return {
    ...extractPostMetadata(content, slug, extension),
    content,
  }
}

// Vérifier si un slug existe
export function blogPostExists(slug: string): boolean {
  return getContentSlugs().includes(slug)
}
