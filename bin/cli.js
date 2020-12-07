#!/usr/bin/env node
const meow = require("meow");
// 设置 Gulp 构建目录为执行命令行所在目录
process.argv.push("--cwd");
process.argv.push(process.cwd());
// 设置 Gulp 配置文件为 ../lib/index.js 文件
process.argv.push("--gulpfile");
process.argv.push(require.resolve(".."));
require("gulp/bin/gulp");
meow(`
Usage
  $ gulp-work-flow [input]

Options
  serve 启动项目
  build 打包
  clean 清除目录
  --foo 额外配置 [Default: false]

Examples
  $ gulp-work-flow serve
  启动开发服务器
  $ gulp-work-flow build
  执行打包
  $ gulp-work-flow clean
  清除 dist 和 temp 目录
`);
