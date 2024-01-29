import shell from 'shelljs'
import { logger } from 'hexo-log'
import fs from 'fs'
import zlib from 'zlib'
import path from 'path'

const versionUtil = '0.2.2'
const hexoLog = logger()
const collocSet = {
  recommend: [
    'hexo-indexnow',
    'hexo-deployer-git',
    'hexo-generator-baidu-sitemap'
  ]
}

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
  shell.exec(`${removePm} hexo-renderer-marked`)
  try {
    addPackage(preList[1], 'hexo-renderer-multi-next-markdown-it')
  } catch (e) {
    hexoLog.info('Try install markdown renderer without scripts')
    try {
      addPackage(preList[1], 'hexo-renderer-multi-next-markdown-it --ignore-scripts')
    } catch (e) {
      throw Error('Failed to install markdown renderer without scripts')
    }
  }
  ['hexo-lightning-minify', 'hexo-autoprefixer', 'hexo-algoliasearch', 'hexo-feed', 'hexo-renderer-pug',
    'esbuild', 'theme-shokax-pjax', 'theme-shokax-anime', 'unlazy', 'mouse-firework']
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

const getGithubProgarm = async () => {
  const res = await fetch('https://api.github.com/repos/theme-shoka-x/hexo-theme-shokaX/actions/workflows/build-theme.yml/runs')
  const data = await res.json()
  const latestRunId = data.workflow_runs[0].id
  const arts = await fetch(`https://api.github.com/repos/theme-shoka-x/hexo-theme-shokaX/actions/runs/${latestRunId}/artifacts`)
  const dataArts:{
    artifacts: Array<{
      archive_download_url:string
    }>} = await arts.json()

  const dataUrl = dataArts.artifacts.map((artifact) => artifact.archive_download_url)[0]

  // 下载ZIP文件
  const zipRes = await fetch(dataUrl)
  const zipBuffer = await zipRes.arrayBuffer()

  // 解压ZIP文件
  const extractPath = path.join('./themes/shokaX')

  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true })
  }

  const unzipStream = zlib.createUnzip()
  const writeStream = fs.createWriteStream(extractPath)

  await new Promise((resolve, reject) => {
    unzipStream.on('error', reject)
    writeStream.on('error', reject)
    writeStream.on('close', resolve)
    unzipStream.pipe(writeStream)
    unzipStream.end(zipBuffer)
  })

  hexoLog.info('ZIP file downloaded and extracted successfully.')
}
// Install theme / 安装主题
const installTheme = (theme: string, repo: 'github' | 'gitee' | 'npm', pm: string,
  extra?: string[], collocation?: 'recommend') => {
  const origin = ''
  const preList = prepareTheme(pm)
  if (repo === 'github') {
    getGithubProgarm().then(() => {
      installNeedPakcages(preList)
      hexoLog.info('Please change the config to enable shokaX.')
      hexoLog.info(`
    step1: open _config.yml and change theme: 'theme: shokaX or shokax(if install by npm)'
    step2: name the _config.landscape.yml to _config.shokaX.yml`
      )
    })
  }
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

  if (typeof collocation !== 'undefined') {
    hexoLog.info(`Installing collocation ${collocation}`)
    collocSet[collocation].forEach((item) => {
      addPackage(preList[1], item)
    })
  }
  // 最后的提示
  hexoLog.info('Please change the config to enable shokaX.')
  hexoLog.info(`
    step1: open _config.yml and change theme: 'theme: shokaX or shokax(if install by npm)'
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
}

export { versionUtil, installTheme, repairTheme }
