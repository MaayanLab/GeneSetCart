import { getProviders } from "next-auth/react"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth/authOptions'
import { SignInLayout } from "./SignInLayout"

export default async function SignIn() {
  const providers = await getProvidersServer()
  if (providers.providers) {
    return (
      <SignInLayout providers={providers.providers}/>
    )
  }
else {
  return <></>
}
}

async function getProvidersServer() {
  'use server'
  const session = await getServerSession(authOptions)
  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } }
  }

  const providers = await getProviders()

  return {
    providers: providers ?? [],
  }
}