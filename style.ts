import chalk, { Chalk, ChalkInstance } from "chalk";

const chalkInstance = new Chalk ( { level: 1 } )

export interface Theme
{
    readonly info: ChalkInstance
    readonly warning: ChalkInstance
    readonly error: ChalkInstance
}

export const DefaultTheme: Theme = {
    info: chalkInstance.blue,
    warning: chalkInstance.yellow,
    error: chalkInstance.red,
}

let theme: Theme = DefaultTheme

export default theme
