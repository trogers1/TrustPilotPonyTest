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
    it.skip('Should choose no move if on the end point', async () => {});
    it.skip('Should choose a step away from domokun if valid path isn not found', async () => {});
});
