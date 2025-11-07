# @mysten/sui Usage Patterns - Next.js dApp Guide

This document demonstrates the latest usage patterns of the @mysten/sui library suite based on a production Next.js Web3 messaging application. It covers wallet integration, transaction building, encryption, and querying patterns.

---

## Table of Contents

1. [Package Overview](#package-overview)
2. [Initial Setup](#initial-setup)
3. [Core Usage Patterns](#core-usage-patterns)
4. [Transaction Patterns](#transaction-patterns)
5. [Query Patterns](#query-patterns)
6. [Advanced Patterns](#advanced-patterns)
7. [Best Practices](#best-practices)

---

## Package Overview

### Core Packages

```typescript
// Wallet & dApp Kit - React hooks for account/wallet management
import {
  useCurrentAccount,
  useSuiClient,
  useSignTransaction,
  useSignPersonalMessage,
  useDisconnectWallet,
  useSuiClientContext,
  useSuiClientQuery,
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from '@mysten/dapp-kit'

// Transaction Building
import { Transaction, TransactionResult } from '@mysten/sui/transactions'

// RPC Client & Types
import {
  SuiClient,
  SuiParsedData,
  SuiObjectResponse,
  MultiGetObjectsParams,
  GetOwnedObjectsParams,
} from '@mysten/sui/client'

// Utilities
import {
  toBase64,
  formatAddress,
  normalizeSuiNSName,
  deriveDynamicFieldID,
} from '@mysten/sui/utils'

// Serialization
import { bcs } from '@mysten/sui/bcs'

// Encryption (Mysten Seal)
import { SealClient, SessionKey } from '@mysten/seal'

// Domain Names
import { SuinsClient } from '@mysten/suins'

// Social Authentication
import { registerEnokiWallets, isEnokiNetwork } from '@mysten/enoki'
```

---

## Initial Setup

### 1. Network Configuration

**File:** `app/src/clientConfig.ts`

```typescript
import { createNetworkConfig } from '@mysten/dapp-kit'

// Define network endpoints
const { networkConfig, useNetworkVariable } = createNetworkConfig({
  testnet: {
    url: process.env.NEXT_PUBLIC_SUI_NETWORK || 'https://fullnode.testnet.sui.io:443'
  },
  mainnet: {
    url: 'https://fullnode.mainnet.sui.io:443'
  }
})

export { networkConfig, useNetworkVariable }
```

### 2. Provider Setup

**File:** `app/src/app/ProvidersAndLayout.tsx`

```typescript
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerEnokiWallets } from '@mysten/enoki'

const queryClient = new QueryClient()

// Register Enoki social wallets (Google, Facebook, Twitch)
const { enokiFlow, EnokiWallets } = registerEnokiWallets({
  apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
  network: "testnet",
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork="testnet"
      >
        <WalletProvider autoConnect>
          {/* Your custom providers */}
          <SealProvider>
            <MessagingClientProvider>
              <SuinsProvider>
                <BotChannelProvider>
                  {children}
                </BotChannelProvider>
              </SuinsProvider>
            </MessagingClientProvider>
          </SealProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
```

---

## Core Usage Patterns

### Pattern 1: Account & Wallet Management

```typescript
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'

function WalletStatus() {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()

  if (!account) {
    return <div>No wallet connected</div>
  }

  return (
    <div>
      <p>Address: {account.address}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
```

### Pattern 2: Accessing SuiClient

```typescript
import { useSuiClient } from '@mysten/dapp-kit'

function useChannelData(channelId: string) {
  const suiClient = useSuiClient()

  const fetchChannel = async () => {
    const response = await suiClient.getObject({
      id: channelId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      }
    })
    return response
  }

  return useQuery({
    queryKey: ['channel', channelId],
    queryFn: fetchChannel,
    enabled: !!channelId,
  })
}
```

### Pattern 3: Reactive Queries with useSuiClientQuery

**File:** `app/src/hooks/useSuinsData.tsx`

```typescript
import { useSuiClientQuery } from '@mysten/dapp-kit'
import { normalizeSuiNSName } from '@mysten/sui/utils'

function useSuinsData(address: string | undefined) {
  // Reactive query that automatically updates
  const { data: nameData } = useSuiClientQuery(
    'resolveNameServiceNames',
    {
      address: address!,
    },
    {
      enabled: !!address,
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      select: (data) => {
        // Transform the data
        const domain = data.data?.[0]
        return domain ? normalizeSuiNSName(domain) : null
      }
    }
  )

  return { domain: nameData }
}
```

---

## Transaction Patterns

### Pattern 4: Building & Executing Transactions

**File:** `app/src/hooks/useCreateChannel.ts`

```typescript
import { Transaction } from '@mysten/sui/transactions'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { useMessagingClient } from '@/contexts/MessagingClientProvider'

function useCreateChannel() {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const messagingClient = useMessagingClient()
  const { signAndExecuteSponsoredTransaction } = useSignAndExecuteSponsoredTransaction()

  const createChannel = useMutation({
    mutationFn: async ({
      memberAddresses,
      channelName
    }: {
      memberAddresses: string[]
      channelName?: string
    }) => {
      // 1. Create transaction object
      const tx = new Transaction()

      // 2. Build transaction with messaging client
      const txBuilder = await messagingClient.createChannelFlow({
        memberAddresses,
        ...(channelName && { channelName }),
      })

      // 3. Execute transaction builder
      await txBuilder(tx)

      // 4. Sign & execute (sponsored flow)
      const { digest } = await signAndExecuteSponsoredTransaction({
        transaction: tx
      })

      // 5. Wait for confirmation
      const { effects } = await suiClient.waitForTransaction({
        digest,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      })

      // 6. Extract created objects
      const createdObjects = effects?.created || []
      const memberCap = createdObjects.find(obj =>
        obj.owner === 'object' &&
        obj.reference.objectId.includes('MemberCap')
      )

      return {
        digest,
        memberCapId: memberCap?.reference.objectId,
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    }
  })

  return createChannel
}
```

### Pattern 5: Sponsored Transactions (Backend + Frontend)

**File:** `app/src/hooks/useSignAndExecuteSponsoredTransaction.ts`

```typescript
import { useSignTransaction } from '@mysten/dapp-kit'
import { toBase64 } from '@mysten/sui/utils'

function useSignAndExecuteSponsoredTransaction() {
  const { mutateAsync: signTransaction } = useSignTransaction()

  const signAndExecute = async ({ transaction }: { transaction: Transaction }) => {
    // 1. Convert transaction to bytes
    transaction.setSenderIfNotSet(account.address)
    const transactionBytes = await transaction.build({
      client: suiClient
    })

    // 2. Request sponsorship from backend
    const sponsorResponse = await fetch('/api/sponsor/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionKindBytes: toBase64(transactionBytes),
        sender: account.address,
      }),
    })

    const { sponsoredTransaction } = await sponsorResponse.json()

    // 3. Sign the sponsored transaction
    const { signature } = await signTransaction({
      transaction: Transaction.from(sponsoredTransaction),
    })

    // 4. Execute on backend
    const executeResponse = await fetch('/api/sponsor/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sponsoredTransaction,
        signature,
      }),
    })

    const result = await executeResponse.json()
    return { digest: result.digest }
  }

  return { signAndExecuteSponsoredTransaction: signAndExecute }
}
```

### Pattern 6: Personal Message Signing (Session Keys)

**File:** `app/src/contexts/SealContext.tsx`

```typescript
import { useSignPersonalMessage } from '@mysten/dapp-kit'
import { SessionKey } from '@mysten/seal'

function useSealSessionKey() {
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage()
  const account = useCurrentAccount()
  const suiClient = useSuiClient()

  const createSessionKey = async () => {
    // 1. Create unsigned session key
    const sessionKey = await SessionKey.create({
      address: account.address,
      packageId: MESSAGING_PACKAGE_ID,
      ttlMin: 30, // 30 minute TTL
      suiClient,
    })

    // 2. Get message to sign
    const message = sessionKey.getPersonalMessage()

    // 3. Sign with wallet
    const { signature } = await signPersonalMessage({
      message: new TextEncoder().encode(message)
    })

    // 4. Set signature on session key
    await sessionKey.setPersonalMessageSignature(signature)

    return sessionKey
  }

  return { createSessionKey }
}
```

---

## Query Patterns

### Pattern 7: Single Object Queries

**File:** `app/src/helpers/getChannelById.ts`

```typescript
import { SuiClient } from '@mysten/sui/client'

async function getChannelById(
  suiClient: SuiClient,
  channelId: string
) {
  const response = await suiClient.getObject({
    id: channelId,
    options: {
      showContent: true,
      showOwner: true,
      showType: true,
      showStorageRebate: true,
    }
  })

  if (response.error) {
    throw new Error(`Failed to fetch channel: ${response.error.code}`)
  }

  return response.data
}
```

### Pattern 8: Multi-Object Queries with Batching

**File:** `app/src/helpers/multiGetObjectsExhaustive.ts`

```typescript
import { SuiClient } from '@mysten/sui/client'

const PAGINATION_LIMIT = 50 // Mysten RPC limit

async function multiGetObjectsExhaustive(
  suiClient: SuiClient,
  objectIds: string[]
): Promise<SuiObjectResponse[]> {
  // Split into batches to respect RPC limits
  const batches = []
  for (let i = 0; i < objectIds.length; i += PAGINATION_LIMIT) {
    batches.push(objectIds.slice(i, i + PAGINATION_LIMIT))
  }

  // Fetch all batches concurrently
  const results = await Promise.all(
    batches.map(batch =>
      suiClient.multiGetObjects({
        ids: batch,
        options: {
          showContent: true,
          showOwner: true,
          showType: true,
        }
      })
    )
  )

  // Flatten results
  return results.flat()
}
```

### Pattern 9: Paginated Queries with Cursor

**File:** `app/src/helpers/getOwnedObjectsExhaustive.ts`

```typescript
import { SuiClient } from '@mysten/sui/client'

async function getOwnedObjectsExhaustive(
  suiClient: SuiClient,
  owner: string,
  structType: string
) {
  const allObjects = []
  let cursor: string | null | undefined = null
  let hasNextPage = true

  while (hasNextPage) {
    const response = await suiClient.getOwnedObjects({
      owner,
      filter: {
        StructType: structType,
      },
      options: {
        showContent: true,
        showType: true,
      },
      cursor,
      limit: 50,
    })

    allObjects.push(...response.data)

    hasNextPage = response.hasNextPage
    cursor = response.nextCursor
  }

  return allObjects
}
```

### Pattern 10: Dynamic Field Queries

**File:** `app/src/hooks/useSuinsData.tsx`

```typescript
import { deriveDynamicFieldID } from '@mysten/sui/utils'
import { bcs } from '@mysten/sui/bcs'

async function getAvatarDynamicField(
  suiClient: SuiClient,
  nameObjectId: string
) {
  // 1. Derive dynamic field ID
  const fieldId = deriveDynamicFieldID(
    nameObjectId,
    bcs.string(),
    'avatar'
  )

  // 2. Query dynamic field object
  const avatarField = await suiClient.getDynamicFieldObject({
    parentId: nameObjectId,
    name: {
      type: 'string',
      value: 'avatar',
    }
  })

  return avatarField
}
```

---

## Advanced Patterns

### Pattern 11: Client Extension System

**File:** `app/src/contexts/MessagingClientProvider.tsx`

```typescript
import { SuiClient } from '@mysten/sui/client'
import { SealClient } from '@mysten/seal'
import { SuiStackMessagingClient } from '@suistack/messaging'

function useExtendedClient(sessionKey: SessionKey | null) {
  const baseSuiClient = useSuiClient()

  const extendedClient = useMemo(() => {
    // 1. Start with base Sui client
    let client = baseSuiClient

    // 2. Extend with SealClient (required for encryption)
    client = client.$extend(
      SealClient.asClientExtension({
        suiClient: baseSuiClient,
        serverConfigs: SEAL_SERVER_CONFIGS,
        verifyKeyServers: false,
        ...(sessionKey && { sessionKey }),
      })
    )

    // 3. Extend with MessagingClient
    if (sessionKey) {
      client = client.$extend(
        SuiStackMessagingClient.experimental_asClientExtension({
          packageConfig: MESSAGING_PACKAGE_CONFIG,
          sessionKey,
          storage: new WalrusStorageAdapter(client, WALRUS_CONFIG),
        })
      )
    }

    return client
  }, [baseSuiClient, sessionKey])

  // Access via: extendedClient.core, extendedClient.seal, extendedClient.messaging
  return extendedClient
}
```

### Pattern 12: Message Decryption with Caching

**File:** `app/src/hooks/useDecryptMessage.ts`

```typescript
import { useMessagingClient } from '@/contexts/MessagingClientProvider'

function useDecryptMessage({
  message,
  channelId,
  memberCapId,
  encryptedKey,
}: {
  message: EncryptedMessage
  channelId: string
  memberCapId: string
  encryptedKey: string
}) {
  const messagingClient = useMessagingClient()

  return useQuery({
    queryKey: ['decrypt-message', message.id, channelId],
    queryFn: async () => {
      const decrypted = await messagingClient.decryptMessage({
        message,
        channelId,
        memberCapId,
        encryptedKey,
      })
      return decrypted
    },
    enabled: !!message && !!messagingClient,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

### Pattern 13: SuiNS Client Integration

**File:** `app/src/contexts/SuinsProvider.tsx`

```typescript
import { SuinsClient } from '@mysten/suins'
import { useSuiClient, useSuiClientContext } from '@mysten/dapp-kit'

function SuinsProvider({ children }: { children: React.ReactNode }) {
  const suiClient = useSuiClient()
  const { network } = useSuiClientContext()

  const suinsClient = useMemo(() => {
    return new SuinsClient({
      client: suiClient,
      network: network === 'mainnet' ? 'mainnet' : 'testnet',
    })
  }, [suiClient, network])

  return (
    <SuinsContext.Provider value={suinsClient}>
      {children}
    </SuinsContext.Provider>
  )
}

// Usage
function useResolveName(address: string) {
  const suinsClient = useContext(SuinsContext)

  return useQuery({
    queryKey: ['suins-name', address],
    queryFn: () => suinsClient.getName(address),
  })
}
```

---

## Best Practices

### 1. Use React Query for All Async Operations

```typescript
// Good: Cacheable, refetchable, with loading states
const { data, isLoading, error } = useQuery({
  queryKey: ['channel', channelId],
  queryFn: () => fetchChannel(channelId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Avoid: Direct async calls in useEffect
useEffect(() => {
  fetchChannel(channelId).then(setChannel) // Bad pattern
}, [channelId])
```

### 2. Batch Multi-Object Queries

```typescript
// Good: Single batched call
const objects = await multiGetObjectsExhaustive(suiClient, objectIds)

// Avoid: Multiple individual calls
const objects = await Promise.all(
  objectIds.map(id => suiClient.getObject({ id })) // Inefficient
)
```

### 3. Use Client Extensions for Composability

```typescript
// Good: Composable, type-safe extensions
const client = suiClient
  .$extend(SealClient.asClientExtension({ ... }))
  .$extend(MessagingClient.experimental_asClientExtension({ ... }))

// Access specific client: client.messaging.sendMessage(...)
```

### 4. Handle Session Key Lifecycle Properly

```typescript
// Store in React context or state
const [sessionKey, setSessionKey] = useState<SessionKey | null>(null)

// Create on mount if expired
useEffect(() => {
  if (!sessionKey || sessionKey.isExpired()) {
    createNewSessionKey().then(setSessionKey)
  }
}, [sessionKey])
```

### 5. Use Sponsored Transactions for UX

```typescript
// Good: Backend sponsors gas fees
const { digest } = await signAndExecuteSponsoredTransaction({ transaction })

// Alternative: User pays gas (worse UX for onboarding)
const { digest } = await signAndExecuteTransaction({ transaction })
```

### 6. Invalidate Queries After Mutations

```typescript
const mutation = useMutation({
  mutationFn: sendMessage,
  onSuccess: () => {
    // Refresh related data
    queryClient.invalidateQueries({ queryKey: ['messages', channelId] })
    queryClient.invalidateQueries({ queryKey: ['channels'] })
  }
})
```

### 7. Type Guard for Move Objects

```typescript
function isChannelObject(obj: SuiObjectResponse): obj is SuiObjectResponse & {
  data: {
    content: {
      dataType: 'moveObject'
      fields: ChannelFields
    }
  }
} {
  return (
    obj.data?.content?.dataType === 'moveObject' &&
    obj.data.type?.includes('::channel::Channel')
  )
}
```

### 8. Use Environment Variables for Configuration

```typescript
// .env.local
NEXT_PUBLIC_SUI_NETWORK=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_MESSAGING_PACKAGE_ID=0xabc123...
NEXT_PUBLIC_ENOKI_API_KEY=enoki_public_...
WALRUS_PUBLISHER=https://publisher.walrus.site
WALRUS_AGGREGATOR=https://aggregator.walrus.site

// Usage
const config = {
  network: process.env.NEXT_PUBLIC_SUI_NETWORK!,
  packageId: process.env.NEXT_PUBLIC_MESSAGING_PACKAGE_ID!,
}
```

---

## Summary

This guide demonstrates production-ready patterns for:
- **Provider setup** with dApp Kit, Enoki, and custom extensions
- **Wallet integration** using hooks like `useCurrentAccount`, `useSignTransaction`
- **Transaction building** with `Transaction` object and sponsored flows
- **Efficient querying** with batching, pagination, and caching
- **Advanced features** like client extensions, encryption, and domain names

The key to successful Sui dApp development is:
1. Leverage React Query for all async operations
2. Use dApp Kit hooks for wallet/account management
3. Batch RPC calls to respect rate limits
4. Extend clients for composable functionality
5. Cache aggressively with proper invalidation

For more examples, see the source files referenced throughout this guide.
