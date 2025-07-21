import Link from 'next/link'
import type {ReactNode} from 'react'

export const mdxComponents = {
  h1: ({children}: {children: ReactNode}) => (
    <h1 className="mb-6 border-b border-gray-200 pb-2 text-4xl font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
      {children}
    </h1>
  ),
  h2: ({children}: {children: ReactNode}) => (
    <h2 className="mt-8 mb-4 text-3xl font-semibold text-gray-800 dark:text-gray-200">
      {children}
    </h2>
  ),
  h3: ({children}: {children: ReactNode}) => (
    <h3 className="mt-6 mb-3 text-2xl font-medium text-gray-700 dark:text-gray-300">
      {children}
    </h3>
  ),
  h4: ({children}: {children: ReactNode}) => (
    <h4 className="mt-4 mb-2 text-xl font-medium text-gray-700 dark:text-gray-300">
      {children}
    </h4>
  ),
  p: ({children}: {children: ReactNode}) => (
    <p className="mb-4 text-base leading-7 text-gray-600 dark:text-gray-400">
      {children}
    </p>
  ),
  ul: ({children}: {children: ReactNode}) => (
    <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
      {children}
    </ul>
  ),
  ol: ({children}: {children: ReactNode}) => (
    <ol className="mb-4 list-inside list-decimal space-y-2 text-gray-600 dark:text-gray-400">
      {children}
    </ol>
  ),
  li: ({children}: {children: ReactNode}) => (
    <li className="text-gray-600 dark:text-gray-400">{children}</li>
  ),
  blockquote: ({children}: {children: ReactNode}) => (
    <blockquote className="mb-4 rounded-r-lg border-l-4 border-blue-500 bg-gray-50 py-2 pl-4 text-gray-700 italic dark:bg-gray-800 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  code: ({children, className}: {children: ReactNode; className?: string}) => {
    // Si c'est un bloc de code (avec className), laisser Shiki s'en occuper
    if (className) {
      return <code className={className}>{children}</code>
    }
    // Sinon, c'est du code inline
    return (
      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        {children}
      </code>
    )
  },
  pre: ({children, className}: {children: ReactNode; className?: string}) => (
    <pre
      className={`mb-4 overflow-x-auto rounded-lg ${className || 'bg-gray-900 p-4 text-sm text-gray-100'}`}
    >
      {children}
    </pre>
  ),
  table: ({children}: {children: ReactNode}) => (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
        {children}
      </table>
    </div>
  ),
  thead: ({children}: {children: ReactNode}) => (
    <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
  ),
  tbody: ({children}: {children: ReactNode}) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  ),
  tr: ({children}: {children: ReactNode}) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">{children}</tr>
  ),
  th: ({children}: {children: ReactNode}) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 dark:border-gray-600 dark:text-gray-100">
      {children}
    </th>
  ),
  td: ({children}: {children: ReactNode}) => (
    <td className="border border-gray-300 px-4 py-2 text-gray-600 dark:border-gray-600 dark:text-gray-400">
      {children}
    </td>
  ),
  a: ({href, children}: {href?: string; children: ReactNode}) => {
    if (href && href.startsWith('/')) {
      return (
        <Link
          href={href}
          className="text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {children}
        </Link>
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {children}
      </a>
    )
  },
  hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
}
