import assert from 'assert';
import { Readable } from 'stream';
import nock from 'nock';
import PonySaver from '../PonySaver';
import { MazeResponse } from '../types';

import exampleMazeResponse from '../exampleMaze.json';

describe('PonySaver.createMaze()', () => {
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
    afterEach(function (done) {
      nock.cleanAll();
      nock.disableNetConnect();
      done();
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
    it('Should correctly set maze data with resultant maze data', async () => {
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
  describe('Unsuccessful Creation request', () => {
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
  describe('Unsuccessful GET maze request', () => {
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
