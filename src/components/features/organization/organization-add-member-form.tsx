'use client'
import {useState, useTransition} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {UserDTO} from '@/services/types/domain/user-types'

import {
  inviteUserToOrganizationAction,
  searchUsersForOrganizationAction,
} from './action'

export function OrganizationAddMemberForm({
  organizationId,
  existingMemberIds,
}: {
  organizationId: string
  existingMemberIds: string[]
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserDTO[]>([])
  const [selectedUser, setSelectedUser] = useState<UserDTO>()
  const [isPending, startTransition] = useTransition()

  function handleSearch(q: string) {
    setQuery(q)
    if (q.length >= 2) {
      startTransition(async () => {
        const users = await searchUsersForOrganizationAction(organizationId, q)
        setResults(
          users.filter((u: UserDTO) => !existingMemberIds.includes(u.id))
        )
      })
    } else {
      setResults([])
    }
  }

  return (
    <div className="flex min-w-[300px] flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isPending}
        />
        <Button
          disabled={!selectedUser || isPending}
          onClick={() => {
            if (!selectedUser) return
            startTransition(async () => {
              const res = await inviteUserToOrganizationAction(
                organizationId,
                selectedUser.id
              )
              if (res.success) {
                toast.success(res.message || 'Membre ajouté')
                setQuery('')
                setResults([])
                setSelectedUser(undefined)
              } else {
                toast.error(res.message || "Erreur lors de l'ajout")
              }
            })
          }}
        >
          {isPending ? 'Ajout...' : 'Ajouter'}
        </Button>
      </div>
      {results.length > 0 && (
        <ul className="bg-popover max-h-48 overflow-auto rounded border p-2 shadow">
          {results.map((user) => (
            <li
              key={user.id}
              className={`hover:bg-accent cursor-pointer rounded p-2 ${selectedUser?.id === user.id ? 'bg-accent' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <span className="font-medium">{user.name}</span>{' '}
              <span className="text-muted-foreground text-xs">
                {user.email}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
