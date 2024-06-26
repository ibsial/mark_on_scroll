import {JsonRpcProvider, Wallet} from 'ethers'
import {goodGwei, shuffleWallets, sleepBetweenAccs} from './config'
import {menu} from './src/periphery/menu'
import {c, defaultSleep, delayedPrint, importAndValidatePrivateData, importPrivateData, RandomHelpers, sleep, writeToFile} from './src/utils/helpers'
import {mainnetBridge} from './src/core/runner'
import {telegram} from './src/periphery/telegram'
import { waitGwei } from './src/periphery/web3Client'

async function main() {
    let scenario = await menu.chooseTask()
    await delayedPrint(c.bgMagenta(`Keep on scrolling @findmeonchain channel...\n`))

    switch (scenario) {
        case 'Mainnet bridge':
            let [keys, addresses] = await importAndValidatePrivateData('./privates.txt', false)
            let pairs: string[][] = []
            for (let i = 0; i < keys.length; i++) {
                pairs.push([keys[i], addresses[i]])
            }
            if (shuffleWallets) {
                pairs = RandomHelpers.shuffleArray(pairs)
                let paste = ''
                let j = 1
                for (let pair of pairs) {
                    paste += pair[0] + ',' + pair[1] + (j == pairs.length ? '' : '\n')
                    j++
                }
                writeToFile('./privates.txt', paste)
                await defaultSleep(2, false)
            }
            for (let i = 0; i < pairs.length; i++) {
                let signer = new Wallet(pairs[i][0])
                console.log(c.cyan(`#${i + 1}/${pairs.length} ${signer.address} | ${scenario}`))
                let success = false
                try {
                    await waitGwei(goodGwei)
                    telegram.addMessage(`#${i + 1}/${pairs.length} ${signer.address}`)
                    await mainnetBridge(signer)
                    success = true
                } catch (e: any) {
                    console.log(c.red(`#${i + 1}/${pairs.length} ${signer.address} failed...`))
                    console.log(e?.message)
                    telegram.addMessage(telegram.symbols('fail') + `something went wrong: \n` + telegram.applyFormatting(e?.message, 'monospace'))
                }
                if (success) {
                    telegram.sendMessage()
                    await sleep(RandomHelpers.getRandomNumber(sleepBetweenAccs))
                }
                telegram.message = ''
            }
            break
    }
}

main()
