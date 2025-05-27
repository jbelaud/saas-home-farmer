import {APP_DESCRIPTION} from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex h-14 items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <div className="text-center">
          © {new Date().getFullYear()} {APP_DESCRIPTION}
          reserved.
        </div>
      </div>
    </footer>
  )
}
