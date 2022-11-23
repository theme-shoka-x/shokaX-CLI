import shell from 'shelljs'
import { logger } from 'hexo-log'
import fs from 'fs'

const versionUtil = '0.0.1'
const hexoLog = logger()
const addPackage = (pm:string, packageName:string):boolean => {
  if (pm === 'npm') {
    pm = 'npm install'
  } else {
    pm = pm + ' add'
  }
  const res = shell.exec(`${pm} ${packageName}`)
  if (res.code !== 0) {
    hexoLog.error(`${packageName} not installed`)
    return false
  }
  hexoLog.info(`${packageName} installed`)
  return true
}

const prepareTheme = (pm:string):[boolean, string] => {
  if (!shell.which('git')) {
    hexoLog.error('The program need git')
    return [false, '']
  }
  if (pm === 'auto') {
    hexoLog.info('Looking for packageManager...')
    if (fs.existsSync('pnpm-lock.yml') || fs.existsSync('pnpm-lock.yaml') || fs.existsSync('enable_pnpm')) {
      return [true, 'pnpm']
    } if (fs.existsSync('yarn.lock') || fs.existsSync('.yarnrc.yml')) {
      return [true, 'yarn']
    } else {
      return [true, 'npm']
    }
  } else {
    return [true, pm]
  }
}

const installTheme = (theme:string, repo:'github'|'gitee', pm:string) => {
  const origin = repo === 'github' ? 'https://github.com/zkz098/hexo-theme-shokaX.git' : 'https://gitee.com/zkz0/hexo-theme-shokaX.git'
  const preList = prepareTheme(pm)
  if (!preList[0]) {
    hexoLog.error('Install theme failed: prepare was failed')
    process.exit(1)
  }
  hexoLog.info(`Using package manager: ${preList[1]}`)
  if (shell.exec(`git clone --depth=1 ${origin} ./themes/shokaX`).code !== 0) {
    hexoLog.error('Install theme failed: git clone error')
    process.exit(1)
  }
  hexoLog.info('Waiting for package manager...')
  let removePm
  if (preList[1] === 'npm') {
    removePm = 'npm uninstall'
  } else {
    removePm = preList[1] + ' remove'
  }
  shell.exec(`${removePm} hexo-renderer-marked`);
  ['hexo-renderer-multi-next-markdown-it', 'hexo-autoprefixer', 'hexo-algoliasearch', 'hexo-feed', 'hexo-renderer-pug']
    .forEach((item) => {
      addPackage(preList[1], item)
    })
  // 最后的提示
  hexoLog.info('Please change the config to enable shokaX.')
  hexoLog.info(
    `step1: open _config.yml and change theme: 'theme: shokaX.'
    step2: name the _config.landscape.yml to _config.shokaX.yml`
  )
}

export { versionUtil, installTheme }
