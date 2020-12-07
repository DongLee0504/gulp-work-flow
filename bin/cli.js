#!/usr/bin/env node
const meow = require("meow");
const foo = require("..");
const cli = meow(`
Usage
  $ gulp-work-flow [input]

Options
  --foo  Lorem ipsum. [Default: false]

Examples
  $ gulp-work-flow
  unicorns
  $ gulp-work-flow rainbows
  unicorns & rainbows
`);

foo(cli.input[0], cli.flags);
