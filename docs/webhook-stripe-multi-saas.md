# Gestion des Webhooks Stripe pour Multi-SaaS

## Problématique

Quand vous utilisez **un seul compte Stripe** pour plusieurs SaaS, tous les webhooks configurés dans le dashboard Stripe reçoivent **TOUS les événements** du compte, peu importe leur origine.

### Exemple du problème :

```
Configuration Stripe Dashboard :
- Webhook 1: https://saas1.com/api/auth/stripe/webhook
- Webhook 2: https://saas2.com/api/auth/stripe/webhook

Comportement :
User paye depuis SaaS2 → Événement Stripe → Envoyé vers:
                                        ├── saas1.com/webhook ❌ (pas souhaité)
                                        └── saas2.com/webhook ✅ (souhaité)
```

## Solutions

### 1. 🏆 **Comptes Stripe séparés** (Recommandé)

Créez un compte Stripe distinct pour chaque SaaS.

#### Avantages :

- ✅ Isolation totale des données
- ✅ Facturation séparée par SaaS
- ✅ Aucun filtrage de code nécessaire
- ✅ Gestion simplifiée
- ✅ Sécurité renforcée

#### Configuration :

```
Compte Stripe A → SaaS 1 → Webhook: saas1.com/api/auth/stripe/webhook
Compte Stripe B → SaaS 2 → Webhook: saas2.com/api/auth/stripe/webhook
```

#### Variables d'environnement :

```env
# SaaS 1
STRIPE_SECRET_KEY_SAAS1=sk_test_xxx
STRIPE_WEBHOOK_SECRET_SAAS1=whsec_xxx

# SaaS 2
STRIPE_SECRET_KEY_SAAS2=sk_test_yyy
STRIPE_WEBHOOK_SECRET_SAAS2=whsec_yyy
```

### 2. 🔧 **Un compte + Filtrage dans le code**

Si vous devez absolument utiliser un seul compte Stripe.

#### Implémentation avec Better Auth :

```typescript
// Dans saas1.com
export const auth = betterAuth({
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      onEvent: async (event) => {
        // Vérifier si l'événement appartient à ce SaaS
        if (!belongsToThisSaas(event)) {
          console.log('Event ignored - not for this SaaS')
          return // Ignorer l'événement
        }

        // Traiter seulement les événements de ce SaaS
        await handleEvent(event)
      },
      getCheckoutSessionParams: async ({user, session, plan}, request) => {
        return {
          params: {
            metadata: {
              saas_id: 'saas1', // Identifier unique du SaaS
              domain: request.headers.get('origin'),
            },
          },
        }
      },
    }),
  ],
})

function belongsToThisSaas(event: Stripe.Event): boolean {
  // Méthode 1: Vérifier les metadata
  const metadata = event.data.object.metadata
  if (metadata?.saas_id === 'saas1') return true

  // Méthode 2: Vérifier les price IDs
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const priceId = session.line_items?.data[0]?.price?.id
    if (priceId?.startsWith('price_saas1_')) return true
  }

  return false
}
```

#### Stratégies de filtrage :

##### A. **Par metadata** (Recommandé)

```typescript
// Ajout systématique dans les sessions
metadata: {
  saas_id: 'saas1',
  app_domain: 'saas1.com'
}
```

##### B. **Par Price ID**

```typescript
// Préfixe les prix par SaaS
const saas1Plans = [
  {name: 'pro', priceId: 'price_saas1_pro_monthly'},
  {name: 'lifetime', priceId: 'price_saas1_lifetime'},
]

const saas2Plans = [
  {name: 'pro', priceId: 'price_saas2_pro_monthly'},
  {name: 'lifetime', priceId: 'price_saas2_lifetime'},
]
```

##### C. **Par Customer ID**

```typescript
// Préfixe les customers
const customerParams = {
  metadata: {
    saas_origin: 'saas1',
  },
}
```

### 3. 🏢 **Stripe Connect** (Solution avancée)

Utilisez Stripe Connect pour créer des sous-comptes.

```
Compte principal → Connect Account SaaS1
                → Connect Account SaaS2
```

## Exemple de configuration Better Auth

### Avec comptes séparés :

```typescript
// saas1.com - Configuration
const stripeClient1 = new Stripe(process.env.STRIPE_SECRET_KEY_SAAS1!, {
  apiVersion: '2025-05-28.basil',
})

export const auth = betterAuth({
  plugins: [
    stripe({
      stripeClient: stripeClient1,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET_SAAS1!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: saas1Plans,
      },
    }),
  ],
})
```

```typescript
// saas2.com - Configuration
const stripeClient2 = new Stripe(process.env.STRIPE_SECRET_KEY_SAAS2!, {
  apiVersion: '2025-05-28.basil',
})

export const auth = betterAuth({
  plugins: [
    stripe({
      stripeClient: stripeClient2,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET_SAAS2!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: saas2Plans,
      },
    }),
  ],
})
```

## Configuration Dashboard Stripe

### Option 1: Comptes séparés

1. Créez un compte Stripe pour chaque SaaS
2. Configurez un webhook par compte :
   - Compte A: `https://saas1.com/api/auth/stripe/webhook`
   - Compte B: `https://saas2.com/api/auth/stripe/webhook`

### Option 2: Un seul compte

1. Créez un webhook par SaaS dans le même compte :
   - Webhook 1: `https://saas1.com/api/auth/stripe/webhook`
   - Webhook 2: `https://saas2.com/api/auth/stripe/webhook`
2. Implémentez le filtrage dans chaque application

## Événements Stripe à surveiller

Pour tous les SaaS, configurez ces événements :

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Tests en local

### Avec comptes séparés :

```bash
# Terminal 1 - SaaS 1
stripe listen --forward-to localhost:3001/api/auth/stripe/webhook

# Terminal 2 - SaaS 2
stripe listen --forward-to localhost:3002/api/auth/stripe/webhook
```

### Avec un seul compte :

```bash
# Les deux SaaS recevront tous les événements
stripe listen --forward-to localhost:3001/api/auth/stripe/webhook
```

## Recommandations

### ✅ Pour plusieurs SaaS distincts :

- **Utilisez des comptes Stripe séparés**
- Configuration plus simple
- Isolation totale
- Facturation séparée

### ⚠️ Pour un seul compte :

- Implémentez un **filtrage strict**
- Utilisez des **metadata systématiques**
- **Testez rigoureusement** le filtrage
- Surveillez les logs pour éviter les événements croisés

### ❌ À éviter :

- Un seul webhook pour tous les SaaS
- Pas de filtrage des événements
- Mélange des données entre SaaS

## Sécurité

- Chaque SaaS doit avoir son propre `STRIPE_WEBHOOK_SECRET`
- Validez toujours la signature du webhook
- Loggez les événements ignorés pour débugger
- Utilisez des environnements séparés (dev/staging/prod)

---

**En résumé :** Pour un vrai setup multi-SaaS, les **comptes Stripe séparés** sont la solution la plus robuste et maintenable. 🎯
