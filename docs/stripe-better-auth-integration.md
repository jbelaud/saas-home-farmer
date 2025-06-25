# Documentation : Intégration Stripe avec Better Auth - Native + Custom

## Vue d'ensemble

Cette documentation explique notre architecture d'intégration Stripe qui combine :

- **Better Auth Stripe Plugin** (gestion native des abonnements)
- **Intégration Custom** (fonctionnalités avancées et formulaires enrichis)

## 1. Gestion des Webhooks Stripe par Better Auth

### Hooks Automatiques Better Auth

Better Auth gère automatiquement plusieurs événements Stripe via son plugin :

- Création/mise à jour des abonnements
- Gestion des statuts (`active`, `trialing`, `canceled`)
- Synchronisation des données utilisateur-customer

### Hooks Custom Complémentaires

Notre implémentation dans `src/lib/stripe/stripe-events.ts` enrichit le système Better Auth :

```typescript
export async function onStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      // Gestion de 3 cas spécifiques :

      // 1. Better Auth natif (automatique)
      if (metadata.managed_by === 'better_auth' && !metadata.source) {
        console.log('📋 Checkout Better Auth natif - traité automatiquement')
      }

      // 2. Checkout custom avec utilisateur connecté
      else if (metadata.source === 'custom_checkout') {
        await createSubscriptionFromStripeService(/* ... */)
      }

      // 3. Checkout guest + création de compte
      else if (metadata.source === 'guest_checkout') {
        const newUser = await createUserFromStripeService(/* ... */)
        await createSubscriptionFromStripeService(/* ... */)
      }
    }
  }
}
```

## 2. Configuration des Plans Stripe

### Plans Better Auth Standard

Configuration dans `src/lib/stripe/stripe-utils.ts` :

```typescript
export const betterAuthPlans: StripePlan[] = [
  {
    name: PlanConst.PRO,
    priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
    annualDiscountPriceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY,
    limits: {projects: 1, storage: 10},
  },
  {
    name: PlanConst.LIFETIME,
    priceId: env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME,
    limits: {projects: 20, storage: 50},
    freeTrial: {days: 14},
  },
]
```

## 3. Checkout Better Auth Natif

### Fonctionnalités Natives

Better Auth offre une API simple pour les abonnements :

```typescript
// Exemple dans checkout-better-auth.tsx
const {error} = await authClient.subscription.upgrade({
  plan: 'pro',
  successUrl: '/checkout/success',
  cancelUrl: '/pricing',
  annual: isYearly,
  seats: seats,
})
```

**✅ Avantages Better Auth :**

- Gestion automatique des webhooks
- Synchronisation user/customer automatique
- API simple et sécurisée
- Support des essais gratuits
- Gestion des sièges (team subscriptions)

**❌ Limitations Better Auth :**

- Interface checkout Stripe standard uniquement
- Pas de formulaires embeddés
- Pas de React Stripe Elements
- Pas de création de compte post-paiement
- Personnalisation limitée de l'UX

## 4. Intégrations Custom - Extensions

Pour pallier les limitations de Better Auth, nous avons développé 4 types de checkout custom :

### 4.1 Embedded Checkout Custom

**Fichiers :**

- `src/components/features/checkout-stripe/embed/checkout-form-embedded.tsx`
- `src/components/features/checkout-stripe/embed/action.ts`

```typescript
// Création de session embedée avec métadonnées custom
const session = await stripeClient.checkout.sessions.create({
  customer: user.stripeCustomerId,
  ui_mode: 'embedded', // ✨ Mode embeddé
  metadata: {
    source: 'custom_checkout',
    managed_by: 'better_auth',
    userId: user.id,
  },
})
```

**Avantages :**

- Interface intégrée dans votre page
- UX fluide sans redirection
- Personnalisation du design

### 4.2 Checkout Externe Custom

**Fichiers :**

- `src/components/features/checkout-stripe/external-checkout/checkout-button-external.tsx`
- `src/components/features/checkout-stripe/external-checkout/actions.ts`

```typescript
// Session avec redirect mais logique custom
const session = await stripeClient.checkout.sessions.create({
  customer: customerId,
  mode: isReccuring ? 'subscription' : 'payment',
  metadata: {
    source: 'custom_checkout',
    managed_by: 'better_auth',
  },
})
```

### 4.3 Payment Links (Guest Checkout)

**Fichiers :**

- `src/components/features/checkout-stripe/payment-link/checkout-payment-link.tsx`
- `src/components/features/checkout-stripe/payment-link/actions.ts`

```typescript
// Payment link pour utilisateurs non connectés
const paymentLink = await stripeClient.paymentLinks.create({
  metadata: {
    guest_checkout: 'true', // ✨ Création compte automatique
    source: 'custom_checkout',
  },
})
```

**Avantages :**

- Permet la création de compte après paiement
- Pas besoin d'authentification préalable
- URL partageable

### 4.4 React Stripe Elements

**Fichiers :**

- `src/components/features/checkout-stripe/react-stripe/checkout-button-react-stripe.tsx`
- `src/components/features/checkout-stripe/react-stripe/actions.ts`

```typescript
// Utilisation de Setup Intent + éléments custom
const setupIntent = await stripeClient.setupIntents.create({
  customer: customerId,
  payment_method_types: ['card'],
  metadata: { /* ... */ },
})

// Côté client avec Elements
<Elements stripe={stripe} options={{clientSecret}}>
  <PaymentElement />
</Elements>
```

**Avantages :**

- Contrôle total sur l'UX
- Validation en temps réel
- Formulaires personnalisés

## 5. Architecture de Routage des Checkouts

### Paramètre Guest - Logique de Routage

Le paramètre `guest` dans l'URL détermine quel type d'interface de checkout afficher :

```typescript
// URL Examples:
// /checkout/price_123?guest=true    → Payment Links (utilisateurs non connectés)
// /checkout/price_123?guest=false   → Formulaires avancés (utilisateurs connectés)
// /checkout/price_123               → Par défaut guest=false
```

**Logique d'affichage :**

- **`guest=true`** : Affiche uniquement les Payment Links Stripe (checkout sans compte)
- **`guest=false`** : Affiche les formulaires avancés (Embedded, External, React Elements)

### Configuration dans `checkout-page.tsx`

```typescript
// Configuration par type d'utilisateur
// Pour les utilisateurs connectés (guest=false)
const enableEmbededForm = true
const enableExternalForm = false
const enableCheckoutButtonReactStripe = false

// Pour les utilisateurs non connectés (guest=true)
const enablePaymentLink = true
```

### Router par Price ID avec Paramètre Guest

```typescript
// Route: /checkout/[priceId]?guest=true|false
// Contrôle le type de checkout via le paramètre guest
export default async function Page({params, searchParams}: PropsParams) {
  const guest = searchParamsStore.guest === 'true'
  return (
    <CheckoutPage
      priceId={priceId}
      couponId={searchParams.couponCode}
      seats={searchParams.seats}
      guest={guest} // ✨ Nouveau paramètre
    />
  )
}
```

### Logique de Routage Guest vs Authenticated

```typescript
// Dans checkout-page.tsx
export default async function CheckoutPage({
  priceId,
  couponId,
  seats = 1,
  guest = false, // ✨ Paramètre guest
}) {
  return (
    <Card>
      {/* Guest Checkout - Payment Links */}
      {guest && enablePaymentLink && (
        <CheckoutPaymentLink priceId={priceId} seats={seats} />
      )}

      {/* Authenticated Checkout - Options avancées */}
      {!guest && enableEmbededForm && (
        <CheckoutFormEmbedded priceId={priceId} seats={seats} />
      )}
      {!guest && enableCheckoutButtonReactStripe && (
        <CheckoutButtonReactStripe priceId={priceId} seats={seats} />
      )}
      {!guest && enableExternalForm && (
        <CheckoutButtonExternal priceId={priceId} seats={seats} />
      )}
    </Card>
  )
}
```

## 6. Gestion des Événements Webhook

### Flux de Traitement

1. **Better Auth natif** → Traitement automatique
2. **Custom checkout** → `createSubscriptionFromStripeService()`
3. **Guest checkout** → `createUserFromStripeService()` + abonnement

### Métadonnées de Routage

```typescript
// Identification du type de checkout via metadata
metadata: {
  source: 'custom_checkout' | 'guest_checkout',
  managed_by: 'better_auth',
  userId?: string,
  plan: SubscriptionPlan,
  seats: number,
  interval: 'month' | 'year',
  isReccuring: 'true' | 'false',
}
```

## 7. Avantages de l'Architecture Hybride

### ✅ Combinaison du Meilleur des Deux Mondes

**Better Auth (Base solide) :**

- Gestion automatique des abonnements
- Sécurité et validation
- Synchronisation données
- API standardisée

**Custom (Flexibilité) :**

- Formulaires embeddés
- Création compte post-paiement
- React Stripe Elements
- UX personnalisée

### 🔧 Maintenance Simplifiée

- Un seul webhook endpoint
- Routage intelligent par métadonnées
- Services centralisés
- Architecture en couches respectée

## 8. Utilisation Recommandée

### Cas d'Usage par Type

| Type                  | Cas d'Usage                                 | Paramètre Guest | Authentification | Fichier Principal                                |
| --------------------- | ------------------------------------------- | --------------- | ---------------- | ------------------------------------------------ |
| **Better Auth Natif** | Abonnements simples, utilisateurs connectés | `false`         | ✅ Requise       | `checkout-better-auth.tsx`                       |
| **Embedded Custom**   | UX fluide, intégration design               | `false`         | ✅ Requise       | `embed/checkout-form-embedded.tsx`               |
| **External Custom**   | Fonctionnalités avancées                    | `false`         | ✅ Requise       | `external-checkout/checkout-button-external.tsx` |
| **Payment Links**     | Utilisateurs non connectés, partage         | `true`          | ❌ Optionnelle   | `payment-link/checkout-payment-link.tsx`         |
| **React Elements**    | Contrôle total UX                           | `false`         | ✅ Requise       | `react-stripe/checkout-button-react-stripe.tsx`  |

### Configuration Recommandée

```typescript
// URLs de checkout recommandées :

// Pour utilisateurs non connectés (guest checkout)
// /checkout/price_xxx?guest=true
const guestCheckoutUrl = `/checkout/${priceId}?guest=true&seats=${seats}`

// Pour utilisateurs connectés (formulaires avancés)
// /checkout/price_xxx?guest=false
const authCheckoutUrl = `/checkout/${priceId}?guest=false&seats=${seats}`

// Logique d'application
const redirectUrl = user ? authCheckoutUrl : guestCheckoutUrl
```

## 9. Structure des Fichiers

```
src/
├── lib/stripe/
│   ├── stripe-events.ts          # Gestion webhooks custom
│   └── stripe-utils.ts           # Configuration plans & utils
├── app/[locale]/(public)/checkout/
│   ├── [priceId]/page.tsx       # Route checkout dynamique (?guest=true|false)
│   └── better-auth/             # Checkout Better Auth natif
└── components/features/checkout-stripe/
    ├── checkout-page.tsx        # Page principale avec logique guest/auth
    ├── actions.ts              # Actions communes
    ├── embed/                  # Checkout embeddé (guest=false)
    ├── external-checkout/      # Checkout externe (guest=false)
    ├── payment-link/          # Payment links (guest=true)
    └── react-stripe/         # React Stripe Elements (guest=false)
```

## 10. Variables d'Environnement Requises

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Plans Stripe
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_LIFETIME=price_...
```

## 11. Points d'Attention

### Sécurité

- Toujours utiliser `metadata.managed_by = 'better_auth'` pour identifier nos checkouts
- Valider les webhooks avec `stripeWebhookSecret`
- Vérifier l'authentification dans les Server Actions

### Performance

- Utiliser `react-cache` pour les appels DAL
- Éviter les appels Stripe redondants
- Implémenter la validation côté client ET serveur

### Maintenance

- Respecter l'architecture en couches
- Centraliser la logique Stripe dans les façades
- Documenter les nouveaux types de checkout

---

## 12. Exemples d'Utilisation du Paramètre Guest

### Redirection Conditionnelle dans l'Application

```typescript
// Dans votre composant de pricing ou bouton d'abonnement
function SubscribeButton({ priceId, planName }) {
  const { user } = useAuth()

  const handleSubscribe = () => {
    // Logique de redirection basée sur l'état d'authentification
    const checkoutUrl = user
      ? `/checkout/${priceId}?guest=false&seats=1`  // Utilisateur connecté → UX avancée
      : `/checkout/${priceId}?guest=true&seats=1`   // Visiteur → Payment Link simple

    window.location.href = checkoutUrl
  }

  return (
    <Button onClick={handleSubscribe}>
      S'abonner au {planName}
    </Button>
  )
}
```

### Gestion des Liens Directs

```typescript
// URLs directes que vous pouvez partager ou utiliser dans vos emails
const links = {
  // Pour partage public / marketing
  publicCheckout: `https://yourapp.com/checkout/price_123?guest=true`,

  // Pour utilisateurs dans l'app
  userCheckout: `https://yourapp.com/checkout/price_123?guest=false`,

  // Avec paramètres additionnels
  teamCheckout: `https://yourapp.com/checkout/price_123?guest=false&seats=5&couponCode=TEAM20`,
}
```

### Avantages de cette Approche

✅ **Flexibilité Maximale** : Une seule route pour tous les cas d'usage  
✅ **UX Adaptée** : Interface optimisée selon le contexte utilisateur  
✅ **Maintenance Simplifiée** : Logique centralisée dans `checkout-page.tsx`  
✅ **URLs Partageables** : Links directs pour marketing/support

---

Cette architecture nous permet de bénéficier de la robustesse de Better Auth tout en offrant la flexibilité nécessaire pour des besoins spécifiques d'UX et de fonctionnalités avancées.
