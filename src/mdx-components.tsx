import type {MDXComponents} from 'mdx/types'
import Link from 'next/link'

// Ce fichier permet de fournir des composants React personnalisés
// à utiliser dans les fichiers MDX. Vous pouvez importer et utiliser
// n'importe quel composant React, y compris des styles inline,
// des composants d'autres bibliothèques, et plus encore.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Permet de personnaliser les composants intégrés, par exemple pour ajouter du style
    h1: ({children}) => (
      <h1 className="mb-6 border-b border-gray-200 pb-2 text-4xl font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className="mt-8 mb-4 text-3xl font-semibold text-gray-800 dark:text-gray-200">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="mt-6 mb-3 text-2xl font-medium text-gray-700 dark:text-gray-300">
        {children}
      </h3>
    ),
    h4: ({children}) => (
      <h4 className="mt-4 mb-2 text-xl font-medium text-gray-700 dark:text-gray-300">
        {children}
      </h4>
    ),
    p: ({children}) => (
      <p className="mb-4 text-base leading-7 text-gray-600 dark:text-gray-400">
        {children}
      </p>
    ),
    ul: ({children}) => (
      <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600 dark:text-gray-400">
        {children}
      </ul>
    ),
    ol: ({children}) => (
      <ol className="mb-4 list-inside list-decimal space-y-2 text-gray-600 dark:text-gray-400">
        {children}
      </ol>
    ),
    li: ({children}) => (
      <li className="text-gray-600 dark:text-gray-400">{children}</li>
    ),
    blockquote: ({children}) => (
      <blockquote className="mb-4 rounded-r-lg border-l-4 border-blue-500 bg-gray-50 py-2 pl-4 text-gray-700 italic dark:bg-gray-800 dark:text-gray-300">
        {children}
      </blockquote>
    ),
    code: ({children}) => (
      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        {children}
      </code>
    ),
    pre: ({children}) => (
      <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
        {children}
      </pre>
    ),
    a: ({href, children}) => {
      // Lien interne utilisant Next.js Link
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
      // Lien externe
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
    table: ({children}) => (
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </table>
      </div>
    ),
    th: ({children}) => (
      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:bg-gray-800 dark:text-gray-400">
        {children}
      </th>
    ),
    td: ({children}) => (
      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">
        {children}
      </td>
    ),
    ...components,
  }
}
