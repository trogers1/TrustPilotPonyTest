import assert from 'assert';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.coordinatesToPosition()', () => {
  it('Should correctly calculate the position, given coordinates in a 2x2 maze', () => {
    // First test a 2 x 2 square
    const mazeHeight = 2;
    const mazeWidth = 2;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(0), {
      x: 1,
      y: -1,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(1), {
      x: 2,
      y: -1,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(2), {
      x: 1,
      y: -2,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(3), {
      x: 2,
      y: -2,
    });
    assert.deepStrictEqual(
      mazeRunner.positionToCoordinates(mazeRunner.maze.length - 1),
      {
        x: mazeRunner.mazeWidth,
        y: -mazeRunner.mazeHeight,
      }
    );
  });
  it('Should correctly calculate the position, given coordinates in a 3x4 maze', () => {
    // First test a 4 x 3 square
    const mazeHeight = 3;
    const mazeWidth = 4;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(0), {
      x: 1,
      y: -1,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(1), {
      x: 2,
      y: -1,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(2), {
      x: 3,
      y: -1,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(3), {
      x: 4,
      y: -1,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(4), {
      x: 1,
      y: -2,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(5), {
      x: 2,
      y: -2,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(6), {
      x: 3,
      y: -2,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(7), {
      x: 4,
      y: -2,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(8), {
      x: 1,
      y: -3,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(9), {
      x: 2,
      y: -3,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(10), {
      x: 3,
      y: -3,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(11), {
      x: 4,
      y: -3,
    });
    assert.deepStrictEqual(
      mazeRunner.positionToCoordinates(mazeRunner.maze.length - 1),
      {
        x: mazeRunner.mazeWidth,
        y: -mazeRunner.mazeHeight,
      }
    );
  });
  it('Should correctly calculate the position, given coordinates in an API-generated 15x16 maze', () => {
    const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
    assert.deepStrictEqual(
      mazeRunner.coordinatesToPosition({
        x: 1,
        y: -1,
      }),
      0
    );
    assert.deepStrictEqual(
      mazeRunner.coordinatesToPosition({
        x: 2,
        y: -1,
      }),
      1
    );
    assert.deepStrictEqual(
      mazeRunner.coordinatesToPosition({
        x: mazeRunner.mazeWidth,
        y: -mazeRunner.mazeHeight,
      }),
      mazeRunner.maze.length - 1
    );
    assert.deepStrictEqual(
      mazeRunner.coordinatesToPosition({
        x: 9,
        y: -15,
      }),
      mazeRunner.ponyPosition
    );
    assert.deepStrictEqual(
      mazeRunner.coordinatesToPosition({
        x: 15,
        y: -11,
      }),
      mazeRunner.endPoint
    );
    assert.deepStrictEqual(
      mazeRunner.coordinatesToPosition({
        x: 15,
        y: -5,
      }),
      mazeRunner.domokunPosition
    );
  });
  it('Should throw an error if maze data does not exist', () => {
    const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
    assert.throws(
      () => mazeRunner.coordinatesToPosition({ x: 1, y: 1 }),
      new Error(
        'Cannot calculate position without a maze. Please set maze data.'
      )
    );
  });
  it('Should throw an error if the given coordinates are out of bounds', () => {
    const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
    assert.throws(
      () => mazeRunner.coordinatesToPosition({ x: 100, y: -10 }),
      new Error(
        `X Coordinate is not within the maze. Valid values: 1-${
          mazeRunner.mazeWidth
        }. Got: ${100}`
      )
    );
    assert.throws(
      () => mazeRunner.coordinatesToPosition({ x: 1, y: -1000 }),
      new Error(
        `Y Coordinate is not within the maze. Valid values: -1 -> ${-mazeRunner.mazeHeight}. Got: ${-1000}`
      )
    );
    assert.throws(
      () =>
        mazeRunner.coordinatesToPosition({
          x: mazeRunner.mazeWidth + 1,
          y: -1,
        }),
      new Error(
        `X Coordinate is not within the maze. Valid values: 1-${
          mazeRunner.mazeWidth
        }. Got: ${mazeRunner.mazeWidth + 1}`
      )
    );
    assert.throws(
      () =>
        mazeRunner.coordinatesToPosition({
          x: 1,
          y: -(mazeRunner.mazeHeight + 1),
        }),
      new Error(
        `Y Coordinate is not within the maze. Valid values: -1 -> ${-mazeRunner.mazeHeight}. Got: ${-(
          mazeRunner.mazeHeight + 1
        )}`
      )
    );
    assert.throws(
      () => mazeRunner.coordinatesToPosition({ x: -1, y: -1 }),
      new Error(
        `X Coordinate is not within the maze. Valid values: 1-${
          mazeRunner.mazeWidth
        }. Got: ${-1}`
      )
    );
    assert.throws(
      () => mazeRunner.coordinatesToPosition({ x: 1, y: 1 }),
      new Error(
        `Y Coordinate is not within the maze. Valid values: -1 -> ${-mazeRunner.mazeHeight}. Got: ${1}`
      )
    );
  });
});
