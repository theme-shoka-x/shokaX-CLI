import shell from 'shelljs'
import { logger } from 'hexo-log'
import fs from 'fs'

const versionUtil = '0.0.1'
const hexoLog = logger()

// Install Package / 通过包管理器安装包
const addPackage = (pm: string, packageName: string): boolean => {
  if (pm === 'npm') {
    pm = 'npm install'
  } else {
    pm = pm + ' add'
  }
  const res = shell.exec(`${pm} ${packageName}`)
  if (res.code !== 0) {
    hexoLog.error(`${packageName} not installed`)
    throw Error(`${packageName} not installed`)
  }
  hexoLog.info(`${packageName} installed`)
  return true
}

const installNeedPakcages = (preList:[boolean, string]) => {
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
}

// Prepare to check / 主题安装前的预检
const prepareTheme = (pm: string): [boolean, string] => {
  if (!shell.which('git')) {
    hexoLog.error('The program need git')
    return [false, '']
  }
  if (pm === 'auto') {
    hexoLog.info('Looking for packageManager...')
    if (fs.existsSync('pnpm-lock.yml') || fs.existsSync('pnpm-lock.yaml') || fs.existsSync('enable_pnpm')) {
      return [true, 'pnpm']
    }
    if (fs.existsSync('yarn.lock') || fs.existsSync('.yarnrc.yml')) {
      return [true, 'yarn']
    } else {
      return [true, 'npm']
    }
  } else {
    return [true, pm]
  }
}

// Install theme / 安装主题
const installTheme = (theme: string, repo: 'github' | 'gitee' | 'npm', pm: string, extra?: string[]) => {
  const origin = repo === 'github' ? 'https://github.com/zkz098/hexo-theme-shokaX.git' : 'https://gitee.com/zkz0/hexo-theme-shokaX.git'
  const preList = prepareTheme(pm)
  if (!preList[0]) {
    hexoLog.error('Install theme failed: prepare was failed')
    process.exit(1)
  }
  hexoLog.info(`Using package manager: ${preList[1]}`)
  if (repo === 'npm') {
    addPackage(preList[1], 'hexo-theme-shokax')
  } else {
    if (shell.exec(`git clone --depth=1 ${origin} ./themes/shokaX`).code !== 0) {
      hexoLog.error('Install theme failed: git clone error')
      process.exit(1)
    }
  }
  hexoLog.info('Waiting for package manager...')
  installNeedPakcages(preList)
  if (typeof extra !== 'undefined') {
    hexoLog.info('Installing extra packages...')
    extra.forEach((item) => {
      addPackage(preList[1], item)
    })
  }
  // 最后的提示
  hexoLog.info('Please change the config to enable shokaX.')
  hexoLog.info(`
    step1: open _config.yml and change theme: 'theme: shokaX'
    step2: name the _config.landscape.yml to _config.shokaX.yml`
  )
}

// 修复主题
const repairTheme = (packageManager:string, part:'all'|'packages'|'files') => {
  const preList = prepareTheme(packageManager)
  if (!preList[0]) {
    hexoLog.error('Install theme failed: prepare was failed')
    process.exit(1)
  }
  if (part !== 'files') {
    hexoLog.info('Checking packages...')
    installNeedPakcages(preList)
  }
  if (part !== 'packages') {
    hexoLog.info('Checking files');
    ['_images.yml', '_config.yml', 'source/js/library.js', 'source/js/global.js',
      'source/js/page.js', 'source/js/components.js'].forEach((item) => {
      if (!fs.existsSync(`./theme/shokaX/${item}`)) {
        hexoLog.error(`path: ./theme/shokaX/${item}`)
        hexoLog.error(`Not found ${item}.Try to install theme again`)
      }
    });
    ['source/js/player.js'].forEach((item) => {
      if (!fs.existsSync(`./theme/shokaX/${item}`)) {
        hexoLog.warn(`Not found ${item}.Some feature will be unavailable`)
      }
    })
  }
}

export { versionUtil, installTheme, repairTheme }
