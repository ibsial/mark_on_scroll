import {Wallet} from 'ethers'
import {shuffleWallets, sleepBetweenAccs} from './config'
import {menu} from './src/periphery/menu'
import {c, defaultSleep, importAndValidatePrivateData, importPrivateData, RandomHelpers, sleep, writeToFile} from './src/utils/helpers'
import {mainnetBridge} from './src/core/runner'

async function main() {
    let scenario = await menu.chooseTask()

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
                for (let pair of pairs) {
                    paste += pair[0] + ',' + pair[1] ?? '' + '\n'
                }
                writeToFile('./privates.txt', paste)
                await defaultSleep(2, false)
            }
            for (let i = 0; i < pairs.length; i++) {
                let signer = new Wallet(pairs[i][0])
                console.log(c.cyan(`#${i + 1}/${pairs.length} ${signer.address} | ${scenario}`))
                let success = false
                try {
                    await mainnetBridge(signer)
                    success = true
                } catch (e: any) {
                    console.log(c.red(`#${i + 1}/${pairs.length} ${signer.address} failed...`))
                    console.log(e?.message)
                }
                if (success) {
                    await sleep(RandomHelpers.getRandomNumber(sleepBetweenAccs))
                }
            }
            break
    }
}

main()
