import rehypeShiki from '@shikijs/rehype'
import fs from 'fs'
import type {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import {MDXRemote} from 'next-mdx-remote/rsc'
import path from 'path'
import remarkGfm from 'remark-gfm'

import {mdxComponents} from '@/components/mdx-components'
export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'BlogPage'})

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}
export default async function BlogPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'BlogPage'})

  // Lire le fichier MDX
  const blogPath = path.join(
    process.cwd(),
    'src/app/[locale]/(public)/blog/01.mdx'
  )
  const blogContent = fs.readFileSync(blogPath, 'utf8')

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
              source={blogContent}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [
                      rehypeShiki,
                      {
                        themes: {
                          light: 'github-light',
                          dark: 'github-light',
                        },
                        // Ajouts optionnels :
                        langs: [
                          'javascript',
                          'typescript',
                          'jsx',
                          'tsx',
                          'css',
                          'json',
                          'bash',
                        ],
                        transformers: [
                          // Numéros de lignes
                          {
                            name: 'line-numbers',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            line(node: any, line: any) {
                              node.properties['data-line'] = line
                            },
                          },
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
