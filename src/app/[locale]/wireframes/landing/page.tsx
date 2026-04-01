'use client'

import {
  ArrowRight,
  Check,
  Leaf,
  Play,
  Smartphone,
  Sprout,
  Star,
  Users,
} from 'lucide-react'
import Link from 'next/link'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function LandingPageWireframe() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* HEADER */}
      <header className="fixed top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-stone-900">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl">MyHomeFarmer</span>
          </div>

          <nav className="hidden gap-8 md:flex">
            <Link
              href="#features"
              className="hover:text-primary text-sm font-medium text-stone-600"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#serenity"
              className="hover:text-primary text-sm font-medium text-stone-600"
            >
              Sérénité
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary text-sm font-medium text-stone-600"
            >
              Tarifs
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="#serenity"
              className="hover:text-primary text-sm font-medium text-stone-600"
            >
              Sérénité
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Essayer Gratuitement
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-stone-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-8">
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
                >
                  <Sprout className="mr-2 h-4 w-4" />
                  L&apos;outil n°1 des Entrepreneurs Jardiniers
                </Badge>
                <h1 className="font-heading text-4xl leading-tight font-extrabold text-stone-900 sm:text-5xl lg:text-6xl">
                  Digitalisez votre activité de{' '}
                  <span className="text-primary">Home Farmer</span>
                </h1>
                <p className="text-lg text-stone-600">
                  Gagnez 20% de temps administratif, sécurisez vos revenus à
                  l&apos;année et offrez un suivi premium à vos clients. Tout
                  ça, depuis votre smartphone.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" className="h-14 gap-2 px-8 text-lg">
                    Commencer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 gap-2 px-8 text-lg"
                  >
                    <Play className="h-5 w-5" />
                    Voir la démo
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-white bg-stone-200"
                      />
                    ))}
                  </div>
                  <p>Déjà adopté par +50 entrepreneurs du réseau</p>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-2xl">
                  {/* Placeholder for App Screenshot */}
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400">
                    <Smartphone className="h-24 w-24 opacity-20" />
                    <span className="absolute mt-32 font-medium">
                      Capture d&apos;écran App Mobile
                    </span>
                  </div>
                  {/* Floating Elements */}
                  <div className="absolute bottom-12 -left-6 animate-bounce rounded-xl border bg-white p-4 shadow-lg duration-1000">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-500">
                          Tournée terminée
                        </p>
                        <p className="text-sm font-bold text-stone-900">
                          Mme. Dupont ✅
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAIN POINTS / SOLUTION */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="font-heading mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
                Le métier change, vos outils aussi
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-stone-600">
                Fini les carnets trempés et les factures le dimanche soir.
                Passez au niveau professionnel.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={<Smartphone className="text-primary h-8 w-8" />}
                title="100% Mobile & Terrain"
                description="Conçu pour être utilisé avec des gants. Photos, checklists, planning : tout est accessible d'une seule main."
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-amber-500" />}
                title="Suivi Client Premium"
                description="Rassurez vos clients avec des comptes rendus d'intervention clairs et des photos. Ils savent exactement ce qui a été fait."
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-amber-500" />}
                title="Suivi Client Premium"
                description="Rassurez vos clients avec des comptes rendus d'intervention clairs et des photos. Ils savent exactement ce qui a été fait."
              />
            </div>
          </div>
        </section>

        {/* SERENITY / TRUST FOCUS */}
        <section id="serenity" className="bg-stone-900 py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div className="order-2 md:order-1">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-700">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">Espace Client Dédié</p>
                        <p className="text-sm text-stone-400">
                          Vue Propriétaire
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg bg-white/5 p-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm text-stone-300">
                          Dernière visite
                        </span>
                        <span className="text-sm font-medium">
                          Aujourd&apos;hui, 14:30
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-stone-500 uppercase">
                          Actions réalisées
                        </p>
                        <div className="flex gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          >
                            Taille
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          >
                            Semis
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-300 italic">
                          &quot;Le potager se porte bien ! J&apos;ai paillé les
                          tomates pour garder l&apos;humidité.&quot;
                        </p>
                      </div>
                      <div className="relative h-32 w-full overflow-hidden rounded bg-stone-800">
                        {/* Mock photo */}
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-600">
                          Photo du potager
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 space-y-6 md:order-2">
                <Badge className="bg-amber-500 text-stone-900 hover:bg-amber-400">
                  Sérénité & Confiance
                </Badge>
                <h2 className="font-heading text-3xl font-bold md:text-4xl">
                  Un lien de confiance unique
                  <br />
                  avec vos clients.
                </h2>
                <p className="text-lg text-stone-300">
                  Vos clients n&apos;achètent pas seulement des légumes, ils
                  achètent la tranquillité d&apos;esprit.
                  <br />
                  Offrez-leur une transparence totale sans effort
                  supplémentaire.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Rapports d&apos;intervention automatiques</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Espace client dédié (Web & Mobile)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400" />
                    <span>Valorisation de votre expertise technique</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="font-heading mb-4 text-3xl font-bold text-stone-900">
                Des tarifs adaptés à votre croissance
              </h2>
              <p className="text-stone-600">
                Offre Early Bird : Profitez de ces tarifs pendant 12 mois
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
              {/* Plan Découverte */}
              <Card className="flex flex-col border-stone-200">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">
                    Découverte
                  </CardTitle>
                  <CardDescription>Pour tester sans risque</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-stone-900">
                      0 €
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm text-stone-600">
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> 1 Client inclus
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Application
                      Mobile
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Dashboard
                      Client
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Créer un compte
                  </Button>
                </CardFooter>
              </Card>

              {/* Plan Essentiel */}
              <Card className="border-primary relative flex flex-col bg-stone-50 shadow-lg">
                <div className="bg-primary absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white">
                  Populaire
                </div>
                <CardHeader>
                  <CardTitle className="font-heading text-primary text-2xl">
                    Essentiel
                  </CardTitle>
                  <CardDescription>
                    Pour démarrer l&apos;activité
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-stone-900">
                      9 €
                    </span>
                    <span className="text-stone-500">/mois</span>
                  </div>
                  <p className="mb-6 text-xs text-stone-500 line-through">
                    90€/an (2 mois offerts)
                  </p>

                  <ul className="space-y-3 text-sm text-stone-600">
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Jusqu&apos;à 20
                      Clients
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Gestion de
                      tournée
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Photos &
                      Checklists
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Support Email
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Choisir ce plan</Button>
                </CardFooter>
              </Card>

              {/* Plan Entreprise */}
              <Card className="flex flex-col border-stone-200">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">
                    Entreprise
                  </CardTitle>
                  <CardDescription>Pour les pros établis</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-stone-900">
                      29 €
                    </span>
                    <span className="text-stone-500">/mois</span>
                  </div>
                  <p className="mb-6 text-xs text-stone-500 line-through">
                    290€/an (2 mois offerts)
                  </p>

                  <ul className="space-y-3 text-sm text-stone-600">
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Clients
                      Illimités
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> API Fiscale
                      (FR)
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" /> Support
                      Prioritaire
                    </li>
                    <li className="flex gap-2">
                      <Check className="text-primary h-5 w-5" />{' '}
                      Multi-utilisateurs
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Contacter l&apos;équipe
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-stone-50 py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="font-heading mb-10 text-center text-3xl font-bold">
              Questions Fréquentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Mes clients ont-ils accès à l&apos;application ?
                </AccordionTrigger>
                <AccordionContent>
                  Oui, chaque client dispose d&apos;un espace personnel gratuit
                  (Web & Mobile) pour retrouver vos comptes rendus, photos et
                  conseils. C&apos;est un vrai plus pour votre image de marque.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Je suis en Belgique, l&apos;offre est-elle adaptée ?
                </AccordionTrigger>
                <AccordionContent>
                  Tout à fait ! Nous avons une offre spécifique pour la Belgique
                  et la Suisse (sans le module fiscal français), à un tarif
                  adapté (39€/mois la première année).
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-primary py-20 text-center text-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading mb-6 text-3xl font-bold md:text-5xl">
              Prêt à faire germer votre business ?
            </h2>
            <p className="mb-10 text-xl opacity-90">
              Rejoignez les entrepreneurs qui changent le modèle du paysagisme.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-primary h-14 px-8 text-lg font-bold"
            >
              Créer mon compte gratuit
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-stone-50 py-12 text-stone-600">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 MyHomeFarmer. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-none bg-white shadow-md transition-shadow hover:shadow-xl">
      <CardHeader>
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50">
          {icon}
        </div>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-stone-600">{description}</p>
      </CardContent>
    </Card>
  )
}
