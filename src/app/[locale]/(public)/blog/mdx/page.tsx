import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'

import {PagesConst} from '@/env'
import {getAllBlogPosts} from '@/lib/helper/blog.server'
import {isPageEnabled} from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  if (!isPageEnabled(PagesConst.BLOG)) {
    return notFound()
  }
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

  const posts = getAllBlogPosts()

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

          {/* Liste des articles */}
          <div className="grid gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-border bg-card hover:bg-muted/50 rounded-lg border p-6 transition-colors"
              >
                <h2 className="mb-3 text-2xl font-semibold">
                  <Link
                    href={`/blog/mdx/${post.slug}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground mb-4 text-base leading-relaxed">
                  {post.description}
                </p>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <time>
                    {new Date().toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.readTime} de lecture</span>
                  <span>•</span>
                  <Link
                    href={`/blog/mdx/${post.slug}`}
                    className="hover:text-foreground font-medium transition-colors"
                  >
                    Lire la suite →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Message si aucun article */}
          {posts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                Aucun article disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
