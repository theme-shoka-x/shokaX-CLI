#!/usr/bin/env node
import { Command } from 'commander'
import { versionUtil, installTheme } from './lib/util'

const versionCLI = '0.0.1'
const program = new Command()
program
  .version(`CLI: ${versionCLI} Util: ${versionUtil}`)
  .option('-r, --repo <origin>', 'origin mode(gitee/github)', 'github')
  .option('-pm, --packageManager <pm>', 'choose a packageManager to install packages', 'auto')
  .option('-m, --mode <mode>', 'standalone or theme', 'standalone')
  .command('install <theme>')
  .description('Install shoka or shokaX theme')
  .action((theme) => {
    installTheme(theme, program.opts().repo, program.opts().packageManager)
  })

program.parse(process.argv)
