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
}: {
  organizationId: string
}) {
  const members = await getOrganizationMembersDal(organizationId)

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Membres</h3>
        <OrganizationAddMemberForm
          organizationId={organizationId}
          existingMemberIds={members.map((m) => m.id)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Date d&apos;ajout</TableHead>
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
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>
                {member.joinedAt
                  ? new Date(member.joinedAt).toLocaleDateString()
                  : ''}
              </TableCell>
              <TableCell>
                <RemoveMemberButton
                  organizationId={organizationId}
                  userId={member.id}
                  userName={member.name}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
