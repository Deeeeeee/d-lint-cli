#! /usr/bin/env node

// #! 符号的名称叫 Shebang，用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头
// 如果是Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// 具体就是通过 chmod 755 cli.js 实现修改

const inquirer = require('inquirer')
const execa = require('execa')
const shell = require('shelljs')
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
function getGitBranch() {
  const res = execa.commandSync('git rev-parse --abbrev-ref HEAD')
  return res.stdout;
}
const branch = getGitBranch()
const jiraId = branch.split('-').reverse()[0]

inquirer.prompt([
  {
    type: 'input', //type： input, number, confirm, list, checkbox ... 
    name: 'jira', // key 名
    message: 'JIRA单号（没有可以省略）', // 提示信息
    default: jiraId // 默认值
  },
  {
    type: 'list',
    name: 'type',
    message: '提交类型',
    default: 'feat',
    loop: false,
    choices: [
      { name: 'feat:      新功能', value: 'feat' },
      { name: 'fix:       bug修复', value: 'fix' },
      { name: 'docs:      文档更新', value: 'docs' },
      { name: 'style:     代码的格式更新', value: 'style' },
      { name: 'refactor:  代码重构', value: 'refactor' },
      { name: 'perf:      性能优化', value: 'perf' },
      // { name: 'test:      测试更新', value: 'test' },
      // { name: 'build:     构建系统或者包依赖更新', value: 'build' },
      // { name: 'ci:        CI 配置，脚本文件等更新', value: 'ci' },
      { name: 'chore:     非 src 或者 测试文件的更新', value: 'chore' },
      { name: 'revert:    commit 回退', value: 'revert' },
    ]        
  },
  {
    type: 'input', //type： input, number, confirm, list, checkbox ... 
    name: 'message', // key 名
    message: '提交内容描述', // 提示信息
    default: '' // 默认值
  },
  {
    type: 'confirm', //type： input, number, confirm, list, checkbox ... 
    name: 'autoPush', // key 名
    message: '是否自动Push代码', // 提示信息
    default: false // 默认值
  }

]).then(answers => {
  const fullMessage = `WEB-${answers.jira} ${answers.type}: ${answers.message}`
  console.log(setColor('blue', '> 提交内容: ' + fullMessage))
  try{
    shell.exec(`git commit -m "${fullMessage}"`)
  }catch(e){
    console.log(setColor('red', JSON.stringify(e)))
  }
  // 判断是否自动提交 git push
  if(answers.autoPush){
    try{
      shell.exec(`git push origin ${branch}`)
    }catch(e){
      console.log(setColor('red', JSON.stringify(e)))
    }
  }
})

