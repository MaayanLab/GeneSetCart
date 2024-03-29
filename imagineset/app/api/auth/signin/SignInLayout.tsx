'use client'
import { ClientSafeProvider, LiteralUnion, signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import styles from '../signin/signin.module.css'

import { styled } from '@mui/material/styles';
import { BuiltInProviderType } from "next-auth/providers/index";
import { Alert, Card, Stack, Typography } from "@mui/material";

const Item = styled(Card)(() => ({
  padding: 8,
  textAlign: 'center',
  width: '400px',
  borderRadius: 20,
  borderColor: '#a7c4e4',
  boxShadow: '10px 10px 10px 3px rgb(113, 142, 174);',
  justifyContent: 'center',
  border: 'none',
  alignItems:'center'
}));


const providerImages: { [key: string]: string } = {
  'Google': 'https://authjs.dev/img/providers/google.svg',
  'GitHub': 'https://authjs.dev/img/providers/github.svg'
}

const errors: Record<string, string> = {
	"Signin": "Try signing in with a different account.",
	"OAuthSignin": "Try signing in with a different account.",
	"OAuthCallback": "Try signing in with a different account.",
	"OAuthCreateAccount": "Try signing in with a different account.",
	"EmailCreateAccount": "Try signing in with a different account.",
	"Callback": "Try signing in with a different account.",
	"OAuthAccountNotLinked":
		"To confirm your identity, sign in with the same account you used originally.",
	"EmailSignin": "The e-mail could not be sent.",
	"CredentialsSignin":
		"Sign in failed. Check the details you provided are correct.",
	"SessionRequired": "Please sign in to access this page.",
	"default": "Unable to sign in.",
};


export function SignInLayout({ providers }: { providers: never[] | Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> }) {
  const searchParams = useSearchParams()
  let callbackUrl = searchParams.get('callbackUrl')
  if (callbackUrl === null) {
    callbackUrl = '/'
  }
  const error = searchParams.get('error')
  return (
    <div className={styles.page}>
      <Stack direction='column'>
      <Typography variant="h1" color="secondary.dark" className='p-5'>GET-GENE-SET-GO</Typography>
      <Item elevation={3}>
        <center><img src="/img/G2SG-logo.png" alt="Logo" loading="lazy" height="200" width="200" ></img></center>
        {error !== null && <Alert severity="error"sx={{fontSize:14, marginBottom: 1}}>{errors[error]}</Alert>}
        {Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <button className={styles.providerbutton} onClick={() => signIn(provider.id, { redirect: true, callbackUrl: callbackUrl as string })}>
              <img loading="lazy" height="24" width="24" id="provider-logo" src={providerImages[provider.name]} className="flex-none"></img>
              <span className="grow">Sign in with {provider.name}</span>
            </button>
          </div>))}
      </Item>
      </Stack>
    </div>
  )
}

