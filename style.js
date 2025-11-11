import chalk from "chalk";

export const title = (text) => chalk.bold.cyanBright(text);
export const prompt = (text) => chalk.cyan(text);
export const info = (text) => chalk.gray(text);
export const step = (text) => chalk.yellow("⚙️  " + text);
export const success = (text) => chalk.greenBright("✅ " + text);
export const error = (text) => chalk.redBright("❌ " + text);
export const done = (text) => chalk.green("✨ " + text);
export const folder = (text) => chalk.magenta("📁 " + text);
export const box = (text) => chalk.blueBright.bold(text);
