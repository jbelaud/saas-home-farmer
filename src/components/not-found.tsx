import {Search} from 'lucide-react'
import Link from 'next/link'

import {Button} from './ui/button'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from './ui/card'

export default function NotFoundComponent() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-6xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-2xl font-semibold">Page Not Found</p>
          <p className="text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
          <div className="flex justify-center" aria-hidden="true">
            <Search className="text-muted-foreground h-12 w-12" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
