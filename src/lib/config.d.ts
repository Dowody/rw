declare module '*/config' {
  import { AppKitNetwork } from '@reown/appkit/networks'
  import { EthersAdapter } from '@reown/appkit-adapter-ethers'

  export const projectId: string
  export const metadata: {
    name: string
    description: string
    url: string
    icons: string[]
  }
  export const networks: [AppKitNetwork, ...AppKitNetwork[]]
  export const ethersAdapter: EthersAdapter
} 