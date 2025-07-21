import type {Metadata} from 'next'
import dynamic from 'next/dynamic'
import {getTranslations} from 'next-intl/server'

// Import dynamique du contenu MDX
const BlogContent = dynamic(() => import('./blog.mdx'), {
  loading: () => (
    <div className="animate-pulse">
      <div className="mb-4 h-8 rounded bg-gray-200"></div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        <div className="h-4 w-5/6 rounded bg-gray-200"></div>
      </div>
    </div>
  ),
})
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
            <BlogContent />
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
