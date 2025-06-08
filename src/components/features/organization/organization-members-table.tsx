import {getOrganizationMembersDal} from '@/app/dal/organization-dal'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {OrganizationAddMemberForm} from './organization-add-member-form'
import {RemoveMemberButton} from './remove-member-button'

export default async function OrganizationMembersTable({
  organizationId,
  canManageMembers = false,
}: {
  organizationId: string
  canManageMembers?: boolean
}) {
  const members = await getOrganizationMembersDal(organizationId)

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Membres</h3>
        {canManageMembers && (
          <OrganizationAddMemberForm
            organizationId={organizationId}
            existingMemberIds={members.map((m) => m.id)}
          />
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Rôle</TableHead>
            <TableHead className="hidden lg:table-cell">
              Date d&apos;ajout
            </TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Avatar>
                  {member.image ? (
                    <AvatarImage src={member.image} alt={member.name} />
                  ) : (
                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-muted-foreground text-sm sm:hidden">
                    {member.email}
                  </span>
                  <span className="text-muted-foreground text-xs md:hidden">
                    {member.role}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {member.email}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {member.role}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {member.joinedAt
                  ? new Date(member.joinedAt).toLocaleDateString()
                  : ''}
              </TableCell>
              <TableCell>
                {canManageMembers ? (
                  <RemoveMemberButton
                    organizationId={organizationId}
                    userId={member.id}
                    userName={member.name}
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
