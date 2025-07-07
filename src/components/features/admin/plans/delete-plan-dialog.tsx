'use client'

import {Trash2} from 'lucide-react'
import {useState} from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'

interface Props {
  planId: string
  planName: string
  onDelete: (id: string, permanent: boolean) => Promise<void>
}

export function DeletePlanDialog({planId, planName, onDelete}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [permanent, setPermanent] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(planId, permanent)
    } catch (error) {
      console.error('Error deleting plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {permanent ? 'Supprimer définitivement' : 'Archiver'} le plan
          </AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir{' '}
            {permanent ? 'supprimer définitivement' : 'archiver'} le plan{' '}
            <strong>{planName}</strong> ?
            {permanent ? (
              <span className="text-destructive">
                <br />
                Cette action est irréversible et supprimera définitivement
                toutes les données associées.
              </span>
            ) : (
              <span>
                <br />
                Le plan sera archivé et ne sera plus visible pour les nouveaux
                abonnements.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="permanent"
              checked={permanent}
              onCheckedChange={(checked) => setPermanent(checked === true)}
            />
            <label
              htmlFor="permanent"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Suppression définitive
            </label>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Cochez cette case pour supprimer définitivement le plan au lieu de
            l&apos;archiver.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className={
              permanent
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
          >
            {isLoading
              ? permanent
                ? 'Suppression...'
                : 'Archivage...'
              : permanent
                ? 'Supprimer définitivement'
                : 'Archiver'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
