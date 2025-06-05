import {Metadata} from 'next'

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Badge} from '@/components/ui/badge'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata: Metadata = {
  title: 'Utilisateurs',
  description: 'Gestion des utilisateurs',
}

// Données exemple - à remplacer par un appel à la DAL
const users = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    role: 'Admin',
    status: 'Actif',
    avatar: '/avatars/jean.jpg',
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie@example.com',
    role: 'Utilisateur',
    status: 'Inactif',
    avatar: '/avatars/marie.jpg',
  },
  {
    id: '3',
    name: 'Pierre Durand',
    email: 'pierre@example.com',
    role: 'Utilisateur',
    status: 'Actif',
    avatar: '/avatars/pierre.jpg',
  },
]

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === 'Actif' ? 'default' : 'secondary'}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
