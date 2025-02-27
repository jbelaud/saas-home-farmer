import {Metadata} from 'next'
import {terms} from './terms'

export const metadata: Metadata = {
  title: "Condition d'utilisation",
  description: "Page de condition d'utilisation",
}
const Page = () => {
  return (
    <div className="mx-auto max-w-3xl p-6 text-lg">
      <h1 className="mb-4 text-3xl font-bold">Conditions d&apos;Utilisation</h1>
      {terms.map((term, index) => {
        return <Term key={term.title} {...term} index={index + 1} />
      })}
    </div>
  )
}

type TermsProps = {
  title: string
  contents: string[]
  index: number
}
const Term = (props: TermsProps) => {
  const {title, contents, index} = props
  const termsContent = contents.map((content, cIndex) => {
    return (
      <li className="p-1" key={cIndex}>
        <span className="">
          {index}.{cIndex + 1}.
        </span>{' '}
        {content}
      </li>
    )
  })
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-xl font-semibold">
        <span>{index}.</span> {title}
      </h2>
      <ul className="text-muted-foreground pl-3">{termsContent}</ul>
    </div>
  )
}

export default Page
