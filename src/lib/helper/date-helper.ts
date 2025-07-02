import {formatDistanceToNow} from 'date-fns'
import {fr} from 'date-fns/locale'

export const formatDateString = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

export const formatDate = (date: Date | null) => {
  if (!date) return 'Non définie'
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export const formatDistanceToNowFr = (date: Date) => {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: fr,
  })
}
