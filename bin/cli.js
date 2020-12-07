#!/usr/bin/env node
const meow = require("meow");
require("..");
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
