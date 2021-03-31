import assert from 'assert';
import { Readable } from 'stream';
import nock from 'nock';
import PonySaver from './PonySaver';

const exampleMazeResponse = require('./exampleMazeResponse.json');

describe('PonySaver', () => {
  afterEach(function (done) {
    nock.cleanAll();
    nock.disableNetConnect();
    done();
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
      assert.strictEqual(mazeRunner.ponyPosition, 121);
      assert.strictEqual(mazeRunner.domokunPosition, 65);
      assert.strictEqual(mazeRunner.endPoint, 70);
      assert.deepStrictEqual(mazeRunner.maze, exampleMazeResponse.data);
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
      const mazeRunner = await new PonySaver('Theseus', 15, 15, 1);
      try {
        await mazeRunner.createMaze();
        assert.fail("Expected an Error but didn't find one.");
      } catch (error) {
        assert.strictEqual(
          error.message,
          'Unsuccessful request to create maze. Result:\nOnly ponies can play'
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
      const mazeRunner = await new PonySaver('Morning Glory', 15, 15, 1);
      await mazeRunner.createMaze();
      try {
        await mazeRunner.getMazeData();
        assert.fail("Expected an Error but didn't find one.");
      } catch (error) {
        assert.strictEqual(
          error.message,
          'Unsuccessful request to GET maze. Result:\nmaze with that id is not found'
        );
      }
    });
  });
});
