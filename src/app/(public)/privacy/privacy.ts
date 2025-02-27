type privacyItem = {
  title: string
  description: string
  contents?: string[]
}
export const privacy: privacyItem[] = [
  {
    title: 'Politique de Confidentialité',
    description:
      'Votre vie privée est importante pour nous. Cette politique de confidentialité décrit les types d\'informations que [Nom de l\'entreprise] ("nous", "notre", "nos") peut collecter auprès de vous ou que vous nous fournissez lorsque vous utilisez notre service, et la façon dont nous utilisons, protégeons et divulguons ces informations. En utilisant le service, vous acceptez la collecte et l\'utilisation des informations conformément à cette politique.',
  },
  {
    title: 'Informations Collectées',
    description:
      "Nous pouvons collecter différents types d'informations lorsque vous utilisez notre service, y compris :",
    contents: [
      "Informations d'identification personnelles telles que votre nom, adresse e-mail, numéro de téléphone, et informations de facturation lorsque vous vous inscrivez pour utiliser notre service.",
      "Informations sur votre entreprise, telles que le nom de l'entreprise, l'adresse, et d'autres informations financières nécessaires à la gestion de vos finances.",
      "Informations sur votre activité sportive, telles que les types d'activités effectuées, la durée et l'intensité de l'exercice.",
    ],
  },
  {
    title: 'Utilisation des Informations',
    description: 'Nous utilisons les informations que nous collectons pour :',
    contents: [
      'Fournir, maintenir et améliorer notre service.',
      'Personnaliser votre expérience et répondre à vos besoins individuels.',
      'Traiter vos transactions financières et vous fournir un suivi de vos finances.',
      "Suivre et analyser les tendances d'utilisation et les préférences des utilisateurs.",
      'Vous envoyer des informations administratives, telles que des alertes de compte, des mises à jour sur les services ou des communications liées au service.',
    ],
  },
  {
    title: 'Protection des Informations',
    description:
      'La sécurité de vos informations est importante pour nous. Nous mettons en œuvre des mesures de sécurité appropriées pour protéger les informations contre tout accès non autorisé, toute altération, toute divulgation ou toute destruction.',
  },
  {
    title: 'Conservation des Données',
    description:
      'Nous conservons vos informations personnelles aussi longtemps que nécessaire aux fins pour lesquelles elles ont été collectées et conformément aux exigences légales.',
  },
  {
    title: 'Changements de la Politique de Confidentialité',
    description:
      'Nous nous réservons le droit de mettre à jour ou de modifier cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de révision mise à jour.',
  },
]
