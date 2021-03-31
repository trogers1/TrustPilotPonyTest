import fetch from 'node-fetch';
import { readableToString } from '../utils';

export type WallPosition = 'west' | 'north';
export type MazePosition = WallPosition[];
export type MazeResponse = {
  pony: number[];
  domokun: number[];
  'end-point': number[];
  size: number[];
  difficulty: number;
  data: MazePosition[];
};

export class PonySaver {
  playerName: string;
  mazeHeight: number;
  mazeWidth: number;
  difficulty: number;
  mazeId!: string;
  ponyPosition!: number;
  domokunPosition!: number;
  endPoint!: number;
  maze!: MazePosition[];

  constructor(
    playerName: string,
    mazeHeight: number,
    mazeWidth: number,
    difficulty: number
  ) {
    this.playerName = playerName;
    this.mazeHeight = mazeHeight;
    this.mazeWidth = mazeWidth;
    this.difficulty = difficulty;
  }

  async createMaze() {
    let response = await fetch(
      'https://ponychallenge.trustpilot.com/pony-challenge/maze',
      {
        method: 'POST',
        body: JSON.stringify({
          'maze-player-name': this.playerName,
          'maze-height': this.mazeHeight,
          'maze-width': this.mazeWidth,
          difficulty: this.difficulty,
        }),
      }
    );
    if (!response.ok) {
      const body = await readableToString(response.body);

      throw new Error(`Unsuccessful request to create maze. Result:\n${body}`);
    }
    const json: Record<string, string> = await response.json();

    this.mazeId = json.maze_id;
  }

  async getMazeData() {
    let response = await fetch(
      `https://ponychallenge.trustpilot.com/pony-challenge/maze/${this.mazeId}`,
      { method: 'GET' }
    );
    if (!response.ok) {
      const body = await readableToString(response.body);

      throw new Error(`Unsuccessful request to GET maze. Result:\n${body}`);
    }
    const json: MazeResponse = await response.json();

    this.ponyPosition = json.pony[0];
    this.domokunPosition = json.domokun[0];
    this.endPoint = json['end-point'][0];
    this.maze = json.data;
  }
}
