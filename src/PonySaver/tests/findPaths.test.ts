import assert from 'assert';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.findPaths()', () => {
  it('Should correctly find a straight-line path', async () => {
    const mazeHeight = 1;
    const mazeWidth = 10;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.ponyPosition = 1;
    mazeRunner.domokunPosition = 0;
    mazeRunner.endPoint = 9;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, [2, 3, 4, 5, 6, 7, 8, 9]);

    mazeRunner.domokunPosition = 9;
    mazeRunner.ponyPosition = 8;
    mazeRunner.endPoint = 0;
    path = mazeRunner.findPath();
    assert.deepStrictEqual(path, [7, 6, 5, 4, 3, 2, 1, 0]);
  });
  it('Should choose each next step with a bias toward the end point', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.ponyPosition = 6;
    mazeRunner.endPoint = 5;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, [3, 4, 5]);

    mazeRunner.ponyPosition = 2;
    mazeRunner.endPoint = 6;
    path = mazeRunner.findPath();
    assert.deepStrictEqual(path, [5, 8, 7, 6]);
  });
  it('Should correctly find a curved-line path', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.maze[6] = ['north'];
    mazeRunner.maze[7] = ['north'];
    mazeRunner.ponyPosition = 6;
    mazeRunner.domokunPosition = 0;
    mazeRunner.endPoint = 4;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, [7, 8, 5, 4]);
  });
  it('Should correctly find a path to the endpoint, even if Domokun is next to it', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.ponyPosition = 6;
    mazeRunner.domokunPosition = 3;
    mazeRunner.endPoint = 4;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, [7, 4]);
  });
  it('Should correctly find a path around Domokun', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.ponyPosition = 6;
    mazeRunner.domokunPosition = 3;
    mazeRunner.endPoint = 2;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, [7, 8, 5, 2]);
  });
  it('Should correctly return no path if domokun is in the way', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.maze[3] = ['north'];
    mazeRunner.ponyPosition = 6;
    mazeRunner.domokunPosition = 1;
    mazeRunner.endPoint = 0;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, []);
  });
  it('Should correctly return no path if domokun is standing on the end point', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.ponyPosition = 6;
    mazeRunner.domokunPosition = 2;
    mazeRunner.endPoint = 2;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, []);
  });
  it('Should return no path if none exist', async () => {
    const mazeHeight = 3;
    const mazeWidth = 3;
    const mazeRunner = new PonySaver('Morning Glory', mazeHeight, mazeWidth, 1);
    mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
    mazeRunner.maze[3] = ['north']; // block off the endpoint
    mazeRunner.maze[1] = ['west'];
    mazeRunner.ponyPosition = 6;
    mazeRunner.endPoint = 0;
    let path = mazeRunner.findPath();
    assert.deepStrictEqual(path, []);
  });
});
