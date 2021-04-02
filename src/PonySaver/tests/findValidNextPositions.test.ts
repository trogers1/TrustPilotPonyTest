import assert from 'assert';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';
import { colors } from '../../utils';

const { RedFg, RedFg_Bright } = colors;

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.findValidNextPositions()', () => {
  it('Should correctly determine valid directions when all directions are valid', () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    const validPositions = mazeRunner.findValidNextPositions(4);
    assert.deepStrictEqual(validPositions, [1, 5, 7, 3]);
  });
  it('Should correctly determine valid directions when no directions are valid', () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.maze[4] = ['west', 'north'];
    mazeRunner.maze[5] = ['west'];
    mazeRunner.maze[7] = ['north'];
    const validPositions = mazeRunner.findValidNextPositions(4);
    assert.deepStrictEqual(validPositions, []);
  });
  it('Should correctly determine valid directions when some directions are valid', () => {
    const mazeHeight = 16;
    const mazeWidth = 15;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);

    let validPositions = mazeRunner.findValidNextPositions(16);
    assert.deepStrictEqual(validPositions, [1, 17]);
    validPositions = mazeRunner.findValidNextPositions(218);
    assert.deepStrictEqual(validPositions, [203, 233]);
    validPositions = mazeRunner.findValidNextPositions(203);
    assert.deepStrictEqual(validPositions, [188, 204, 218]);
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 7, y: -7 })
    );
    assert.deepStrictEqual(validPositions, [
      mazeRunner.coordinatesToPosition({ x: 6, y: -7 }),
    ]);
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 8, y: -10 })
    );
    assert.deepStrictEqual(validPositions, [
      mazeRunner.coordinatesToPosition({ x: 8, y: -9 }),
      mazeRunner.coordinatesToPosition({ x: 9, y: -10 }),
    ]);
  });
  it('Should correctly determine valid directions when at the edges/corners of the maze', () => {
    let mazeHeight = 3;
    let mazeWidth = 3;
    let mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    let validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 1, y: -3 })
    );
    assert.deepStrictEqual(validPositions, [3, 7]);
    validPositions = mazeRunner.findValidNextPositions(8);
    assert.deepStrictEqual(validPositions, [5, 7]);
    mazeHeight = 16;
    mazeWidth = 15;
    mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
    validPositions = mazeRunner.findValidNextPositions(0);
    assert.deepStrictEqual(validPositions, [1]);
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: mazeWidth, y: -1 })
    );
    assert.deepStrictEqual(validPositions, [
      mazeRunner.coordinatesToPosition({ x: mazeWidth, y: -2 }),
    ]);
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 1, y: -mazeHeight })
    );
    assert.deepStrictEqual(validPositions, [
      mazeRunner.coordinatesToPosition({ x: 1, y: -mazeHeight + 1 }),
      mazeRunner.coordinatesToPosition({ x: 2, y: -mazeHeight }),
    ]);
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.domokunPosition
    );
    assert.deepStrictEqual(validPositions, [
      mazeRunner.domokunPosition + mazeWidth,
      mazeRunner.domokunPosition - 1,
    ]);
    validPositions = mazeRunner.findValidNextPositions(mazeRunner.endPoint);
    assert.deepStrictEqual(validPositions, [
      mazeRunner.endPoint - mazeWidth,
      mazeRunner.endPoint + mazeWidth,
    ]);
  });
  it('Should correctly determine valid directions when next to Domokun', () => {
    let mazeHeight = 3;
    let mazeWidth = 3;
    let mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.domokunPosition = mazeRunner.coordinatesToPosition({
      x: 2,
      y: -1,
    });
    let validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validPositions, [5, 7, 3]);
    mazeRunner.domokunPosition = mazeRunner.coordinatesToPosition({
      x: 1,
      y: -2,
    });
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validPositions, [1, 5, 7]);
    mazeRunner.domokunPosition = mazeRunner.coordinatesToPosition({
      x: 3,
      y: -2,
    });
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validPositions, [1, 7, 3]);
    mazeRunner.domokunPosition = mazeRunner.coordinatesToPosition({
      x: 2,
      y: -3,
    });
    validPositions = mazeRunner.findValidNextPositions(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validPositions, [1, 5, 3]);
  });
  it('Should correctly throw an error when position is invalid', () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    let position = 100;
    assert.throws(
      () => mazeRunner.findValidNextPositions(position),
      RedFg(
        `Position is not within the maze. Valid positions: 0-${
          mazeHeight * mazeWidth - 1
        }. Got: ${RedFg_Bright(position.toString())}`
      )
    );
    position = -4;
    assert.throws(
      () => mazeRunner.findValidNextPositions(position),
      RedFg(
        `Position is not within the maze. Valid positions: 0-${
          mazeHeight * mazeWidth - 1
        }. Got: ${RedFg_Bright(position.toString())}`
      )
    );
    position = mazeHeight * mazeWidth;
    assert.throws(
      () => mazeRunner.findValidNextPositions(position),
      RedFg(
        `Position is not within the maze. Valid positions: 0-${
          mazeHeight * mazeWidth - 1
        }. Got: ${RedFg_Bright(position.toString())}`
      )
    );
  });
});
