#!/usr/bin/env node
'use strict';

const main = () => {
  return true;
};

if (!process.argv[1].endsWith('mocha')) {
  console.log(process.argv);
  console.log(process.execPath);
  console.log(process.argv0);
  main();
}

module.exports.main = main;
