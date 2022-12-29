#!/usr/bin/env node
import { Command } from 'commander'
import { versionUtil, installTheme, repairTheme } from './lib/util'

const versionCLI = '0.0.1'
const program = new Command()
program
  .version(`
    shokaX-CLI (shokaX 0.x ver.)
    CLI: ${versionCLI} Util: ${versionUtil}
    `)
  .command('install <theme>')
  .option('-r, --repo <origin>', 'origin mode(gitee/github/npm)', 'npm')
  .option('-pm, --packageManager <packageManager>', 'choose a packageManager to install packages', 'auto')
  .option('-expack, --extraPackages <...packages> ', 'Install some extra packages')
  .description('Install shoka or shokaX theme')
  .action(function (theme, options) {
    installTheme(theme, options.repo, options.packageManager, options.extraPackages)
  })

program
  .command('repair')
  .option('-pm, --packageManager <packageManager>', 'choose a packageManager to install packages', 'auto')
  .option('-p, --part <part>', 'Fix parts (all/packages/files)', 'all')
  .description('Repair the theme to solve problems')
  .action(function (options) {
    repairTheme(options.packageManager, options.part)
  })
program.parse()
