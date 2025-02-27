This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Initialisation de Drizzle

Pour configurer et initialiser Drizzle dans ce projet, suivez ces étapes :

1. Récupérez une variable `DATABASE_URL` et placez-la dans votre fichier `.env`

2. Exécutez la commande suivante pour générer les schémas de base de données :

   ```bash
   pnpm db:generate
   ```

3. Migrez votre base de données :

   ```bash
   pnpm db:migrate
   ```

   Pour effectuer un reset complet avec des données initiales :

   ```bash
   pnpm db:reset-seed
   ```

## BDD mode développement

Pour faciliter le développement avec la base de données, voici les commandes utiles :

1. Réinitialisez complètement la base de données avec les données initiales :

   ```bash
   pnpm db:reset-seed
   ```

2. Modifiez les données de seed en éditant le fichier :

   ```
   src/db/scripts/seed.ts
   ```

3. Utilisez l'interface Drizzle Studio pour explorer et modifier la base de données :

   ```bash
   pnpm db:studio
   ```

4. Supprimez un script de migration spécifique :
   ```bash
   pnpm db:drop
   ```

## Génération de AUTH_SECRET

Pour sécuriser l'authentification, vous devez générer un AUTH_SECRET unique. Vous pouvez utiliser la commande suivante :

```bash
openssl rand -base64 32
```

Ou avec Node.js :

```bash
node -e "console.log(crypto.randomBytes(32).toString('base64'))"
```

Copiez la valeur générée dans votre fichier `.env` :

```
AUTH_SECRET=votre_secret_généré
```

## Configuration de Resend pour les emails

Pour permettre l'envoi d'emails via Resend, vous devez configurer votre clé API :

1. Créez un compte sur [Resend](https://resend.com/) et obtenez votre clé API

2. Ajoutez cette clé dans votre fichier `.env` :
   ```
   RESEND_API_KEY=votre_clé_api_resend
   ```

First, run the development server:

```bash
pnpm dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
