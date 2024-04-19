export declare type FeeType = {maxFeePerGas: bigint; maxPriorityFeePerGas: bigint} | {gasPrice: bigint}

export declare type Chain = {
    id: string
    lzId: string
    rpc: string[]
    explorer: string
    currency: string
    tokens: {
        [key: string]: {
            name: string
            decimals: bigint
            address: string
        }
    }
}

export declare type ChainName =
    | 'Ethereum'
    | 'Arbitrum'
    | 'Optimism'
    | 'Base'
    | 'Linea'
    | 'Zksync'
    | 'Bcs'
    | 'OpBnb'
    | 'Polygon'
    | 'Avalanche'
    | 'Scroll'
    | 'Mantle'
    | string

export declare type MainnetBridgeConfigType = {
    toLeaveEthereum: {from: number, to: number}, // YES! Zero is possible!
    targetChains: ChainName[], // 'Arbitrum' | 'Optimism' | 'Linea' | 'Base' | 'Ethereum'

    // setup withdraw/bridge amount in exchangeConfig

    toLeaveTarget: {[key: ChainName]: {from: number, to: number},
    }
}