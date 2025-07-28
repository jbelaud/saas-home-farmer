import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

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
import {PagesConst} from '@/env'
import {sortOrganizationsByRole} from '@/lib/helper/organization-helper'
import {isPageEnabled} from '@/lib/utils'
import {getOrganizationsByUserIdService} from '@/services/facades/organization-service-facade'
import {UserOrganizationRoleConst} from '@/services/types/domain/auth-types'

export default async function OrganizationsPage() {
  if (!isPageEnabled(PagesConst.ORGANIZATION)) {
    return notFound()
  }

  const organizations = await getOrganizationsByUserIdService()

  // Trier les organisations par rôle : OWNER en premier, puis ADMIN, puis les autres
  const sortedOrganizations = sortOrganizationsByRole(organizations)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes Organisations</h1>
        {/* <Button asChild>
          <Link href="/account/organizations/new">Créer une organisation</Link>
        </Button> */}
      </div>

      {sortedOrganizations.length === 0 ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Vous n&apos;avez pas encore d&apos;organisation.
          </p>
          <Button asChild>
            <Link href="/account/organizations/new">
              Créer votre première organisation
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedOrganizations.map((organization) => (
            <Card
              key={organization.id}
              className={
                organization.role === UserOrganizationRoleConst.OWNER
                  ? 'ring-primary/20 border-primary/30 ring-2'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex-1">{organization.name}</CardTitle>
                  {organization.role === UserOrganizationRoleConst.OWNER && (
                    <Badge variant="default" className="ml-2">
                      Propriétaire
                    </Badge>
                  )}
                </div>
                <CardDescription>{organization.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {organization.logo && (
                  <div className="relative mb-4 h-32 w-full">
                    <Image
                      src={organization.logo}
                      alt={organization.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    Slug: {organization.slug}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Rôle:{' '}
                    {organization.role === UserOrganizationRoleConst.OWNER
                      ? 'Propriétaire'
                      : organization.role === UserOrganizationRoleConst.ADMIN
                        ? 'Administrateur'
                        : 'Membre'}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/team/${organization.slug}`}>
                    Voir les détails
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/account/organizations/${organization.id}/edit`}>
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
