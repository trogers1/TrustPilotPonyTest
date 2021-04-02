import assert from 'assert';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';
import { colors } from '../../utils';

const { RedFg, RedFg_Bright } = colors;

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.positionToCoordinates()', () => {
  it('Should correctly calculate the coordinates, given position in a 2x2 maze', () => {
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
  it('Should correctly calculate the coordinates, given position in a 3x4 maze', () => {
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
  it('Should correctly calculate the coordinates, given position in an API-generated 15x16 maze', () => {
    const mazeHeight = 16;
    const mazeWidth = 15;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(0), {
      x: 1,
      y: -1,
    });
    assert.deepStrictEqual(mazeRunner.positionToCoordinates(1), {
      x: 2,
      y: -1,
    });
    assert.deepStrictEqual(
      mazeRunner.positionToCoordinates(mazeRunner.maze.length - 1),
      {
        x: mazeRunner.mazeWidth,
        y: -16,
      }
    );
    assert.deepStrictEqual(
      mazeRunner.positionToCoordinates(mazeRunner.ponyPosition),
      {
        x: 9,
        y: -15,
      }
    );
    assert.deepStrictEqual(
      mazeRunner.positionToCoordinates(mazeRunner.endPoint),
      {
        x: 15,
        y: -11,
      }
    );
    assert.deepStrictEqual(
      mazeRunner.positionToCoordinates(mazeRunner.domokunPosition),
      {
        x: 15,
        y: -5,
      }
    );
  });
  it('Should throw an error if maze data does not exist', () => {
    const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
    assert.throws(
      () => mazeRunner.positionToCoordinates(10),
      new Error(
        'Cannot calculate coordinates without a maze. Please set maze data.'
      )
    );
  });
  it('Should throw an error if the given position is out of bounds', () => {
    const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
    let position = 300;
    assert.throws(
      () => mazeRunner.positionToCoordinates(position),
      new Error(
        RedFg(
          `Position is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${RedFg_Bright(position.toString())}`
        )
      )
    );
    assert.throws(
      () => mazeRunner.positionToCoordinates(mazeRunner.maze.length),
      new Error(
        RedFg(
          `Position is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${RedFg_Bright(mazeRunner.maze.length.toString())}`
        )
      )
    );
    position = -1;
    assert.throws(
      () => mazeRunner.positionToCoordinates(position),
      new Error(
        RedFg(
          `Position is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${RedFg_Bright(position.toString())}`
        )
      )
    );
  });
});
