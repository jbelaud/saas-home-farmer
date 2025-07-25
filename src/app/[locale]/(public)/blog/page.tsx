import type {Metadata} from 'next'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getTranslations} from 'next-intl/server'

import {getPublishedPostsWithTranslationsAndPaginationDal} from '@/app/dal/post-dal'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {PagesConst} from '@/env'
import {isPageEnabled} from '@/lib/utils'
import {SupportedLanguage} from '@/services/types/domain/post-types'

// Génération des métadonnées
export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  const t = await getTranslations({locale, namespace: 'BlogListPage'})

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

type SearchParamsType = Promise<{
  page?: string
}>

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: Promise<{locale: string}>
  searchParams: SearchParamsType
}) {
  if (!isPageEnabled(PagesConst.BLOG)) {
    return notFound()
  }

  const {locale} = await params
  const searchStore = await searchParams
  const t = await getTranslations({locale, namespace: 'BlogListPage'})

  const page = searchStore.page ? Number.parseInt(searchStore.page) : 1
  const limit = 10
  const offset = (page - 1) * limit

  // Récupérer les posts publiés avec leurs traductions
  const postsResult = await getPublishedPostsWithTranslationsAndPaginationDal(
    {limit, offset},
    locale as SupportedLanguage
  )

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div>
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
        {postsResult.data.map((post) => {
          // Trouver la traduction pour la langue actuelle
          const translation = post.postTranslations?.find(
            (t) => t.language === locale
          )
          if (!translation) return null

          return (
            <article
              key={post.id}
              className="border-border bg-card hover:bg-muted/50 rounded-lg border p-6 transition-colors"
            >
              <div className="mb-3 flex items-center gap-3">
                <Badge variant="outline">
                  {post.category?.name || 'Sans catégorie'}
                </Badge>
                {post.postHashtags && post.postHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.postHashtags.slice(0, 2).map((postHashtag) => (
                      <Badge
                        key={postHashtag.hashtag?.id || postHashtag.hashtagId}
                        variant="secondary"
                        className="text-xs"
                      >
                        #{postHashtag.hashtag?.name || 'hashtag'}
                      </Badge>
                    ))}
                    {post.postHashtags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{post.postHashtags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <h2 className="mb-3 text-2xl font-semibold">
                <Link
                  href={`/blog/${translation.slug}`}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {translation.title}
                </Link>
              </h2>

              <p className="text-muted-foreground mb-4 text-base leading-relaxed">
                {translation.description}
              </p>

              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <time>{formatDate(post.createdAt)}</time>
                <span>•</span>
                <span>{post.nbView || 0} vues</span>
                <span>•</span>
                <span>{post.nbLike || 0} likes</span>
                <span>•</span>
                <Link
                  href={`/blog/${translation.slug}`}
                  className="hover:text-foreground font-medium transition-colors"
                >
                  Lire la suite →
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      {/* Message si aucun article */}
      {postsResult.data.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">{t('noArticles')}</p>
        </div>
      )}

      {/* Pagination */}
      {postsResult.pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/blog?page=${page - 1}`}>
              <Button variant="outline">{t('pagination.previous')}</Button>
            </Link>
          )}

          <div className="flex items-center gap-2">
            {Array.from({length: postsResult.pagination.totalPages}, (_, i) => {
              const pageNum = i + 1
              const isCurrentPage = pageNum === page

              // Afficher seulement quelques pages autour de la page actuelle
              if (
                pageNum === 1 ||
                pageNum === postsResult.pagination.totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <Link key={pageNum} href={`/blog?page=${pageNum}`}>
                    <Button
                      variant={isCurrentPage ? 'default' : 'outline'}
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  </Link>
                )
              }

              // Afficher des points de suspension
              if (pageNum === page - 2 || pageNum === page + 2) {
                return (
                  <span key={pageNum} className="px-2">
                    ...
                  </span>
                )
              }

              return null
            })}
          </div>

          {page < postsResult.pagination.totalPages && (
            <Link href={`/blog?page=${page + 1}`}>
              <Button variant="outline">{t('pagination.next')}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
