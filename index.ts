#!/usr/bin/env node
'use strict';
import PonySaver, { MazeResponse } from './src/PonySaver';
import exampleMaze from './src/exampleMaze.json';

export const main = () => {
  const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
  mazeRunner.setMazeData(exampleMaze as MazeResponse);
  mazeRunner.print();
};

if (!process.argv[1].endsWith('mocha')) {
  console.log(process.argv);
  console.log(process.execPath);
  console.log(process.argv0);
  main();
}
