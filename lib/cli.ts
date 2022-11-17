import { Command } from 'commander'

const program = new Command()
program
  .option('-r, --repo <origin>', 'origin mode(gitee/github)')
  .option('-pm, --packageManager <pm>', 'choose a packageManager to install packages')
  .option('-m, --mode <mode>', 'standalone or theme')
