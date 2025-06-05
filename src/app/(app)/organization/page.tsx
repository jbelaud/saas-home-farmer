import Image from 'next/image'
import Link from 'next/link'

import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {getOrganizationsByUserIdService} from '@/services/facades/organization-service-facade'

export default async function OrganizationsPage() {
  const organizations = await getOrganizationsByUserIdService()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes Organisations</h1>
        {/* <Button asChild>
          <Link href="/organization/new">Créer une organisation</Link>
        </Button> */}
      </div>

      {organizations.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Vous n&apos;avez pas encore d&apos;organisation.
          </p>
          <Button asChild>
            <Link href="/organization/new">
              Créer votre première organisation
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((organization) => (
            <Card key={organization.id}>
              <CardHeader>
                <CardTitle>{organization.name}</CardTitle>
                <CardDescription>{organization.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {organization.image && (
                  <div className="relative mb-4 h-32 w-full">
                    <Image
                      src={organization.image}
                      alt={organization.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <p className="text-muted-foreground text-sm">
                  Slug: {organization.slug}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/organization/${organization.id}/edit`}>
                    Voir les détails
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/organization/${organization.id}/edit`}>
                    Modifier
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
