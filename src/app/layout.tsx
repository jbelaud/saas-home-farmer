import './globals.css'

import type {Metadata} from 'next'
import React from 'react'

import {APP_DESCRIPTION} from '@/lib/constants'

import BaseLayout from './base-layout'

export const metadata: Metadata = {
  title: APP_DESCRIPTION,
  description: 'Next SaaS Boilerplate',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <BaseLayout>{children}</BaseLayout>
}
