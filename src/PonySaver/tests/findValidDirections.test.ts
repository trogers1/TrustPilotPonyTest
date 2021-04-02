import assert from 'assert';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';
import { colors } from '../../utils';

const { RedFg, RedFg_Bright } = colors;

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.findValidDirections()', () => {
  it('Should correctly determine valid directions when all directions are valid', () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    const validDirections = mazeRunner.findValidDirections(4);
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: true,
      east: true,
      west: true,
    });
  });
  it('Should correctly determine valid directions when no directions are valid', () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.maze[4] = ['west', 'north'];
    mazeRunner.maze[5] = ['west'];
    mazeRunner.maze[7] = ['north'];
    const validDirections = mazeRunner.findValidDirections(4);
    assert.deepStrictEqual(validDirections, {
      north: false,
      south: false,
      east: false,
      west: false,
    });
  });
  it('Should correctly determine valid directions when some directions are valid', () => {
    const mazeHeight = 16;
    const mazeWidth = 15;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);

    let validDirections = mazeRunner.findValidDirections(16);
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: false,
      east: true,
      west: false,
    });
    validDirections = mazeRunner.findValidDirections(218);
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: true,
      east: false,
      west: false,
    });
    validDirections = mazeRunner.findValidDirections(203);
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: true,
      east: true,
      west: false,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 7, y: -7 })
    );
    assert.deepStrictEqual(validDirections, {
      north: false,
      south: false,
      east: false,
      west: true,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 8, y: -10 })
    );
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: false,
      east: true,
      west: false,
    });
  });
  it('Should correctly determine valid directions when at the edges/corners of the maze', () => {
    let mazeHeight = 3;
    let mazeWidth = 3;
    let mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    let validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 1, y: -3 })
    );
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: false,
      east: true,
      west: false,
    });
    validDirections = mazeRunner.findValidDirections(8);
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: false,
      east: false,
      west: true,
    });
    mazeHeight = 16;
    mazeWidth = 15;
    mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
    validDirections = mazeRunner.findValidDirections(0);
    assert.deepStrictEqual(validDirections, {
      north: false,
      south: false,
      east: true,
      west: false,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: mazeWidth, y: -1 })
    );
    assert.deepStrictEqual(validDirections, {
      north: false,
      south: true,
      east: false,
      west: false,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 1, y: -mazeHeight })
    );
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: false,
      east: true,
      west: false,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.domokunPosition
    );
    assert.deepStrictEqual(validDirections, {
      north: false,
      south: true,
      east: false,
      west: true,
    });
    validDirections = mazeRunner.findValidDirections(mazeRunner.endPoint);
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: true,
      east: false,
      west: false,
    });
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
    let validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validDirections, {
      north: false,
      south: true,
      east: true,
      west: true,
    });
    mazeRunner.domokunPosition = mazeRunner.coordinatesToPosition({
      x: 1,
      y: -2,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: true,
      east: true,
      west: false,
    });
    mazeRunner.domokunPosition = mazeRunner.coordinatesToPosition({
      x: 3,
      y: -2,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: true,
      east: false,
      west: true,
    });
    mazeRunner.domokunPosition = mazeRunner.coordinatesToPosition({
      x: 2,
      y: -3,
    });
    validDirections = mazeRunner.findValidDirections(
      mazeRunner.coordinatesToPosition({ x: 2, y: -2 })
    );
    assert.deepStrictEqual(validDirections, {
      north: true,
      south: false,
      east: true,
      west: true,
    });
  });
  it('Should correctly throw an error when position is invalid', () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    let position = 100;
    assert.throws(
      () => mazeRunner.findValidDirections(position),
      RedFg(
        `Position is not within the maze. Valid positions: 0-${
          mazeHeight * mazeWidth - 1
        }. Got: ${RedFg_Bright(position.toString())}`
      )
    );
    position = -4;
    assert.throws(
      () => mazeRunner.findValidDirections(position),
      RedFg(
        `Position is not within the maze. Valid positions: 0-${
          mazeHeight * mazeWidth - 1
        }. Got: ${RedFg_Bright(position.toString())}`
      )
    );
    position = mazeHeight * mazeWidth;
    assert.throws(
      () => mazeRunner.findValidDirections(position),
      RedFg(
        `Position is not within the maze. Valid positions: 0-${
          mazeHeight * mazeWidth - 1
        }. Got: ${RedFg_Bright(position.toString())}`
      )
    );
  });
});
