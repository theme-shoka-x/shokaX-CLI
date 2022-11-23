import shell from 'shelljs'
import { logger } from 'hexo-log'
import fs from 'fs'

const versionUtil = '0.0.1'
const hexoLog = logger()

const prepare = (pm:string):[boolean, string] => {
  if (!shell.which('git')) {
    hexoLog.error('The program need git')
    return [false, '']
  }
  if (pm === 'auto') {
    hexoLog.info('Looking for packageManager...')
    if (fs.existsSync('pnpm-lock.yml') || fs.existsSync('pnpm-lock.yaml')) {
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
  const origin = repo === 'github' ? 'https://github.com/zkz098/hexo-theme-shokaX.git' : 'https://github.com/zkz098/hexo-theme-shokaX.git1'
  const preList = prepare(pm)
  if (!preList[0]) {
    hexoLog.error('Install theme failed,because prepare was failed')
    process.exit(1)
  }
}

export { versionUtil, installTheme }
