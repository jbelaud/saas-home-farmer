'use client'

import type {Session} from 'better-auth'
import React, {createContext, useContext, useEffect, useState} from 'react'

import {RoleConst} from '@/services/types/domain/auth-types'
import {User} from '@/services/types/domain/user-types'

interface AuthContextType {
  user: User | null
  session: Session | null
  //setUser: (user: User | null) => void
  //setSession: (session: Session | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser?: User | null
  initialSession?: Session | null
}

export default function AuthProvider({
  children,
  initialUser = null,
  initialSession = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [session, setSession] = useState<Session | null>(initialSession)

  // Synchroniser avec les props quand elles changent
  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  useEffect(() => {
    setSession(initialSession)
  }, [initialSession])

  const value: AuthContextType = {
    user,
    session,
    // setUser,
    // setSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook utilitaire pour vérifier les rôles de l'utilisateur
export function useAuthUserRole() {
  const {user} = useAuth()

  const isAdmin = user?.role === RoleConst.ADMIN
  const isUser = user?.role === RoleConst.USER
  const isSuperAdmin = user?.role === RoleConst.SUPER_ADMIN
  const isPublic = user?.role === RoleConst.PUBLIC
  const isRedactor = user?.role === RoleConst.REDACTOR
  const isModerator = user?.role === RoleConst.MODERATOR

  return {
    isAdmin,
    isUser,
    isSuperAdmin,
    isPublic,
    isRedactor,
    isModerator,
  }
}
