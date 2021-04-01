import assert from 'assert';
import { Readable } from 'stream';
import nock from 'nock';
import PonySaver, { MazeResponse } from './PonySaver';

import exampleMazeResponse from './exampleMaze.json';

describe('PonySaver', () => {
  afterEach(function (done) {
    nock.cleanAll();
    nock.disableNetConnect();
    done();
  });
  describe('PonySaver.positionToCoordinates()', () => {
    it('should correctly calculate the coordinates, given position in a 2x2 maze', () => {
      const mazeHeight = 2;
      const mazeWidth = 2;
      const mazeRunner = new PonySaver(
        'Morning Glory',
        mazeHeight,
        mazeWidth,
        1
      );
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
    it('should correctly calculate the coordinates, given position in a 3x4 maze', () => {
      const mazeHeight = 3;
      const mazeWidth = 4;
      const mazeRunner = new PonySaver(
        'Morning Glory',
        mazeHeight,
        mazeWidth,
        1
      );
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
    it('should correctly calculate the coordinates, given position in an API-generated 15x16 maze', () => {
      const mazeHeight = 16;
      const mazeWidth = 15;
      const mazeRunner = new PonySaver(
        'Morning Glory',
        mazeHeight,
        mazeWidth,
        1
      );
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
    it('should throw an error if maze data does not exist', () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      assert.throws(
        () => mazeRunner.positionToCoordinates(10),
        new Error(
          'Cannot calculate coordinates without a maze. Please set maze data.'
        )
      );
    });
    it('should throw an error if the given position is out of bounds', () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
      assert.throws(
        () => mazeRunner.positionToCoordinates(300),
        new Error(
          `Position is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${300}`
        )
      );
      assert.throws(
        () => mazeRunner.positionToCoordinates(mazeRunner.maze.length),
        new Error(
          `Position is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${mazeRunner.maze.length}`
        )
      );
      assert.throws(
        () => mazeRunner.positionToCoordinates(-1),
        new Error(
          `Position is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${-1}`
        )
      );
    });
  });
  describe('PonySaver.coordinatesToPosition()', () => {
    it('should correctly calculate the position, given coordinates in a 2x2 maze', () => {
      // First test a 2 x 2 square
      const mazeHeight = 2;
      const mazeWidth = 2;
      const mazeRunner = new PonySaver(
        'Morning Glory',
        mazeHeight,
        mazeWidth,
        1
      );
      mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(0), {
        x: 0,
        y: 1,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(1), {
        x: 1,
        y: 1,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(2), {
        x: 0,
        y: 0,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(3), {
        x: 1,
        y: 0,
      });
      assert.deepStrictEqual(
        mazeRunner.positionToCoordinates(mazeRunner.maze.length - 1),
        {
          x: mazeRunner.mazeWidth - 1,
          y: 0,
        }
      );
    });
    it('should correctly calculate the position, given coordinates in a 3x4 maze', () => {
      // First test a 4 x 3 square
      const mazeHeight = 3;
      const mazeWidth = 4;
      const mazeRunner = new PonySaver(
        'Morning Glory',
        mazeHeight,
        mazeWidth,
        1
      );
      mazeRunner.maze = new Array(mazeHeight * mazeWidth).fill([]);
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(0), {
        x: 0,
        y: 2,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(1), {
        x: 1,
        y: 2,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(2), {
        x: 2,
        y: 2,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(3), {
        x: 3,
        y: 2,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(4), {
        x: 0,
        y: 1,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(5), {
        x: 1,
        y: 1,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(6), {
        x: 2,
        y: 1,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(7), {
        x: 3,
        y: 1,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(8), {
        x: 0,
        y: 0,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(9), {
        x: 1,
        y: 0,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(10), {
        x: 2,
        y: 0,
      });
      assert.deepStrictEqual(mazeRunner.positionToCoordinates(11), {
        x: 3,
        y: 0,
      });
      assert.deepStrictEqual(
        mazeRunner.positionToCoordinates(mazeRunner.maze.length - 1),
        {
          x: mazeRunner.mazeWidth - 1,
          y: 0,
        }
      );
    });
    it('should correctly calculate the position, given coordinates in an API-generated 15x16 maze', () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
      assert.deepStrictEqual(
        mazeRunner.coordinatesToPosition({
          x: 0,
          y: mazeRunner.mazeHeight - 1,
        }),
        0
      );
      assert.deepStrictEqual(
        mazeRunner.coordinatesToPosition({
          x: 1,
          y: 0,
        }),
        1
      );
      assert.deepStrictEqual(
        mazeRunner.coordinatesToPosition({
          x: mazeRunner.mazeWidth - 1,
          y: mazeRunner.mazeHeight - 1,
        }),
        mazeRunner.maze.length - 1
      );
      assert.deepStrictEqual(
        mazeRunner.coordinatesToPosition({
          x: 8,
          y: 1,
        }),
        mazeRunner.ponyPosition
      );
      assert.deepStrictEqual(
        mazeRunner.coordinatesToPosition({
          x: 14,
          y: 5,
        }),
        mazeRunner.endPoint
      );
      assert.deepStrictEqual(
        mazeRunner.coordinatesToPosition({
          x: 14,
          y: 11,
        }),
        mazeRunner.domokunPosition
      );
    });
    it('should throw an error if maze data does not exist', () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      assert.throws(
        () => mazeRunner.coordinatesToPosition({ x: 1, y: 1 }),
        new Error(
          'Cannot calculate position without a maze. Please set maze data.'
        )
      );
    });
    it('should throw an error if the given coordinates are out of bounds', () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      mazeRunner.setMazeData(exampleMazeResponse as MazeResponse);
      assert.throws(
        () => mazeRunner.coordinatesToPosition({ x: 100, y: 10 }),
        new Error(
          `X Coordinate is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${100}`
        )
      );
      assert.throws(
        () => mazeRunner.coordinatesToPosition({ x: 1, y: 1000 }),
        new Error(
          `Y Coordinate is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${1000}`
        )
      );
      assert.throws(
        () =>
          mazeRunner.coordinatesToPosition({ x: mazeRunner.mazeWidth, y: 1 }),
        new Error(
          `X Coordinate is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${mazeRunner.mazeWidth}`
        )
      );
      assert.throws(
        () =>
          mazeRunner.coordinatesToPosition({ x: 1, y: mazeRunner.mazeHeight }),
        new Error(
          `Y Coordinate is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${mazeRunner.mazeHeight}`
        )
      );
      assert.throws(
        () => mazeRunner.coordinatesToPosition({ x: -1, y: 1 }),
        new Error(
          `X Coordinate is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${-1}`
        )
      );
      assert.throws(
        () => mazeRunner.coordinatesToPosition({ x: 1, y: -1 }),
        new Error(
          `Y Coordinate is not within the maze. Valid positions: 0-${
            mazeRunner.maze.length - 1
          }. Got: ${-1}`
        )
      );
    });
  });
  describe('Successful requests', () => {
    beforeEach(() => {
      nock('https://ponychallenge.trustpilot.com')
        .post('/pony-challenge/maze')
        .reply(200, {
          maze_id: 'maze-id-1',
        });
      nock('https://ponychallenge.trustpilot.com')
        .get('/pony-challenge/maze/maze-id-1')
        .reply(200, exampleMazeResponse);
    });
    it('Should correctly create a new maze', async () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      await mazeRunner.createMaze();
      assert.strictEqual(mazeRunner.playerName, 'Morning Glory');
      assert.strictEqual(mazeRunner.mazeHeight, 15);
      assert.strictEqual(mazeRunner.mazeWidth, 15);
      assert.strictEqual(mazeRunner.difficulty, 1);
      assert.strictEqual(mazeRunner.mazeId, 'maze-id-1');
    });
    it('Should correctly retrieve maze data', async () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      await mazeRunner.createMaze();
      const mazeData = await mazeRunner.getMazeData();
      assert.deepStrictEqual(mazeData, exampleMazeResponse);
    });
    it('Should correctly set maze data', async () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      await mazeRunner.createMaze();
      const mazeData = await mazeRunner.getMazeData();
      mazeRunner.setMazeData(mazeData);
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
  describe('Bad Creation request', () => {
    before(() => {
      nock('https://ponychallenge.trustpilot.com')
        .post('/pony-challenge/maze')
        .reply(400, Readable.from('Only ponies can play'));
      nock('https://ponychallenge.trustpilot.com')
        .get('/pony-challenge/maze/maze-id-1')
        .reply(404, Readable.from('maze with that id is not found'));
    });
    it('Should throw error on unsuccessful maze creation due to bad playerName', async () => {
      const mazeRunner = new PonySaver('Theseus', 15, 15, 1);
      try {
        await mazeRunner.createMaze();
        assert.fail("Expected an Error but didn't find one.");
      } catch (error) {
        assert.strictEqual(
          error.message,
          '\x1B[31mUnsuccessful request to create maze. Result:\n\x1B[91mOnly ponies can play\x1B[0m\x1B[0m'
        );
      }
    });
  });
  describe('Bad GET maze request', () => {
    before(() => {
      nock('https://ponychallenge.trustpilot.com')
        .post('/pony-challenge/maze')
        .reply(200, {
          maze_id: 'maze-id-1',
        });
    });
    before(() => {
      nock('https://ponychallenge.trustpilot.com')
        .get('/pony-challenge/maze/maze-id-1')
        .reply(404, Readable.from('maze with that id is not found'));
    });
    it('Should throw error on unsuccessful maze request with bad id', async () => {
      const mazeRunner = new PonySaver('Morning Glory', 15, 15, 1);
      await mazeRunner.createMaze();
      try {
        await mazeRunner.getMazeData();
        assert.fail("Expected an Error but didn't find one.");
      } catch (error) {
        assert.strictEqual(
          error.message,
          '\x1B[31mUnsuccessful request to GET maze. Result:\n\x1B[91mmaze with that id is not found\x1B[0m\x1B[0m'
        );
      }
    });
  });
});
