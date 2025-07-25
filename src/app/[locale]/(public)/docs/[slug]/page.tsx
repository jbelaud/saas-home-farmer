import rehypeShiki from '@shikijs/rehype'
import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {MDXRemote} from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

import {mdxComponents} from '@/components/mdx-components'
import {PagesConst} from '@/env'
import {getRule, getRuleSlugs, ruleExists} from '@/lib/helper/docs.server'
import {isPageEnabled} from '@/lib/utils'

// Génération des paramètres statiques pour le SSG
export function generateStaticParams() {
  const slugs = getRuleSlugs()

  return slugs.map((slug) => ({
    slug,
  }))
}

// Génération des métadonnées
export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const {slug} = await params

  if (!ruleExists(slug)) {
    return {
      title: 'Règle non trouvée',
      description: "Cette règle n'existe pas.",
    }
  }

  const rule = getRule(slug)

  return {
    title: `${rule.title} | Documentation`,
    description: rule.description,
  }
}

export default async function RulePage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  if (!isPageEnabled(PagesConst.DOCS)) {
    return notFound()
  }
  const {slug} = await params

  // Vérifier si le slug existe
  if (!ruleExists(slug)) {
    notFound()
  }

  // Obtenir la règle
  const rule = getRule(slug)

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Navigation */}
          <nav className="mb-8">
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Retour à la documentation
            </Link>
          </nav>

          {/* En-tête de la règle */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                {rule.category}
              </span>
              {rule.globs && (
                <span className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
                  {rule.globs}
                </span>
              )}
              {rule.alwaysApply && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Toujours appliqué
                </span>
              )}
              {!rule.alwaysApply && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  Appliqué sur {rule.globs}
                </span>
              )}
            </div>

            <div className="text-muted-foreground mt-4 text-sm">
              {rule.readTime} de lecture
            </div>
          </header>

          {/* Contenu MDX */}
          <article className="prose prose-lg prose-gray dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-primary max-w-none">
            <MDXRemote
              source={rule.content || ''}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [
                      rehypeShiki,
                      {
                        themes: {
                          light: 'github-dark',
                          dark: 'github-dark',
                        },
                        langs: [
                          'javascript',
                          'typescript',
                          'jsx',
                          'tsx',
                          'css',
                          'json',
                          'bash',
                          'html',
                          'markdown',
                        ],
                      },
                    ],
                  ],
                },
              }}
            />
          </article>

          {/* Navigation vers autres règles */}
          <footer className="border-border mt-12 border-t pt-8">
            <div className="text-center">
              <Link
                href="/docs"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Voir toutes les règles
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
