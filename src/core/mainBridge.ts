import {parseEther, Wallet, ZeroHash} from 'ethers'
import {MainnetBridge__factory, MainnetOracle__factory} from '../../typechain'
import {addresses} from '../utils/constants'
import {bigintToPrettyStr, c, RandomHelpers, retry} from '../utils/helpers'
import {getBalance, getGwei, sendTx} from '../periphery/web3Client'

async function bridgeToScroll(signer: Wallet, toLeave: {from: number; to: number}): Promise<string> {
    return retry(
        async () => {
            const mainnetBridge = MainnetBridge__factory.connect(addresses.mainnetBridge.Ethereum, signer)
            const feeOracle = MainnetOracle__factory.connect(addresses.mainnetOracle.Ethereum, signer)

            let amountToLeave = parseEther(RandomHelpers.getRandomNumber(toLeave).toString())
            let balance = await getBalance(signer, signer.address)
            let gasLimit = 150_000n
            let {gasPrice} = await getGwei(signer, 1.15)
            let txCost = gasLimit * gasPrice
            let bridgeCost = await feeOracle.estimateCrossDomainMessageFee(168_000n)
            let valueToBridge = balance - amountToLeave - txCost - bridgeCost
            if (valueToBridge >= balance) {
                throw new Error("Not enough balance in Ethereum")
            }
            let tx = {
                from: signer.address,
                to: await mainnetBridge.getAddress(),
                data: mainnetBridge.interface.encodeFunctionData('sendMessage(address,uint256,bytes,uint256)', [
                    signer.address,
                    valueToBridge,
                    ZeroHash,
                    168_000n
                ]),
                value: valueToBridge + bridgeCost,
                gasLimit: RandomHelpers.getRandomBigInt({from: 145_000n, to: 150_000n})
            }
            console.log(c.yellow(`bridging ${bigintToPrettyStr(valueToBridge)} from Ethereum to Scroll`))
            let hash = await sendTx(signer, tx, {price: 1.1, limit: 1}, true)
            return hash
        },
        {maxRetryCount: 3, retryInterval: 10}
    )
}

export {bridgeToScroll}
