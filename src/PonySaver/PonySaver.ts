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
  maze_id: 'string';
  'game-state': {
    state: string;
    'state-result': string;
  };
};
export type CoordinatePair = {
  x: number;
  y: number;
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
    this.mazeId = data.maze_id;
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

  /**
   * Taking a cell number position in the maze, calculate the x,y coordinate pair.
   * @param position A position within the maze
   * @returns A CoordinatePair that has zero-based coordinates
   */
  positionToCoordinates(position: number): CoordinatePair {
    if (!this.maze) {
      throw new Error(
        'Cannot calculate coordinates without a maze. Please set maze data.'
      );
    }
    if (position < 0 || position >= this.maze.length) {
      throw new Error(
        `Position is not within the maze. Valid positions: 0-${
          this.maze.length - 1
        }. Got: ${position}`
      );
    }
    const x = position < this.mazeWidth ? position : position % this.mazeWidth;
    const row = Math.ceil((position + 1) / this.mazeWidth); // 'row' is the row of the maze, 1-based, from top to bottom
    const y = this.mazeHeight - row;
    return {
      y,
      x,
    };
  }

  /**
   * Given an x,y coordinate pair, return the cell position in the maze
   * @param coordinates An x,y coordinate pair within the maze
   * @returns A position within the maze (zero-based)
   */
  coordinatesToPosition({ x, y }: CoordinatePair): number {
    if (!this.maze) {
      throw new Error(
        'Cannot calculate position without a maze. Please set maze data.'
      );
    }
    if (x < 0 || x >= this.mazeWidth) {
      throw new Error(
        `X Coordinate is not within the maze. Valid positions: 0-${
          this.mazeHeight * this.mazeWidth - 1
        }. Got: ${x}`
      );
    }
    if (y < 0 || y >= this.mazeHeight) {
      throw new Error(
        `Y Coordinate is not within the maze. Valid positions: 0-${
          this.mazeHeight * this.mazeWidth - 1
        }. Got: ${y}`
      );
    }
    const row = this.mazeHeight - y; // 'row' is the row of the maze, 1-based, from top to bottom

    return (row - 1) * this.mazeWidth + x;
  }

  findPaths() {
    console.log(
      'Pony location',
      this.positionToCoordinates(this.ponyPosition),
      this.maze[this.ponyPosition]
    );
    console.log(
      'End location',
      this.positionToCoordinates(this.endPoint),
      this.maze[this.endPoint]
    );
    console.log(
      'Domokun location',
      this.positionToCoordinates(this.domokunPosition),
      this.maze[this.domokunPosition]
    );
  }

  async print() {
    if (!this.mazeId) {
      throw new Error(
        RedFg('Cannot print an unknown maze. Please set mazeId.')
      );
    }
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
    console.log(body);
  }
}
