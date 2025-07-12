'use client'

import {usePathname} from 'next/navigation'
import React from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {capitalize} from '@/lib/utils'

export function AppBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`
          const isLast = index === segments.length - 1
          const isFirst = index === 0

          return (
            <React.Fragment key={href}>
              {!isFirst && <BreadcrumbSeparator />}
              {!isFirst && (
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {capitalize(segment)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
