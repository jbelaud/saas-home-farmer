# Documentation : Intégration Stripe avec Better Auth - Native + Custom

## Vue d'ensemble

Cette documentation explique notre architecture d'intégration Stripe qui combine :

- **Better Auth Stripe Plugin** (gestion native des abonnements)
- **Intégration Custom** (fonctionnalités avancées et formulaires enrichis)
- **Système d'Installments** (paiements en plusieurs fois pour plans non-récurrents)

## 1. Configuration des Types de Checkout

### Types de Checkout Disponibles

Notre système supporte 5 types de checkout configurables via `NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE` :

```typescript
export const StripeCheckoutConst = {
  EMBEDED_FORM: 'EmbededForm', // Formulaire intégré dans la page
  EXTERNAL_FORM: 'ExternalForm', // Redirection vers Stripe Checkout
  REACT_STRIPE_FORM: 'ReactStripeForm', // React Stripe Elements personnalisés
  PAYMENT_LINK: 'PaymentLink', // Liens de paiement (guest checkout)
} as const
```

### Architecture de Sélection (Switch Case)

La nouvelle architecture utilise un switch case centralisé dans `getCheckoutConfig()` :

```typescript
function getCheckoutConfig({
  enableInstallments,
  recapInfo,
  priceId,
  seats,
  guest,
  isRecurring,
}): CheckoutConfig {

  // 1. PRIORITÉ : Mode Installments (si activé et compatible)
  if (enableInstallments && isRecurring) {
    // ❌ Installments incompatibles avec les plans récurrents
    return {
      component: <></>,
      message: 'Installments (split payment) are not supported for recurring plans, please change price id',
    }
  }

  if (enableInstallments && recapInfo.success) {
    // ✅ Installments activés pour plans non-récurrents
    return {
      component: <CheckoutInstallment />,
      message: 'Choisissez votre mode de paiement ci-dessous',
      showTestBanner: true,
    }
  }

  // 2. Switch case pour les types de checkout standard
  switch (env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE) {
    case StripeCheckoutConst.PAYMENT_LINK:
      // Restrictions spécifiques au Payment Link

    case StripeCheckoutConst.EMBEDED_FORM:
      // Checkout embeddé

    case StripeCheckoutConst.REACT_STRIPE_FORM:
      // React Stripe Elements

    case StripeCheckoutConst.EXTERNAL_FORM:
      // Checkout externe Stripe

    default:
      // Fallback avec message d'erreur détaillé
  }
}
```

## 2. Types de Checkout Détaillés

### 2.1 Mode Installments (Prioritaire)

**Activation :** `enableInstallments=true` dans l'URL  
**Fichiers :** `installments/checkout-installment.tsx`

```typescript
// URL Example: /checkout/price_123?enableInstallments=true
```

**✅ Compatible avec :**

- Plans one-time (Lifetime, produits)
- Utilisateurs connectés ET guests
- Tous les montants

**❌ Incompatible avec :**

- Plans récurrents (monthly/yearly)
- Abonnements avec essais gratuits

**Comportement :**

- Affiche un sélecteur 2x/3x/4x installments
- Chaque installment crée un payment intent séparé
- Bannière de test visible en mode développement

### 2.2 Payment Link (Guest Checkout)

**Configuration :** `NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=PaymentLink`  
**Fichiers :** `payment-link/checkout-payment-link.tsx`

**✅ Cas d'utilisation :**

- Utilisateurs non connectés (`guest=true`)
- URLs partageables
- Marketing et landing pages
- Création de compte automatique post-paiement

**❌ Restrictions :**

- Si `guest=false`, affiche un message d'erreur
- Réservé aux utilisateurs non connectés

```typescript
// Logique de restriction
if (guest) {
  return <CheckoutPaymentLink />
} else {
  return (
    <div>
      Le mode 'paiement Link' est reservé aux utilisateurs non connectés.
    </div>
  )
}
```

### 2.3 Embedded Form

**Configuration :** `NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=EmbededForm`  
**Fichiers :** `embed/checkout-form-embedded.tsx`

**✅ Avantages :**

- Interface intégrée dans votre page
- UX fluide sans redirection
- Personnalisation complète du design
- Support mobile optimisé

**✅ Compatible avec :**

- Utilisateurs connectés et guests
- Plans récurrents et one-time
- Tous les montants et devises

**Utilisation recommandée :** Expérience utilisateur premium

### 2.4 React Stripe Elements

**Configuration :** `NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=ReactStripeForm`  
**Fichiers :** `react-stripe/checkout-button-react-stripe.tsx`

**✅ Avantages :**

- Contrôle total sur l'UX/UI
- Validation en temps réel
- Formulaires personnalisés
- Intégration native avec React

**✅ Compatible avec :**

- Utilisateurs connectés et guests
- Tous types de plans
- Gestion avancée des erreurs

**Utilisation recommandée :** Applications avec design system spécifique

### 2.5 External Form (Stripe Checkout)

**Configuration :** `NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=ExternalForm`  
**Fichiers :** `external-checkout/checkout-button-external.tsx`

**✅ Avantages :**

- Interface Stripe officielle
- Optimisations de conversion Stripe
- Support multi-langues automatique
- Gestion automatique des moyens de paiement

**✅ Compatible avec :**

- Utilisateurs connectés et guests
- Tous types de plans
- Coupons et promotions

**Utilisation recommandée :** Mise en place rapide, confiance utilisateur

## 3. Matrice de Compatibilité

| Feature / Type      | Installments | Payment Link | Embedded | React Elements | External |
| ------------------- | ------------ | ------------ | -------- | -------------- | -------- |
| **Guest Users**     | ✅           | ✅ (Only)    | ✅       | ✅             | ✅       |
| **Logged Users**    | ✅           | ❌           | ✅       | ✅             | ✅       |
| **Recurring Plans** | ❌           | ✅           | ✅       | ✅             | ✅       |
| **One-time Plans**  | ✅           | ✅           | ✅       | ✅             | ✅       |
| **Coupons**         | ❌           | ✅           | ✅       | ✅             | ✅       |
| **Multi-seats**     | ✅           | ✅           | ✅       | ✅             | ✅       |
| **Custom UI**       | ⚠️ (Limited) | ❌           | ✅       | ✅ (Full)      | ❌       |

## 4. Paramètres URL et Configuration

### Paramètres Supportés

```typescript
// Structure URL complète
/checkout/[priceId]?guest=true&enableInstallments=true&seats=5&couponCode=PROMO20

// Paramètres disponibles :
interface CheckoutParams {
  priceId: string           // ID du prix Stripe (requis)
  guest?: boolean          // Mode guest (défaut: false)
  enableInstallments?: boolean // Paiements fractionnés (défaut: false)
  seats?: number           // Nombre de sièges (défaut: 1)
  couponCode?: string      // Code promo (optionnel)
}
```

### Exemples d'URLs par Cas d'Usage

```typescript
// Utilisateur connecté - Checkout standard
const standardUrl = `/checkout/${priceId}?guest=false&seats=1`

// Utilisateur non connecté - Payment Link
const guestUrl = `/checkout/${priceId}?guest=true`

// Plan Lifetime avec installments
const installmentsUrl = `/checkout/${priceId}?enableInstallments=true&guest=false`

// Team subscription avec coupon
const teamUrl = `/checkout/${priceId}?seats=10&couponCode=TEAM50&guest=false`

// Cas d'erreur - Installments + Recurring (incompatible)
const errorUrl = `/checkout/${recurring_price_id}?enableInstallments=true`
// → Affichera un message d'erreur
```

## 5. Gestion des Incompatibilités

### Validation Automatique

Le système détecte et gère automatiquement les incompatibilités :

```typescript
// 1. Installments + Plans Récurrents
if (enableInstallments && isRecurring) {
  return {
    component: <></>,
    message: 'Installments (split payment) are not supported for recurring plans, please change price id'
  }
}

// 2. Payment Link + Utilisateur Connecté
if (type === 'PaymentLink' && !guest) {
  return {
    component: <ErrorMessage />,
    message: 'Le mode paiement Link est reservé aux utilisateurs non connectés'
  }
}

// 3. Type de checkout non configuré
default: {
  return {
    component: <ErrorMessage />,
    message: `Type de checkout non supporté: ${env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE}`
  }
}
```

### Messages d'Erreur Utilisateur

Les erreurs sont affichées avec des messages explicites :

- **Français par défaut** pour l'interface utilisateur
- **Logs techniques** en anglais pour le débogage
- **Context debugging** avec `console.log` en développement

## 6. Debugging et Logs

### Logs de Debug Intégrés

```typescript
console.log(
  '🔧 getCheckoutConfig',
  enableInstallments, // true/false
  isRecurring, // true/false
  recapInfo.success, // true/false
  env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE, // Type configuré
  guest, // true/false
  priceId, // price_xxx
  seats // nombre
)
```

### Messages d'Avertissement

```typescript
// Cas d'incompatibilité détectée
console.warn(
  'Installments are not supported for recurring plans, please use embed checkout page instead'
)
```

| **Logged Users** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Recurring Plans** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **One-time Plans** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Coupons** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Multi-seats** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Custom UI** | ⚠️ (Limited) | ❌ | ✅ | ✅ (Full) | ❌ |

## 4. Paramètres URL et Configuration

### Paramètres Supportés

```typescript
// Structure URL complète
/checkout/[priceId]?guest=true&enableInstallments=true&seats=5&couponCode=PROMO20

// Paramètres disponibles :
interface CheckoutParams {
  priceId: string           // ID du prix Stripe (requis)
  guest?: boolean          // Mode guest (défaut: false)
  enableInstallments?: boolean // Paiements fractionnés (défaut: false)
  seats?: number           // Nombre de sièges (défaut: 1)
  couponCode?: string      // Code promo (optionnel)
}
```

### Exemples d'URLs par Cas d'Usage

```typescript
// Utilisateur connecté - Checkout standard
const standardUrl = `/checkout/${priceId}?guest=false&seats=1`

// Utilisateur non connecté - Payment Link
const guestUrl = `/checkout/${priceId}?guest=true`

// Plan Lifetime avec installments
const installmentsUrl = `/checkout/${priceId}?enableInstallments=true&guest=false`

// Team subscription avec coupon
const teamUrl = `/checkout/${priceId}?seats=10&couponCode=TEAM50&guest=false`

// Cas d'erreur - Installments + Recurring (incompatible)
const errorUrl = `/checkout/${recurring_price_id}?enableInstallments=true`
// → Affichera un message d'erreur
```

## 5. Gestion des Incompatibilités

### Validation Automatique

Le système détecte et gère automatiquement les incompatibilités :

```typescript
// 1. Installments + Plans Récurrents
if (enableInstallments && isRecurring) {
  return {
    component: <></>,
    message: 'Installments (split payment) are not supported for recurring plans, please change price id'
  }
}

// 2. Payment Link + Utilisateur Connecté
if (type === 'PaymentLink' && !guest) {
  return {
    component: <ErrorMessage />,
    message: 'Le mode paiement Link est reservé aux utilisateurs non connectés'
  }
}

// 3. Type de checkout non configuré
default: {
  return {
    component: <ErrorMessage />,
    message: `Type de checkout non supporté: ${env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE}`
  }
}
```

### Messages d'Erreur Utilisateur

Les erreurs sont affichées avec des messages explicites :

- **Français par défaut** pour l'interface utilisateur
- **Logs techniques** en anglais pour le débogage
- **Context debugging** avec `console.log` en développement

## 6. Architecture des Webhooks

### Gestion Better Auth + Custom

```typescript
export async function onStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
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

      // 4. Installments (nouveau)
      else if (metadata.source === 'installment_checkout') {
        await handleInstallmentPayment(/* ... */)
      }
    }
  }
}
```

### Métadonnées par Type de Checkout

```typescript
// Métadonnées standardisées pour identification
metadata: {
  source: 'custom_checkout' | 'installment_checkout',
  guest_checkout: 'true' | 'false',
  userId?: string,
  plan: SubscriptionPlan,
  seats: number,
  interval: 'month' | 'year' | 'one_time',
  isRecurring: 'true' | 'false',
  installment_number?: string, // Pour les paiements fractionnés
  total_installments?: string, // Nombre total d'installments
}
```

## 7. Configuration Recommandée par Environnement

### Développement

```env
# Checkout type recommandé pour le dev
NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=EmbededForm

# Permet de tester tous les scénarios facilement
```

**Avantages :** Interface intégrée, debug facile, pas de redirections

### Production

```env
# Checkout type recommandé pour la prod
NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=ExternalForm

# OU pour une UX premium
NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=EmbededForm
```

**Critères de choix :**

- **External** : Conversion optimisée, confiance utilisateur
- **Embedded** : UX premium, design cohérent

### Marketing / Landing Pages

```env
# Pour les campagnes marketing
NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE=PaymentLink
```

**Avantages :** URLs partageables, pas d'authentification requise

## 8. Performance et Optimisations

### Lazy Loading des Composants

```typescript
// Chargement conditionnel des composants checkout
const CheckoutInstallment = dynamic(
  () => import('./installments/checkout-installment')
)
const CheckoutFormEmbedded = dynamic(
  () => import('./embed/checkout-form-embedded')
)
// etc...
```

### Cache et Récupération de Prix

```typescript
// Cache des informations de prix via DAL
const recapInfo = await getSubscriptionRecapInfo(priceId, couponId, seats)

// Gestion des erreurs gracieuse
if (!recapInfo.success) {
  return <ErrorDisplay error={recapInfo.error} />
}
```

## 9. Debugging et Logs

### Logs de Debug Intégrés

```typescript
console.log(
  '🔧 getCheckoutConfig',
  enableInstallments, // true/false
  isRecurring, // true/false
  recapInfo.success, // true/false
  env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE, // Type configuré
  guest, // true/false
  priceId, // price_xxx
  seats // nombre
)
```

### Messages d'Avertissement

```typescript
// Cas d'incompatibilité détectée
console.warn(
  'Installments are not supported for recurring plans, please use embed checkout page instead'
)
```

## 10. Migration et Mises à Jour

### Migration depuis l'Ancienne Architecture

```typescript
// AVANT (variables enable*)
const enableEmbededForm = env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE === 'EmbededForm'
if (enableEmbededForm) {
  /* ... */
}

// APRÈS (switch case)
switch (env.NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE) {
  case StripeCheckoutConst.EMBEDED_FORM:
    return {
      /* ... */
    }
}
```

### Tests de Non-Régression

```bash
# Tester tous les types de checkout
npm run test:checkout

# URLs de test par type
curl "/checkout/price_test?guest=true"
curl "/checkout/price_test?enableInstallments=true"
curl "/checkout/price_test" # Type configuré par défaut
```

## 11. Sécurité et Validation

### Validation des Paramètres

```typescript
// Validation automatique des paramètres
const validateCheckoutParams = (params: CheckoutParams) => {
  // Validation du priceId
  if (!params.priceId.startsWith('price_')) {
    throw new Error('Invalid priceId format')
  }

  // Validation des seats
  if (params.seats < 1 || params.seats > 100) {
    throw new Error('Seats must be between 1 and 100')
  }
}
```

### Authentification et Autorisation

```typescript
// Vérification des permissions pour chaque type
const checkPermissions = (user: User | null, guest: boolean) => {
  if (!guest && !user) {
    throw new AuthorizationError(
      'Authentication required for non-guest checkout'
    )
  }
}
```

---

## 12. Checklist de Déploiement

### Variables d'Environnement

```env
✅ STRIPE_SECRET_KEY
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ NEXT_PUBLIC_STRIPE_CHECKOUT_TYPE
✅ STRIPE_WEBHOOK_SECRET
✅ NEXT_PUBLIC_STRIPE_PRICE_ID_*
```

### Tests Fonctionnels

- [ ] Checkout standard (type configuré)
- [ ] Mode guest avec Payment Links
- [ ] Installments pour plans non-récurrents
- [ ] Validation des incompatibilités
- [ ] Webhooks et création d'abonnements
- [ ] Messages d'erreur appropriés

### Performance

- [ ] Lazy loading des composants
- [ ] Cache DAL configuré
- [ ] Logs de production minimisés

Cette architecture offre une flexibilité maximale tout en maintenant la robustesse et la sécurité nécessaires pour un système de paiement en production.
