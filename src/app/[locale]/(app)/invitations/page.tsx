import {getUserInvitationsServiceDal} from '@/app/dal/organization-dal'

import InvitationsContent from './invitations-content'

export default async function Page() {
  const invitations = await getUserInvitationsServiceDal()
  return <InvitationsContent invitationsUser={invitations} />
}
