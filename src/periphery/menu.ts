import select from '@inquirer/select'

class Menu {
    async chooseTask() {
        const questions = {
            name: 'mode',
            type: 'list',
            message: `Choose task`,
            choices: [
                {
                    name: `Mainnet bridge (Ethereum -> Scroll)`,
                    value: 'Mainnet bridge'
                }
            ],
            default: 'Mainnet bridge',
            loop: true
        }
        const answers = await select(questions)
        console.log(answers)
        return answers
    }
}

export const menu = new Menu()