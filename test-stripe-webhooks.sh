#!/bin/bash

echo "🧪 Test des webhooks Stripe Better Auth"
echo "========================================="

# Fonctions pour les tests individuels
test_subscription_created() {
    echo "📝 Exécution: Création d'abonnement"
    stripe trigger customer.subscription.created \
      --add "object:id=sub_test123" \
      --add "object:customer=cus_test123" \
      --add "object:current_period_start=$(date +%s)" \
      --add "object:current_period_end=$(($(date +%s) + 2592000))" \
      --add "object:status=active" \
      --add "object:items[data][0][id]=si_test123" \
      --add "object:items[data][0][price][id]=price_test123" \
      --add "object:items[data][0][price][recurring][interval]=month" \
      --add "object:items[data][0][quantity]=1" \
      --add "object:metadata[plan]=pro" \
      --add "object:metadata[customerEmail]=test@example.com"
    echo "✅ Webhook envoyé!"
}

test_subscription_renewed() {
    echo "💰 Exécution: Renouvellement réussi (paiement récurrent)"
    stripe trigger customer.subscription.updated \
      --add "object:id=sub_test123" \
      --add "object:customer=cus_test123" \
      --add "object:current_period_start=$(date +%s)" \
      --add "object:current_period_end=$(($(date +%s) + 2592000))" \
      --add "object:status=active" \
      --add "object:items[data][0][id]=si_test123" \
      --add "object:items[data][0][price][id]=price_test123" \
      --add "object:items[data][0][price][recurring][interval]=month" \
      --add "object:items[data][0][quantity]=1" \
      --add "object:metadata[plan]=pro" \
      --add "object:metadata[customerEmail]=test@example.com"
    echo "✅ Webhook envoyé!"
}

test_payment_failed() {
    echo "❌ Exécution: Échec de paiement récurrent"
    stripe trigger customer.subscription.updated \
      --add "object:id=sub_test123" \
      --add "object:customer=cus_test123" \
      --add "object:current_period_start=$(date +%s)" \
      --add "object:current_period_end=$(($(date +%s) + 2592000))" \
      --add "object:status=past_due" \
      --add "object:items[data][0][id]=si_test123" \
      --add "object:items[data][0][price][id]=price_test123" \
      --add "object:items[data][0][price][recurring][interval]=month" \
      --add "object:items[data][0][quantity]=1" \
      --add "object:metadata[plan]=pro" \
      --add "object:metadata[customerEmail]=test@example.com"
    echo "✅ Webhook envoyé!"
}

test_payment_recovered() {
    echo "🔄 Exécution: Retour à actif après échec"
    stripe trigger customer.subscription.updated \
      --add "object:id=sub_test123" \
      --add "object:customer=cus_test123" \
      --add "object:current_period_start=$(date +%s)" \
      --add "object:current_period_end=$(($(date +%s) + 2592000))" \
      --add "object:status=active" \
      --add "object:items[data][0][id]=si_test123" \
      --add "object:items[data][0][price][id]=price_test123" \
      --add "object:items[data][0][price][recurring][interval]=month" \
      --add "object:items[data][0][quantity]=1" \
      --add "object:metadata[plan]=pro" \
      --add "object:metadata[customerEmail]=test@example.com"
    echo "✅ Webhook envoyé!"
}

test_subscription_canceled() {
    echo "🗑️ Exécution: Annulation d'abonnement"
    stripe trigger customer.subscription.deleted \
      --add "object:id=sub_test123" \
      --add "object:customer=cus_test123" \
      --add "object:status=canceled" \
      --add "object:canceled_at=$(date +%s)" \
      --add "object:items[data][0][id]=si_test123" \
      --add "object:items[data][0][price][id]=price_test123" \
      --add "object:items[data][0][price][recurring][interval]=month" \
      --add "object:items[data][0][quantity]=1" \
      --add "object:metadata[plan]=pro" \
      --add "object:metadata[customerEmail]=test@example.com"
    echo "✅ Webhook envoyé!"
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
    echo "0) 🚪 Quitter"
    echo ""
    echo -n "Votre choix (0-6): "
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
        0)
            echo "👋 Au revoir!"
            exit 0
            ;;
        *)
            echo "❌ Choix invalide. Veuillez choisir entre 0 et 6."
            ;;
    esac
    
    echo ""
    echo "⏳ Vérifiez vos logs, puis appuyez sur Entrée pour continuer..."
    read -r
done 