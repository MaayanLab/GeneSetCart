'use client'

import React from 'react'

export function AccountLink({ children }: React.PropsWithChildren<{}>) {
  return <a href={`https://auth.cfde.cloud/realms/cfde/account/?referrer=cfde-workbench&referrer_uri=${window.location.href}`} target="_blank">My account</a>
}

