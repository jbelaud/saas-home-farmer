'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {Plus, Save, X} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {useState} from 'react'
import {useFieldArray, useForm} from 'react-hook-form'
import * as z from 'zod'

import {
  createPostAction,
  updatePostCompleteAction,
} from '@/app/[locale]/admin/blog/actions'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {Textarea} from '@/components/ui/textarea'
import {
  Category,
  Hashtag,
  POST_STATUS,
  PostData,
  SupportedLanguage,
} from '@/services/types/domain/post-types'

// Schéma pour une traduction
const translationSchema = z.object({
  language: z.enum(['fr', 'en', 'es']),
  title: z.string().min(1, 'Le titre est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
})

// Schéma principal du formulaire
const postFormSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
  categoryId: z.string().optional(),
  translations: z
    .array(translationSchema)
    .min(1, 'Au moins une traduction est requise'),
  hashtags: z.array(z.string()).optional(),
  newHashtags: z.array(z.string()).optional(),
})

type PostFormValues = z.infer<typeof postFormSchema>

interface PostFormProps {
  mode: 'create' | 'edit'
  post?: PostData
  categories: Category[]
  hashtags: Hashtag[]
}

const LANGUAGES: {value: SupportedLanguage; label: string}[] = [
  {value: 'fr', label: 'Français'},
  {value: 'en', label: 'English'},
  {value: 'es', label: 'Español'},
]

export function PostForm({mode, post, categories, hashtags}: PostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newHashtagInput, setNewHashtagInput] = useState('')
  const [hashtagSelectValue, setHashtagSelectValue] = useState('')

  // Préparation des valeurs par défaut
  const defaultValues: PostFormValues = {
    status: (post?.status as 'draft' | 'published' | 'archived') || 'draft',
    categoryId: post?.categoryId || undefined,
    translations: post?.postTranslations?.length
      ? post.postTranslations.map((t) => ({
          language: t.language as SupportedLanguage,
          title: t.title,
          slug: t.slug,
          description: t.description || '',
          content: t.content || '',
          metaTitle: t.metaTitle || '',
          metaDescription: t.metaDescription || '',
          metaKeywords: t.metaKeywords || '',
        }))
      : [
          {
            language: 'fr',
            title: '',
            slug: '',
            description: '',
            content: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
          },
        ],
    hashtags:
      post?.postHashtags
        ?.map((ph) => ph.hashtag?.id)
        .filter((id): id is string => Boolean(id)) || [],
    newHashtags: [],
  }

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  })

  const {
    fields: translationFields,
    append: appendTranslation,
    remove: removeTranslation,
  } = useFieldArray({
    control: form.control,
    name: 'translations',
  })

  const watchedHashtags = form.watch('hashtags') || []
  const watchedNewHashtags = form.watch('newHashtags') || []

  const addTranslation = () => {
    const usedLanguages = form.getValues('translations').map((t) => t.language)
    const availableLanguages = LANGUAGES.filter(
      (lang) => !usedLanguages.includes(lang.value)
    )

    if (availableLanguages.length > 0) {
      appendTranslation({
        language: availableLanguages[0].value,
        title: '',
        slug: '',
        description: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
      })
    }
  }

  const addNewHashtag = () => {
    // Nettoyer l'input : enlever #, espaces, et caractères non autorisés
    const cleanInput = newHashtagInput
      .trim()
      .replace(/^#/, '') // Enlever # du début si présent
      .replace(/[^a-zA-Z0-9_]/g, '') // Ne garder que lettres, chiffres et underscores
      .toLowerCase() // Convertir en minuscules pour uniformité

    if (cleanInput && cleanInput.length >= 2) {
      const currentNewHashtags = form.getValues('newHashtags') || []
      const currentHashtags = form.getValues('hashtags') || []

      // Vérifier que le hashtag n'existe pas déjà
      const existsInExisting = hashtags.some(
        (h) => h.name.toLowerCase() === cleanInput.toLowerCase()
      )
      const existsInNew = currentNewHashtags.some(
        (h) => h.toLowerCase() === cleanInput.toLowerCase()
      )

      if (!existsInExisting && !existsInNew) {
        form.setValue('newHashtags', [...currentNewHashtags, cleanInput])
        setNewHashtagInput('')
      } else {
        // Si le hashtag existe déjà, on peut l'ajouter à la sélection
        const existingHashtag = hashtags.find(
          (h) => h.name.toLowerCase() === cleanInput.toLowerCase()
        )
        if (existingHashtag && !currentHashtags.includes(existingHashtag.id)) {
          toggleHashtag(existingHashtag.id)
        }
        setNewHashtagInput('')
      }
    } else if (cleanInput.length < 2) {
      // Montrer un message d'erreur si le hashtag est trop court après nettoyage
      console.warn('Le hashtag doit contenir au moins 2 caractères valides')
    }
  }

  const removeNewHashtag = (index: number) => {
    const currentNewHashtags = form.getValues('newHashtags') || []
    form.setValue(
      'newHashtags',
      currentNewHashtags.filter((_, i) => i !== index)
    )
  }

  const toggleHashtag = (hashtagId: string) => {
    const currentHashtags = form.getValues('hashtags') || []
    if (currentHashtags.includes(hashtagId)) {
      form.setValue(
        'hashtags',
        currentHashtags.filter((id) => id !== hashtagId)
      )
    } else {
      form.setValue('hashtags', [...currentHashtags, hashtagId])
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  async function onSubmit(data: PostFormValues) {
    setIsSubmitting(true)
    try {
      let result

      if (mode === 'create') {
        result = await createPostAction(data)
      } else if (post) {
        result = await updatePostCompleteAction(post.id, data)
      }

      if (result?.success) {
        router.push('/admin/blog')
        router.refresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Configuration générale */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration générale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={POST_STATUS.DRAFT}>
                        Brouillon
                      </SelectItem>
                      <SelectItem value={POST_STATUS.PUBLISHED}>
                        Publié
                      </SelectItem>
                      <SelectItem value={POST_STATUS.ARCHIVED}>
                        Archivé
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucune catégorie</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Hashtags */}
        <Card>
          <CardHeader>
            <CardTitle>Hashtags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélecteur de hashtags */}
            <div>
              <FormLabel>Sélectionner des hashtags</FormLabel>
              <Select
                value={hashtagSelectValue}
                onValueChange={(value) => {
                  if (value && value !== 'add-new') {
                    toggleHashtag(value)
                    setHashtagSelectValue('') // Réinitialiser la sélection
                  } else if (value === 'add-new') {
                    // Focus sur l'input pour nouveau hashtag
                    document.getElementById('new-hashtag-input')?.focus()
                    setHashtagSelectValue('') // Réinitialiser la sélection
                  }
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choisir un hashtag..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="add-new"
                    className="text-primary font-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un nouveau hashtag
                  </SelectItem>
                  {hashtags
                    .filter((hashtag) => !watchedHashtags.includes(hashtag.id))
                    .map((hashtag) => (
                      <SelectItem key={hashtag.id} value={hashtag.id}>
                        #{hashtag.name}
                      </SelectItem>
                    ))}
                  {hashtags.filter(
                    (hashtag) => !watchedHashtags.includes(hashtag.id)
                  ).length === 0 && (
                    <SelectItem value="no-more" disabled>
                      Tous les hashtags sont déjà sélectionnés
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Ajouter nouveau hashtag */}
            <div>
              <FormLabel>Ajouter un nouveau hashtag</FormLabel>
              <div className="mt-2 flex gap-2">
                <Input
                  id="new-hashtag-input"
                  placeholder="Ex: react, javascript, web_dev (lettres, chiffres, _)"
                  value={newHashtagInput}
                  onChange={(e) => setNewHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addNewHashtag()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addNewHashtag}
                  disabled={!newHashtagInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Les caractères spéciaux et espaces seront automatiquement
                supprimés
              </p>
            </div>

            {/* Hashtags sélectionnés */}
            {(watchedHashtags.length > 0 || watchedNewHashtags.length > 0) && (
              <div>
                <FormLabel>Hashtags sélectionnés</FormLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {/* Hashtags existants sélectionnés */}
                  {watchedHashtags.map((hashtagId) => {
                    const hashtag = hashtags.find((h) => h.id === hashtagId)
                    return hashtag ? (
                      <Badge
                        key={hashtag.id}
                        variant="default"
                        className="gap-1"
                      >
                        #{hashtag.name}
                        <X
                          className="hover:text-destructive h-3 w-3 cursor-pointer"
                          onClick={() => toggleHashtag(hashtag.id)}
                        />
                      </Badge>
                    ) : null
                  })}

                  {/* Nouveaux hashtags */}
                  {watchedNewHashtags.map((hashtag, index) => (
                    <Badge
                      key={`new-${index}`}
                      variant="secondary"
                      className="gap-1"
                    >
                      #{hashtag}
                      <X
                        className="hover:text-destructive h-3 w-3 cursor-pointer"
                        onClick={() => removeNewHashtag(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traductions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Traductions
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTranslation}
                disabled={translationFields.length >= 3}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une langue
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {translationFields.map((field, index) => (
                  <TabsTrigger key={field.id} value={index.toString()}>
                    {LANGUAGES.find((l) => l.value === field.language)?.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {translationFields.map((field, index) => (
                <TabsContent key={field.id} value={index.toString()}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {
                          LANGUAGES.find((l) => l.value === field.language)
                            ?.label
                        }
                      </h3>
                      {translationFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTranslation(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`translations.${index}.language`}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Langue</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`translations.${index}.title`}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Titre *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Titre de l'article"
                              onChange={(e) => {
                                field.onChange(e)
                                const slug = generateSlug(e.target.value)
                                form.setValue(
                                  `translations.${index}.slug`,
                                  slug
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`translations.${index}.slug`}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Slug *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="slug-de-larticle" />
                          </FormControl>
                          <FormDescription>
                            URL de l&apos;article (généré automatiquement depuis
                            le titre)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`translations.${index}.description`}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Description courte de l'article"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`translations.${index}.content`}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Contenu</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Contenu complet de l'article (Markdown supporté)"
                              rows={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* SEO Meta */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">SEO Meta</h4>

                      <FormField
                        control={form.control}
                        name={`translations.${index}.metaTitle`}
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Titre pour les moteurs de recherche"
                              />
                            </FormControl>
                            <FormDescription>
                              Recommandé: 50-60 caractères
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`translations.${index}.metaDescription`}
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Description pour les moteurs de recherche"
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Recommandé: 150-160 caractères
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`translations.${index}.metaKeywords`}
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Meta Keywords</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="mots-clés, séparés, par, des, virgules"
                              />
                            </FormControl>
                            <FormDescription>
                              Mots-clés séparés par des virgules
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? 'Enregistrement...'
              : mode === 'create'
                ? 'Créer le post'
                : 'Mettre à jour'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
