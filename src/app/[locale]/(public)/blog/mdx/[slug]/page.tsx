import rehypeShiki from '@shikijs/rehype'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'
import {MDXRemote} from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

import {mdxComponents} from '@/components/mdx-components'
import {PagesConst} from '@/env'
import {
  blogPostExists,
  getBlogPost,
  getMDXSlugs,
} from '@/lib/helper/blog.server'
import {isPageEnabled} from '@/lib/utils'

// Génération des paramètres statiques pour le SSG
export function generateStaticParams() {
  const slugs = getMDXSlugs()

  return slugs.map((slug) => ({
    slug,
  }))
}

// Génération des métadonnées
export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; slug: string}>
}): Promise<Metadata> {
  const {locale, slug} = await params
  const t = await getTranslations({locale, namespace: 'BlogPage'})

  if (!blogPostExists(slug)) {
    return {
      title: 'Article non trouvé',
      description: "Cet article n'existe pas.",
    }
  }

  const post = getBlogPost(slug)

  return {
    title: `${post.title} | ${t('meta.title')}`,
    description: `Article de blog : ${post.title}`,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{locale: string; slug: string}>
}) {
  if (!isPageEnabled(PagesConst.BLOG)) {
    return notFound()
  }
  const {locale, slug} = await params
  const t = await getTranslations({locale, namespace: 'BlogPage'})

  // Vérifier si le slug existe
  if (!blogPostExists(slug)) {
    notFound()
  }

  // Obtenir l'article
  const post = getBlogPost(slug)

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* En-tête de la page */}
          <header className="mb-12 text-center">
            <h1 className="text-foreground mb-4 text-4xl font-bold">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              {t('description')}
            </p>
          </header>

          {/* Contenu MDX */}
          <article className="prose prose-lg prose-gray dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-primary max-w-none">
            <MDXRemote
              source={post.content || ''}
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

          {/* Pied de page de l'article */}
          <footer className="border-border mt-12 border-t pt-8">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Publié le{' '}
                {new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex space-x-4">
                <button className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Partager
                </button>
                <button className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Commenter
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
