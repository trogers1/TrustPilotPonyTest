import assert from 'assert';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.getRelativeDirection()', () => {
  it('Should choose return the cardinal direction needed to travel from position1 to position2', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    assert.strictEqual(mazeRunner.getRelativeDirection(0, 1), 'east');
    assert.strictEqual(mazeRunner.getRelativeDirection(2, 1), 'west');
    assert.strictEqual(mazeRunner.getRelativeDirection(2, 5), 'south');
    assert.strictEqual(mazeRunner.getRelativeDirection(7, 4), 'north');
  });
  it('Should throw an error if the positions are not adjacent', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);

    assert.throws(
      () => mazeRunner.getRelativeDirection(0, 2),
      new Error(
        `\x1B[31mRelative Directions are only calculated for adjacent positions. \nPosition 1: \x1B[91m0\x1B[0m ({"y":-1,"x":1})\nPosition 2: \x1B[91m2\x1B[0m ({"y":-1,"x":3})\x1B[0m`
      )
    );
    assert.throws(
      () => mazeRunner.getRelativeDirection(7, 1),
      new Error(
        `\x1B[31mRelative Directions are only calculated for adjacent positions. \nPosition 1: \x1B[91m7\x1B[0m ({"y":-3,"x":2})\nPosition 2: \x1B[91m1\x1B[0m ({"y":-1,"x":2})\x1B[0m`
      )
    );
  });
  it('Should throw an error if the positions are out of bounds', async () => {
    const mazeHeight = 2;
    const mazeWidth = 2;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    assert.throws(
      () => mazeRunner.getRelativeDirection(3, 4),
      new Error(
        '\x1B[31mPosition is not within the maze. Valid positions: 0-3. Got: \x1B[91m4\x1B[0m\x1B[0m'
      )
    );
    assert.throws(
      () => mazeRunner.getRelativeDirection(4, 3),
      new Error(
        '\x1B[31mPosition is not within the maze. Valid positions: 0-3. Got: \x1B[91m4\x1B[0m\x1B[0m'
      )
    );
    assert.throws(
      () => mazeRunner.getRelativeDirection(0, -1),
      new Error(
        '\x1B[31mPosition is not within the maze. Valid positions: 0-3. Got: \x1B[91m-1\x1B[0m\x1B[0m'
      )
    );
    assert.throws(
      () => mazeRunner.getRelativeDirection(-1, 0),
      new Error(
        '\x1B[31mPosition is not within the maze. Valid positions: 0-3. Got: \x1B[91m-1\x1B[0m\x1B[0m'
      )
    );
  });
});
