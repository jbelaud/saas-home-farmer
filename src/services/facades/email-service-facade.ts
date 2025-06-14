import emailServiceInterceptor from './interceptors/email-service-logger-interceptor'

// ===== SERVICES EMAIL =====
export const sendEmailService = emailServiceInterceptor.sendEmailService
export const sendOrganizationInvitationService =
  emailServiceInterceptor.sendOrganizationInvitation
