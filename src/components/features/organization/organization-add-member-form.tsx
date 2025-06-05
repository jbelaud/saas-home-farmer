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
    <div className="relative min-w-[300px]">
      <Input
        placeholder="Rechercher un utilisateur..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        disabled={isPending}
      />
      {results.length > 0 && (
        <ul className="bg-popover absolute right-0 left-0 z-50 mt-1 max-h-48 overflow-auto rounded border p-2 shadow">
          {results.map((user) => (
            <li
              key={user.id}
              className="hover:bg-accent cursor-pointer rounded p-2"
              onClick={() => {
                startTransition(async () => {
                  const res = await inviteUserToOrganizationAction(
                    organizationId,
                    user.id
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
