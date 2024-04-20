import {MainnetBridgeConfigType} from './src/utils/types'
require('dotenv').config()

export const DEV = false

/**** GENERAL SETTINGS ****/
export const maxRetries = 3
export const shuffleWallets = true
export const sleepBetweenAccs = {from: 10 * 60, to: 20 * 60}

export const goodGwei = 30
export const gasMultiplier = {price: 1.3, limit: 1.3} // does not apply to Ethereum

export const telegramConfig = {
    need: false,
    telegramToken: '12345:adfsdfsadfa',
    telegramId: 123123
}

/******* IMPORTANT SETTINGS *******/
export const MainnetBridgeConfig: MainnetBridgeConfigType = {
    /* okx -> L2 -> |relay.link| -> Ethereum -> Scroll */
    targetChains: ['Arbitrum', 'Optimism', 'Linea', 'Base'], // 'Arbitrum' | 'Optimism' | 'Linea' | 'Base' | 'Zksync' | 'Ethereum'

    // setup withdraw/bridge amount in exchangeConfig

    notTouchEth: false, // will skip any balance checks and always withdraw and bridge the same amount
    toLeave: {
        Arbitrum: {from: 0.0025, to: 0.004},
        Optimism: {from: 0.0025, to: 0.004},
        Linea: {from: 0.0025, to: 0.004},
        Base: {from: 0.0025, to: 0.004},
        Zksync: {from: 0.01, to: 0.012},
        Ethereum: {from: 0.0025, to: 0.003}, // YES! Zero is possible!
    }
}

/********** OKX API DATA **********/
export const exchangeConfig = {
    toWithdraw: {from: 0.01, to: 0.02},
    api: {
        // dont forget about .env
        apiKey: process.env.api_key,
        secret: process.env.api_secret,
        password: process.env.api_password
    }
}
/******* MOBILE PROXY? *******/
export const changeIpLink = '' // turned off when empty
