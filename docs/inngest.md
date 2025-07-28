# Documentation Inngest

## Vue d'ensemble

Inngest est utilisé dans ce projet pour gérer les tâches en arrière-plan de manière fiable et scalable. Il permet d'exécuter des fonctions asynchrones, de programmer des tâches, et de gérer les reprises automatiques en cas d'erreur.

## Architecture

### Structure des fichiers

```
src/
├── lib/inngest/
│   ├── inngest.ts       # Configuration du client Inngest
│   └── functions.ts     # Définition des fonctions Inngest
└── app/api/inngest/
    └── route.ts         # Point d'entrée API pour Inngest
```

### Configuration de base

```typescript
// src/lib/inngest/inngest.ts
import {Inngest} from 'inngest'
import {APP_NAME} from '../constants'

export const inngest = new Inngest({id: APP_NAME})
```

## Créer une nouvelle fonction

### 1. Définir la fonction

Ajoutez votre fonction dans `src/lib/inngest/functions.ts` :

```typescript
export const sendWelcomeEmail = inngest.createFunction(
  {id: 'send-welcome-email'},
  {event: 'user/created'},
  async ({event, step}) => {
    // Étape 1 : Récupérer les données utilisateur
    const user = await step.run('get-user', async () => {
      return event.data.user
    })

    // Étape 2 : Envoyer l'email
    await step.run('send-email', async () => {
      console.log(`Sending welcome email to ${user.email}`)
      // Logique d'envoi d'email ici
    })

    // Étape 3 : Attendre avant envoi de suivi (optionnel)
    await step.sleep('wait-before-follow-up', '24h')

    // Étape 4 : Envoyer email de suivi
    await step.run('send-follow-up', async () => {
      console.log(`Sending follow-up email to ${user.email}`)
    })

    return {success: true, userId: user.id}
  }
)
```

### 2. Enregistrer la fonction

Ajoutez la fonction dans `src/app/api/inngest/route.ts` :

```typescript
import {serve} from 'inngest/next'
import {helloWorld, sendWelcomeEmail} from '@/lib/inngest/functions'
import {inngest} from '@/lib/inngest/inngest'

export const {GET, POST, PUT} = serve({
  client: inngest,
  functions: [
    helloWorld,
    sendWelcomeEmail, // Nouvelle fonction
  ],
})
```

## Déclencher une fonction

```typescript
import {inngest} from '@/lib/inngest/inngest'

// Déclencher l'événement
await inngest.send({
  name: 'user/created',
  data: {
    user: {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe'
    }
  }
})
```

## Commandes de développement

### Démarrer les serveurs

1. **Serveur Next.js** :
```bash
pnpm dev
```

2. **Serveur de développement Inngest** :
```bash
pnpm dlx inngest-cli@latest dev
```

Le serveur Inngest démarre sur `http://localhost:8288` et se connecte automatiquement à votre API Next.js.

### Interface de développement

L'interface Inngest permet de :
- Visualiser toutes les fonctions enregistrées
- Voir l'historique des exécutions
- Tester les fonctions manuellement
- Debugger les erreurs

## Concepts clés

### Steps (Étapes)

Les steps permettent de diviser une fonction en étapes distinctes :

```typescript
// Étape simple
await step.run('step-name', async () => {
  return await someAsyncOperation()
})

// Attente
await step.sleep('wait', '5m')

// Envoyer un événement
await step.sendEvent('trigger-next', {
  name: 'next/event',
  data: {id: 123}
})
```

### Gestion des erreurs

Inngest gère automatiquement les reprises en cas d'erreur :

```typescript
export const robustFunction = inngest.createFunction(
  {
    id: 'robust-function',
    retries: 3, // Nombre de reprises
  },
  {event: 'process/data'},
  async ({event, step}) => {
    // Cette étape sera reprise en cas d'erreur
    await step.run('process-data', async () => {
      if (Math.random() > 0.5) {
        throw new Error('Random failure')
      }
      return 'success'
    })
  }
)
```

## Exemples pratiques

### Traitement d'abonnement Stripe

```typescript
export const processSubscription = inngest.createFunction(
  {id: 'process-subscription'},
  {event: 'stripe/subscription.created'},
  async ({event, step}) => {
    const subscription = event.data.subscription

    // Créer l'organisation
    const organization = await step.run('create-organization', async () => {
      return await createOrganizationService({
        name: subscription.customer_name,
        stripeSubscriptionId: subscription.id
      })
    })

    // Envoyer email de confirmation
    await step.run('send-confirmation-email', async () => {
      return await sendEmail({
        to: subscription.customer_email,
        template: 'subscription-created',
        data: {organization}
      })
    })

    // Programmer un rappel
    await step.sendEvent('schedule-reminder', {
      name: 'trial/reminder',
      data: {organizationId: organization.id},
      ts: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans 7 jours
    })

    return {organizationId: organization.id}
  }
)
```

### Tâche périodique

```typescript
export const dailyCleanup = inngest.createFunction(
  {id: 'daily-cleanup'},
  {cron: '0 2 * * *'}, // Tous les jours à 2h
  async ({step}) => {
    // Nettoyer les sessions expirées
    await step.run('clean-sessions', async () => {
      return await cleanExpiredSessions()
    })

    // Nettoyer les invitations expirées
    await step.run('clean-invitations', async () => {
      return await cleanExpiredInvitations()
    })

    return {cleaned: true}
  }
)
```

## Bonnes pratiques

### Nommage des événements
Utilisez la convention `category/action` :
- ✅ `user/created`
- ✅ `payment/succeeded`
- ✅ `organization/updated`
- ❌ `userCreated`
- ❌ `payment-success`

### Types TypeScript
Définissez des types pour vos événements :

```typescript
type UserCreatedEvent = {
  name: 'user/created'
  data: {
    user: {
      id: string
      email: string
      name: string
    }
  }
}

type PaymentSucceededEvent = {
  name: 'payment/succeeded'
  data: {
    paymentId: string
    amount: number
    currency: string
  }
}
```

### Utilisation des steps
- Divisez la logique complexe en étapes distinctes
- Nommez clairement chaque step
- Utilisez `step.run()` pour les opérations qui peuvent échouer
- Utilisez `step.sleep()` pour les délais

### Gestion des données sensibles
```typescript
export const processPayment = inngest.createFunction(
  {id: 'process-payment'},
  {event: 'payment/process'},
  async ({event, step}) => {
    // ✅ Récupérer les données sensibles dans un step
    const paymentMethod = await step.run('get-payment-method', async () => {
      return await getSecurePaymentMethod(event.data.paymentMethodId)
    })

    // ❌ Ne pas passer les données sensibles dans l'événement
    // event.data.creditCardNumber = '4242424242424242'
  }
)
```

## Debugging

### Logs
Utilisez `console.log` dans vos fonctions pour le debugging :

```typescript
export const debugFunction = inngest.createFunction(
  {id: 'debug-function'},
  {event: 'debug/test'},
  async ({event, step}) => {
    console.log('Function started with data:', event.data)
    
    const result = await step.run('process', async () => {
      console.log('Processing step started')
      // Logique ici
      console.log('Processing step completed')
      return 'done'
    })
    
    console.log('Function completed:', result)
    return result
  }
)
```

### Interface de développement
- Utilisez `http://localhost:8288` pour voir l'état des fonctions
- Consultez les logs d'exécution
- Testez manuellement les fonctions avec des données fictives

## Déploiement

En production, assurez-vous que :
1. Les variables d'environnement Inngest sont configurées
2. L'endpoint `/api/inngest` est accessible
3. Les fonctions sont correctement enregistrées
4. La gestion des erreurs est appropriée pour votre environnement