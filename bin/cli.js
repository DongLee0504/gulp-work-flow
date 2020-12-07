#!/usr/bin/env node
const meow = require("meow");
require("..")(11111);

meow(`
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
