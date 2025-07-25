import {FlatCompat} from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import drizzle from 'eslint-plugin-drizzle'
import github from 'eslint-plugin-github'
import jsonFormat from 'eslint-plugin-json-format'
import prettier from 'eslint-plugin-prettier'
import promise from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import {dirname} from 'path'
import {fileURLToPath} from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const eslintConfig = [
  {
    ignores: ['src/components/ui/*', '**/dist/**'],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'eslint:recommended',
    'plugin:react/recommended'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react,
      github,
      'json-format': jsonFormat,
      unicorn,
      promise,
      drizzle,
      prettier,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'import/no-commonjs': 'off',
      'import/no-namespace': 'off',
      'import/named': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/no-new-statics': 'error',
      'promise/no-return-in-finally': 'warn',
      'promise/valid-params': 'warn',
      'promise/avoid-new': 'off',
      'react/prop-types': 'off',
      'i18n-text/no-en': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // ✅ Ajout des règles pour les template strings
      'prefer-template': 'error',
      'no-useless-concat': 'error',
      'no-template-curly-in-string': 'error',

      'github/no-implicit-buggy-globals': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-restricted-properties': [
        'warn',
        {
          object: 'process',
          property: 'env',
          message:
            'N’utilise pas process.env directement. Utilise le fichier env.ts typé. (import {env} from "@/env")',
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/db/models/*',
            '@/db/repositories/*',
            '@/services/*-service',
            '@/services/interceptors/*-service-interceptor',
            'drizzle-orm',
          ],
        },
      ],
    },
  },
]

export default eslintConfig
