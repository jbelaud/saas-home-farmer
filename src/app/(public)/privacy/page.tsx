import {Metadata} from 'next'
import {privacy} from './privacy'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Page de politique de confidentialité',
}
const Page = () => {
  return (
    <div className="mx-auto max-w-3xl p-6 text-lg">
      {privacy.map((privacyitem) => {
        return <Privacy key={privacyitem.title} {...privacyitem} />
      })}
    </div>
  )
}

type PrivacyProps = {
  title: string
  description: string
  contents?: string[]
}

const Privacy = (props: PrivacyProps) => {
  const {contents, description, title} = props

  const pricacyContents = contents?.map((content, cIndex) => {
    return (
      <li className="list-disc p-1" key={cIndex}>
        {content}
      </li>
    )
  })
  return (
    <div className="py-2">
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      {pricacyContents && pricacyContents.length > 0 && (
        <ul className="text-muted-foreground pl-8">{pricacyContents}</ul>
      )}
    </div>
  )
}
export default Page
