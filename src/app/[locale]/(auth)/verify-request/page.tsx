import {Card, CardContent, CardHeader} from '@/components/ui/card'

const Page = () => {
  return (
    <div className="lg:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="text-xl font-semibold">
            Dernière étape
          </CardHeader>
          <CardContent>
            Un email de verification a été envoyé à votre adresse email. Vous
            trouvez un lien de notre part. Cliquez dessus pour continuer.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Page
