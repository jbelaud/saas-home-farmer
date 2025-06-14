'use client'

import {CalendarDays, Users} from 'lucide-react'
import {useEffect} from 'react'

import {
  OrganizationDTO,
  OrganizationMemberDTO,
} from '@/app/dal/organization-dal'
import {useOrganization} from '@/components/context/organizarion-provider'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

interface TeamPageContentProps {
  organization: OrganizationDTO
  members: OrganizationMemberDTO[]
}

export function TeamPageContent({organization, members}: TeamPageContentProps) {
  const {
    currentOrganization,
    setCurrentOrganizationWithoutRedirect,
    organizations,
  } = useOrganization()

  // Mettre à jour l'organisation courante si elle ne correspond pas au slug
  useEffect(() => {
    if (currentOrganization?.id !== organization.id) {
      // Chercher l'organisation dans la liste des organisations de l'utilisateur
      const userOrg = organizations.find(
        (org) => org.organization?.id === organization.id
      )

      if (userOrg?.organization?.id) {
        // Mettre à jour le contexte sans rediriger (on est déjà sur la bonne page)
        setCurrentOrganizationWithoutRedirect(userOrg.organization.id)
      }
    }
  }, [
    organization.id,
    currentOrganization?.id,
    setCurrentOrganizationWithoutRedirect,
    organizations,
  ])

  const formatDate = (date: Date | null) => {
    if (!date) return 'Non définie'
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* En-tête de l'organisation */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={organization.logo || ''}
                alt={organization.name}
              />
              <AvatarFallback className="text-lg">
                {organization.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <CardTitle className="text-2xl">{organization.name}</CardTitle>
              <Badge variant="outline">@{organization.slug}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {organization.description && (
            <div>
              <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                Description
              </h3>
              <p className="text-sm">{organization.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <CalendarDays className="h-4 w-4" />
              <span>Créée le {formatDate(organization.createdAt)}</span>
            </div>

            {members.length > 0 && (
              <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4" />
                <span>
                  {members.length} membre{members.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des membres si accessible */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Membres de l&apos;équipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 rounded-lg border p-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.image || ''} alt={member.name} />
                    <AvatarFallback>
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.name}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {member.email}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations détaillées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">
                Identifiant unique
              </h4>
              <p className="bg-muted rounded p-2 font-mono text-sm">
                {organization.id}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">
                Slug de l&apos;organisation
              </h4>
              <p className="bg-muted rounded p-2 font-mono text-sm">
                {organization.slug}
              </p>
            </div>

            {organization.updatedAt && (
              <div className="space-y-2">
                <h4 className="text-muted-foreground text-sm font-medium">
                  Dernière mise à jour
                </h4>
                <p className="text-sm">{formatDate(organization.updatedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
