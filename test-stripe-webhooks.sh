#!/bin/bash

echo "🧪 Test des webhooks Stripe Better Auth (Stripe v18 Compatible)"
echo "================================================================"
echo "ℹ️  Champs deprecated supprimés: current_period_start/end au niveau racine"
echo "✅ Utilise uniquement: items.data[0].current_period_start/end"
echo "🎯 FORCE les vrais Price IDs configurés dans Better Auth"
echo ""

# 🎯 VOS VRAIS IDs Stripe (configurés dans Better Auth)
PRICE_ID_PRO_MONTHLY="price_1QoOy0CkPpvUnhXxNTbD2tMZ"
PRICE_ID_PRO_YEARLY="price_1QoOyhCkPpvUnhXxalJdCi9G"
PRICE_ID_LIFETIME="price_1QoOzLCkPpvUnhXxTNRAOlEe"
#CUSTOMER_ID="cus_SYsNbg4wDOD37G"  # ❌ Ce customer n'a pas de payment method
CUSTOMER_ID="cus_SYsNbg4wDOD37G"  # 🎯 Laisser vide = Stripe CLI génère un customer avec payment method
SUBSCRIPTION_ID="sub_1RdrfICkPpvUnhXx1wBi66IB"  # 🎯 ID d'une subscription stripe
SUBSCRIPTION_UUID="e7ae4181-87a1-4b3e-9c89-2d7507bff796"  # 🎯 ID d'une subscription existante en base (optionnel)

echo "📋 IDs Stripe utilisés:"
if [ -z "$CUSTOMER_ID" ]; then
    echo "   - Customer ID:  [AUTO-GÉNÉRÉ] (avec payment method)"
else
    echo "   - Customer ID:  $CUSTOMER_ID"
fi
echo "   - PRO Monthly:  $PRICE_ID_PRO_MONTHLY"
echo "   - PRO Yearly:   $PRICE_ID_PRO_YEARLY"
echo "   - Lifetime:     $PRICE_ID_LIFETIME"
echo ""

# 🔍 FONCTION: Lister les subscriptions existantes en base
check_existing_subscriptions() {
    echo "🔍 Vérification des subscriptions existantes en base de données..."
    echo "💡 Cette information aide à résoudre l'erreur 'Cannot read properties of undefined'"
    echo ""
    echo "📝 Pour résoudre l'erreur, vous pouvez :"
    echo "   1️⃣ D'abord créer un checkout complet (option 7)"
    echo "   2️⃣ Puis utiliser les autres options de test"
    echo "   3️⃣ Ou ajouter un SUBSCRIPTION_UUID existant dans le script"
    echo ""
}

# 🎯 NOUVELLE FONCTION: Workflow complet avec checkout
test_complete_workflow() {
    echo "🚀 Exécution: Workflow complet checkout → subscription"
    echo "🎯 Utilise votre VRAI price ID: $PRICE_ID_PRO_MONTHLY"
    echo "📋 Cela va déclencher checkout.session.completed puis Better Auth créera automatiquement l'abonnement"
    echo ""
    
    # Créer une session de checkout (customer auto-généré si vide)
    if [ -z "$CUSTOMER_ID" ]; then
        echo "🎯 Customer auto-généré par Stripe CLI (avec payment method)"
        stripe trigger checkout.session.completed \
          --override "checkout_session:metadata[plan]"="pro" \
          --override "checkout_session:metadata[customerEmail]"="test-better-auth@example.com" \
          --override "checkout_session:metadata[source]"="webhook-test"
           --add "checkout_session:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
    else
        echo "🎯 Utilisation customer forcé: $CUSTOMER_ID"
        stripe trigger checkout.session.completed \
          --override "checkout_session:metadata[plan]"="pro" \
          --override "checkout_session:metadata[customerEmail]"="test-better-auth@example.com" \
          --override "checkout_session:metadata[source]"="webhook-test"
          --add "checkout_session:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
    fi
    
    echo "✅ Checkout session créée ! Cela va déclencher :"
    echo "   1️⃣ checkout.session.completed (traité par Better Auth)"
    echo "   2️⃣ customer.subscription.created (automatique)"
    echo "   3️⃣ Puis les futurs customer.subscription.updated pour renouvellements"
    echo ""
    echo "🔍 Vérifiez vos logs Better Auth pour voir le traitement automatique !"
}

# 🔄 SIMULATION: Renouvellement après checkout
test_renewal_simulation() {
    echo "🔄 Simulation: Renouvellement automatique (comme si 1 mois s'était écoulé)"
    echo "🎯 Simule customer.subscription.updated avec votre price ID configuré"
    echo "📋 Utilisez APRÈS avoir fait le checkout complet (option 7)"
    echo ""
    
    # MINIMAL: Juste price ID + subscriptionId en metadata
    stripe trigger customer.subscription.updated \
        --override "subscription:items[0][price]"="$PRICE_ID_PRO_MONTHLY" \
        --override "subscription:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
    
    echo "✅ Renouvellement simulé ! Better Auth devrait traiter automatiquement."
}

# Fonctions pour les tests individuels
test_subscription_created() {
    echo "📝 Exécution: Création d'abonnement"
    local period_start=$(date +%s)
    local period_end=$((period_start + 2592000))
    
    echo "🎯 Utilisation price ID PRO Monthly: $PRICE_ID_PRO_MONTHLY"
    
    stripe trigger customer.subscription.created \
      --override "subscription:items[0][price]"="$PRICE_ID_PRO_MONTHLY" \
      --override "subscription:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
    echo "✅ Webhook envoyé avec VRAI price ID!"
}

test_subscription_renewed() {
    echo "💰 Exécution: Renouvellement réussi (paiement récurrent)"
    echo "🎯 CORRECT: Utilise subscription: pour TOUT"
    
     stripe trigger customer.subscription.updated \
        --override "subscription:items[0][price]"="$PRICE_ID_PRO_MONTHLY" \
        --override "subscription:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
        --override "subscription:customer"="$CUSTOMER_ID"
   
    
    echo "✅ Webhook envoyé avec syntaxe CORRECTE !"
}

test_payment_failed() {
    echo "❌ Exécution: Échec de paiement récurrent"
    echo "🎯 MINIMAL: price ID + subscriptionId seulement"
    
    stripe trigger customer.subscription.updated \
        --override "subscription:items[0][price]"="$PRICE_ID_PRO_MONTHLY" \
        --override "subscription:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
      
    echo "✅ Webhook envoyé !"
}

test_payment_recovered() {
    echo "🔄 Exécution: Retour à actif après échec"
    echo "🎯 MINIMAL: price ID + subscriptionId seulement"
    
    stripe trigger customer.subscription.updated \
      --override "subscription:items[0][price]"="$PRICE_ID_PRO_MONTHLY" \
      --override "subscription:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
      
    echo "✅ Webhook envoyé !"
}

test_subscription_canceled() {
    echo "🗑️ Exécution: Annulation d'abonnement"
    echo "🎯 FORCE cancellation avec IDs cohérents"
    
    # stripe events create customer.subscription.deleted \
    # --data "data.object.id"="$SUBSCRIPTION_ID" \
    # --data "data.object.customer=$CUSTOMER_ID" \
    # --data "data.object.metadata[subscriptionId]=$SUBSCRIPTION_UUID"
    stripe trigger customer.subscription.deleted \
      --override "subscription:id"="$SUBSCRIPTION_ID"
      --override "subscription:items[0][price]"="$PRICE_ID_PRO_MONTHLY" \
      --override "subscription:metadata[subscriptionId]"="$SUBSCRIPTION_UUID"
      
    echo "✅ Webhook deletion envoyé avec IDs forcés!"
}

run_all_tests() {
    echo "🚀 Exécution de tous les tests en séquence..."
    test_subscription_created
    echo "⏱️  Attente de 3 secondes..."
    sleep 3
    test_subscription_renewed
    echo "⏱️  Attente de 3 secondes..."
    sleep 3
    test_payment_failed
    echo "⏱️  Attente de 3 secondes..."
    sleep 3
    test_payment_recovered
    echo "⏱️  Attente de 3 secondes..."
    sleep 3
    test_subscription_canceled
    echo "✅ Tous les tests terminés!"
}

# Menu interactif
show_menu() {
    echo ""
    echo "📋 Choisissez un test à exécuter:"
    echo "1) 📝 Création d'abonnement (subscription.created)"
    echo "2) 💰 Renouvellement réussi (subscription.updated - active)"
    echo "3) ❌ Échec de paiement (subscription.updated - past_due)"
    echo "4) 🔄 Récupération après échec (subscription.updated - active)"
    echo "5) 🗑️  Annulation d'abonnement (subscription.deleted)"
    echo "6) 🚀 Exécuter tous les tests"
    echo "7) 🚀 Exécuter le workflow complet checkout → subscription"
    echo "8) 🔄 Simuler un renouvellement (après checkout)"
    echo "0) 🚪 Quitter"
    echo ""
    echo -n "Votre choix (0-8): "
}

# Boucle principale
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            test_subscription_created
            ;;
        2)
            test_subscription_renewed
            ;;
        3)
            test_payment_failed
            ;;
        4)
            test_payment_recovered
            ;;
        5)
            test_subscription_canceled
            ;;
        6)
            run_all_tests
            ;;
        7)
            test_complete_workflow
            ;;
        8)
            test_renewal_simulation
            ;;
        0)
            echo "👋 Au revoir!"
            exit 0
            ;;
        *)
            echo "❌ Choix invalide. Veuillez choisir entre 0 et 8."
            ;;
    esac
    
    echo ""
    echo "⏳ Vérifiez vos logs, puis appuyez sur Entrée pour continuer..."
    read -r
done 