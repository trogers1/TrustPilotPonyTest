import fetch from 'node-fetch';
import { readableToString, colors } from '../utils';

const { RedFg, RedFg_Bright } = colors;

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

/* Handle:
- Game no longer active
- No routes found
  - None exist
  - domukun blocks all paths
  - Maybe head in the direction
- Panic mode (run away from domokun)
  - determine opposite direction
  - prioritize paths going the opposite direction
*/

export default class PonySaver {
  playerName: string;
  mazeHeight: number;
  mazeWidth: number;
  difficulty: number;
  mazeId!: string;
  ponyPosition!: number;
  domokunPosition!: number;
  endPoint!: number;
  maze!: MazePosition[];
  autoPrint: boolean;

  constructor(
    playerName: string,
    mazeHeight: number,
    mazeWidth: number,
    difficulty: number,
    autoPrint = false
  ) {
    this.playerName = playerName;
    this.mazeHeight = mazeHeight;
    this.mazeWidth = mazeWidth;
    this.difficulty = difficulty;
    this.autoPrint = autoPrint;
  }

  async loadMaze(mazeId: string) {
    this.mazeId = mazeId;
    await this.getMazeData();
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

      throw new Error(
        RedFg(
          `Unsuccessful request to create maze. Result:\n${RedFg_Bright(body)}`
        )
      );
    }
    const json: Record<string, string> = await response.json();

    this.mazeId = json.maze_id;
  }

  setMazeData(data: MazeResponse) {
    this.ponyPosition = data.pony[0];
    this.domokunPosition = data.domokun[0];
    this.endPoint = data['end-point'][0];
    this.maze = data.data;
    this.mazeWidth = data.size[0];
    this.mazeHeight = data.size[1];
    this.difficulty = data.difficulty;
  }

  async getMazeData() {
    let response = await fetch(
      `https://ponychallenge.trustpilot.com/pony-challenge/maze/${this.mazeId}`,
      { method: 'GET' }
    );
    if (!response.ok) {
      const body = await readableToString(response.body);

      throw new Error(
        RedFg(
          `Unsuccessful request to GET maze. Result:\n${RedFg_Bright(body)}`
        )
      );
    }
    const json: MazeResponse = await response.json();

    return json;
  }

  findPaths() {}

  async print() {
    let response = await fetch(
      `https://ponychallenge.trustpilot.com/pony-challenge/maze/${this.mazeId}/print`,
      { method: 'GET' }
    );

    const body = await readableToString(response.body);
    if (!response.ok) {
      throw new Error(
        RedFg(
          `Unsuccessful request to print the maze. Result:\n${RedFg_Bright(
            body
          )}`
        )
      );
    }
    console.log(JSON.stringify(body));
  }
}
