import assert from 'assert';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.setMazeData()', () => {
  it('Should correctly set maze data', async () => {
    const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
    mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
    assert.strictEqual(mazeRunner.ponyPosition, exampleMazeResponse.pony[0]);
    assert.strictEqual(
      mazeRunner.domokunPosition,
      exampleMazeResponse.domokun[0]
    );
    assert.strictEqual(
      mazeRunner.endPoint,
      exampleMazeResponse['end-point'][0]
    );
    assert.deepStrictEqual(mazeRunner.maze, exampleMazeResponse.data);
    assert.strictEqual(mazeRunner.mazeWidth, exampleMazeResponse.size[0]);
    assert.strictEqual(mazeRunner.mazeHeight, exampleMazeResponse.size[1]);
    assert.strictEqual(mazeRunner.difficulty, exampleMazeResponse.difficulty);
    assert.strictEqual(mazeRunner.mazeId, exampleMazeResponse.maze_id);
  });
});
