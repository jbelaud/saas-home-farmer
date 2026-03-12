'use client'

import {Logo} from '@/components/brand/logo'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Separator} from '@/components/ui/separator'

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto space-y-12 py-10">
      <div className="space-y-4">
        <h1 className="font-heading text-primary text-4xl font-bold">
          Design System
        </h1>
        <p className="text-muted-foreground text-lg">
          Reference guide for My Home Farmer&apos;s &quot;Organic Tech&quot;
          identity.
        </p>
      </div>

      <Separator />

      {/* Brand Identity */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold">1. Brand Identity</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="font-semibold">Logo Variants</h3>
            <div className="flex flex-col gap-4 rounded-xl border bg-stone-50 p-6">
              <Logo size="lg" />
              <Logo variant="icon" size="lg" />
              <Logo variant="monochrome" size="lg" />
            </div>
          </div>
          <div className="col-span-2 space-y-4">
            <h3 className="font-semibold">Typography</h3>
            <div className="space-y-4 rounded-xl border p-6">
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Heading (Outfit)
                </p>
                <h1 className="font-heading text-4xl font-bold">
                  The quick brown fox jumps over the lazy dog
                </h1>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-sm">
                  Body (Inter)
                </p>
                <p className="text-base">
                  L&apos;agriculture urbaine est une nécessité pour
                  l&apos;avenir de nos villes. Elle permet de reconnecter les
                  citadins à la terre et de produire une alimentation saine et
                  locale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold">2. Colors</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ColorCard
            name="Primary (Emerald)"
            color="bg-primary"
            text="text-primary-foreground"
          />
          <ColorCard
            name="Secondary (Stone)"
            color="bg-secondary"
            text="text-secondary-foreground"
          />
          <ColorCard
            name="Accent (Amber)"
            color="bg-accent"
            text="text-accent-foreground"
          />
          <ColorCard
            name="Destructive (Red)"
            color="bg-destructive"
            text="text-destructive-foreground"
          />
          <ColorCard
            name="Background"
            color="bg-background"
            text="text-foreground"
            border
          />
          <ColorCard
            name="Card"
            color="bg-card"
            text="text-card-foreground"
            border
          />
          <ColorCard
            name="Muted"
            color="bg-muted"
            text="text-muted-foreground"
          />
          <ColorCard name="Input" color="bg-input" text="text-foreground" />
        </div>
      </section>

      {/* UI Components */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-bold">
          3. UI Components (Mobile First)
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons & Interactions</CardTitle>
              <CardDescription>
                Minimum 48px height for touch targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button size="lg">Primary Action</Button>
                <Button variant="secondary" size="lg">
                  Secondary
                </Button>
                <Button variant="outline" size="lg">
                  Outline
                </Button>
                <Button variant="ghost" size="lg">
                  Ghost
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive" size="lg">
                  Destructive
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  size="lg"
                >
                  Accent CTA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card className="bg-stone-50/50">
            <CardHeader>
              <CardTitle>Content Cards</CardTitle>
              <CardDescription>
                Softer shadows and rounded-xl borders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card space-y-2 rounded-xl border p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Tomates Cœur de Bœuf</span>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    Bio
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Récolte estimée : 12kg
                </p>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div className="bg-primary h-full w-[70%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function ColorCard({
  name,
  color,
  text,
  border,
}: {
  name: string
  color: string
  text: string
  border?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-4 ${color} ${border ? 'border' : ''} flex h-24 flex-col justify-end`}
    >
      <span className={`font-medium ${text}`}>{name}</span>
    </div>
  )
}
