import chalk from "chalk";

// Colors
export const bannerColor = chalk.bold.blueBright;
export const promptColor = chalk.cyanBright;
export const successColor = chalk.greenBright;
export const errorColor = chalk.redBright;
export const infoColor = chalk.gray;
export const stepColor = chalk.yellow;

// Banner
export const showBanner = () => {
  console.log(bannerColor("╔══════════════════════════════════════════════════════╗"));
  console.log(bannerColor("║           Universal Backend Generator v4             ║"));
  console.log(bannerColor("╚══════════════════════════════════════════════════════╝"));
  console.log(chalk.gray("Create a modern Express + MongoDB backend effortlessly.\n"));
};

// Stylized text
export const prompt = (text) => promptColor(text);
export const error = (text) => errorColor(text);
export const info = (text) => infoColor(text);
export const step = (text) => stepColor(text);
export const success = (text) => successColor(text);

// Success message
export const showSuccess = (projectName) => {
  console.log(successColor(`\n🎉 Project "${projectName}" is ready!`));
  console.log(promptColor(`\nNext steps:`));
  console.log(chalk.white(`  cd ${projectName}`));
  console.log(chalk.white(`  npm run dev`));
  console.log(chalk.gray(`\nThen open:`), chalk.blueBright("http://localhost:3000"));
  console.log(chalk.yellowBright(`\n✨ Happy coding, builder!`));
};
