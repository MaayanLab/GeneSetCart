'use client'

import React from 'react'
import Link from "next/link"
import { signIn, signOut } from 'next-auth/react'
import Cookies from 'js-cookie'

export function SignInLink({ children }: React.PropsWithChildren<{}>) {
  return <Link
    href="/api/auth/signin"
    onClick={evt => {
      evt.preventDefault()
      signIn('keycloak')
    }}>{children}</Link>
}

export function SignOutLink({ children }: React.PropsWithChildren<{}>) {
  return <Link
    href="/api/auth/signout"
    onClick={evt => {
      evt.preventDefault()
      Cookies.remove('session_id')
      signOut()
    }}>{children}</Link>
}
