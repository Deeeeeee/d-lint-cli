#! /usr/bin/env node

// #! 符号的名称叫 Shebang，用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头
// 如果是Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// 具体就是通过 chmod 755 cli.js 实现修改

const fs = require('fs')
const exec = require('child_process').exec
const path = require("path")
const inquirer = require('inquirer')

const setColor = (type, text) => {
  const color = {
    default: '\x1B[0m', // 默认
    bright: '\x1B[1m', // 亮色
    grey: '\x1B[2m', // 灰色
    italic: '\x1B[3m', // 斜体
    underline: '\x1B[4m', // 下划线
    reverse: '\x1B[7m', // 反向
    hidden: '\x1B[8m', // 隐藏
    black: '\x1B[30m', // 黑色
    red: '\x1B[31m', // 红色
    green: '\x1B[32m', // 绿色
    yellow: '\x1B[33m', // 黄色
    blue: '\x1B[34m', // 蓝色
    magenta: '\x1B[35m', // 品红
    cyan: '\x1B[36m', // 青色
    white: '\x1B[37m', // 白色
    blackBG: '\x1B[40m', // 背景色为黑色
    redBG: '\x1B[41m', // 背景色为红色
    greenBG: '\x1B[42m', // 背景色为绿色
    yellowBG: '\x1B[43m', // 背景色为黄色
    blueBG: '\x1B[44m', // 背景色为蓝色
    magentaBG: '\x1B[45m', // 背景色为品红
    cyanBG: '\x1B[46m', // 背景色为青色
    whiteBG: '\x1B[47m' // 背景色为白色
  }
  return color[type] + text + color.default
}
const log = {
  default(txt){
    console.log(txt)
  },
  primary(txt){
    console.log(setColor('blue', txt))
  },
  success(txt){
    console.log(setColor('green', txt))
  },
  success(txt){
    console.log(setColor('green', txt))
  },
  warning(txt){
    console.log(setColor('yellow', txt))
  },
  error(txt){
    console.log(setColor('red', txt))
  }
}

const questions = [
  {
    type: 'list',
    name: 'npm_type',
    message: '请选择npm包安装工具',
    default: 'npm',
    loop: false,
    choices: [
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' },
      { name: 'cnpm', value: 'cnpm' },
      { name: 'pnpm', value: 'pnpm' },
    ]        
  },
  {
    type: 'confirm',
    name: 'is_commit_msg_hook', // key 名
    message: '是否添加commit-msg hook校验（自定义）', // 提示信息
    default: false // 默认值
  }
]

const init = async () => {

  const answers = await inquirer.prompt(questions)


  log.primary('> 依赖包安装 开始 ...')
  await new Promise((resolve, reject) => {
    let cmd = ''
    if(answers.npm_type === 'yarn'){
      cmd = 'yarn add'
    }else{
      cmd = answers.npm_type + ' install'
    }
    exec(cmd + ' husky@8.0.0 lint-staged@13.0.3 -D', (err, stdout, stderr) => {
      if (err) {
        log.error(err)
        log.error('> 依赖包安装 失败!')
        reject(err)
      } else {
      // console.log(stdout);
        log.success('> 依赖包安装 成功!')
        resolve()
      }
    })
  })
  log.primary('> husky-init 开始')
  await new Promise((resolve, reject) => {
    exec('npx husky-init', (err, stdout, stderr) => {
      if (err) {
        log.error(err)
        log.error('> husky-init 失败！')
        reject(err)
      } else {
        log.success('> husky-init 成功！')
        resolve()
      }
    })
  })
  // 修改 husky/pre-commit
  log.primary('> 修改 husky/pre-commit 开始')
  const preCommitFileContent = '#!/bin/sh \n . "$(dirname -- "$0")/_/husky.sh" \n\n npx lint-staged'
  fs.writeFileSync('./.husky/pre-commit', preCommitFileContent)
  log.success('> 修改 husky/pre-commit 成功！')


  // 修改package.json 添加lint-staged 配置
  log.primary('> 修改package.json 添加lint-staged配置 开始')
  let packages = fs.readFileSync('./package.json')
  packages = JSON.parse(packages.toString())
  packages['lint-staged'] = {
    '**/*.{js,jsx,ts,tsx,vue}': [
      'eslint --fix',
      'git add .'
    ]
  }
  const str = JSON.stringify(packages, null, '\t')
  fs.writeFileSync('./package.json', str)
  log.success('> 修改package.json 添加lint-staged配置 成功！')


  if(answers.is_commit_msg_hook){
    // 添加commit-msg hook
    log.primary('> 添加git-hook: commit-msg 开始')
    try {
      const temp = fs.readFileSync( path.join(__dirname, '../temp/commit-msg.tpl')).toString()
      // exec('npx husky add .husky/commit-msg "npm test"')
      fs.writeFileSync('.husky/commit-msg', temp)
      exec('chmod +x .husky/commit-msg') // 为避免“因为没有将钩子 '.husky/commit-msg' 设置为可执行，钩子被忽略”的报错BUG
      log.success('> 添加git-hook: commit-msg 成功！')

    } catch (e) {
      log.error(e)
      log.error('> 添加git-hook: commit-msg 失败！')
    }
  }
  log.success('------------------')
  log.success('> 配置完成')
  log.success('------------------')
}

init()
