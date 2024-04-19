import {JsonRpcProvider, Network, parseEther, Wallet} from 'ethers'
import {c, RandomHelpers} from '../utils/helpers'
import {exchangeConfig, MainnetBridgeConfig} from '../../config'
import {getBalance, waitBalance} from '../periphery/web3Client'
import {chains, withdrawNetworks} from '../utils/constants'
import {ChainName} from '../utils/types'
import {withdraw} from '../periphery/exchange'
import {bridgeRelay} from '../periphery/relayBridge'
import {bridgeToScroll} from './mainBridge'
import {getChainsWithSufficientBalance} from '../periphery/utils'

async function mainnetBridge(signer: Wallet) {
    let needWithdraw = true
    let needBridge = true
    let leastToWithdraw = parseEther(exchangeConfig.toWithdraw.from.toString())
    let targetChain: ChainName = RandomHelpers.getRandomElementFromArray(MainnetBridgeConfig.targetChains)
    if (targetChain == 'Ethereum') {
        needBridge = false
    }
    let ethProvider = new JsonRpcProvider(RandomHelpers.getRandomElementFromArray(chains.Ethereum.rpc), new Network('Ethereum', 1), {
        staticNetwork: true
    })
    let targetProvider = new JsonRpcProvider(
        RandomHelpers.getRandomElementFromArray(chains[targetChain].rpc),
        new Network(targetChain, chains[targetChain].id),
        {staticNetwork: true}
    )

    let nonzeroNetworks = await getChainsWithSufficientBalance(
        MainnetBridgeConfig.targetChains,
        signer.address,
        parseEther(exchangeConfig.toWithdraw.from.toString()) - parseEther(RandomHelpers.getRandomNumber({from: 0.00003, to: 0.00005}).toString())
    )
    if (nonzeroNetworks.length > 0) {
        targetChain = RandomHelpers.getRandomElementFromArray(nonzeroNetworks)
        console.log(c.yellow(`found enough native in ${targetChain}`))
    }

    console.log(c.underline(`need withdraw to ${targetChain}: ${needWithdraw} need bridge: ${needBridge}`))

    let ethBalance = await getBalance(signer.connect(ethProvider), signer.address)
    let targetBalance = await getBalance(signer.connect(targetProvider), signer.address)

    if (ethBalance >= (leastToWithdraw * 95n) / 100n) {
        needWithdraw = false
        needBridge = false
    }
    if (targetBalance >= leastToWithdraw) {
        needWithdraw = false
    }

    let withdrawAmount = 0
    if (needWithdraw) {
        let result = await withdraw(signer.address, exchangeConfig.toWithdraw, chains[targetChain].currency, withdrawNetworks[targetChain].name)
        withdrawAmount = result.amount
        await waitBalance(targetProvider, signer.address, targetBalance)
    }
    if (needBridge) {
        let toBridge
        if (!needWithdraw) {
            toBridge = targetBalance - parseEther(RandomHelpers.getRandomNumber({from: 0.00003, to: 0.00005}).toString())
        } else {
            toBridge = parseEther(withdrawAmount.toString()) - parseEther(RandomHelpers.getRandomNumber({from: 0.00003, to: 0.00005}).toString())
        }
        let result = await bridgeRelay(signer.connect(targetProvider), chains[targetChain].currency, targetChain, 'Ethereum', toBridge)
        console.log(c.green(`bridged successfully ${chains[targetChain].explorer + result}`))

        await waitBalance(ethProvider, signer.address, ethBalance)
    }

    let hash = await bridgeToScroll(signer.connect(ethProvider), MainnetBridgeConfig.toLeaveEthereum)
    console.log(c.green(`bridged successfully ${chains.Ethereum.explorer + hash}`))
    return true
}

export {mainnetBridge}
