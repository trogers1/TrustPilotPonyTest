#!/usr/bin/env ts-node-script
'use strict';
import PonySaver, { MazeResponse } from './src/PonySaver';
import exampleMaze from './src/PonySaver/exampleMaze.json';

export const main = async () => {
  const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
  mazeRunner.setMazeData(exampleMaze as MazeResponse);
  await mazeRunner.print();
  // mazeRunner.findPath();
};

if (!process.argv[1].endsWith('mocha')) {
  main();
}
