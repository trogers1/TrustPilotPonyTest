import fetch from 'node-fetch';
import { readableToString, colors } from '../utils';
import PositionError from '../PositionError';

const { RedFg, RedFg_Bright } = colors;

import {
  WallPosition,
  MazePosition,
  MazeResponse,
  CoordinatePair,
  ValidDirections,
} from './types';

/* Handle:
- Game no longer active
- No routes found
  - None exist
  - domukun blocks all paths
  - Maybe head in the direction
- Panic mode (run away from domokun)
  - determine opposite direction
  - prioritize paths going the opposite direction
- S & E edges == autoEdge
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
   * Given a (zero-based) cell number position in the maze, calculate the x,y coordinate pair.
   * Origin of grid is in the top left.
   * Y axis starts at top left, descending by 1 for each row downward (e.g. -1, -2, -3... -(mazeHeight))
   * X axis starts at the top left and ascending by 1 for each column to the right, (e.g. 1, 2, 4...mazeWidth)
   * Formulas for finding P (position), X and Y:

   * X = P % mazeWidth
   * Y = -1 * (((P - (X - 1)) / mazeWidth) + 1)
   * P = (X - 1) + (-Y - 1) * mazeWidth
   *
   * @param position A position within the maze
   * @returns A CoordinatePair that has zero-based coordinates
   */
  positionToCoordinates(position: number): CoordinatePair {
    /*
    Formulas for finding P (position), X and Y
    Origin of grid is in the top left.
    Y axis starts at top left, descending by 1 for each row downward
    X axis starts at the top left and ascending by 1 for each column to the right

    X = P % mazeWidth
    Y = -1 * (((P - (X - 1)) / mazeWidth) + 1)
    P = (X - 1) + (-Y - 1) * mazeWidth
    */
    if (!this.maze) {
      throw new Error(
        'Cannot calculate coordinates without a maze. Please set maze data.'
      );
    }
    if (position < 0 || position >= this.maze.length) {
      throw new PositionError(position, this.maze.length);
    }
    const x = (position % this.mazeWidth) + 1;
    const y = Math.ceil(-1 * ((position - (x - 1)) / this.mazeWidth + 1));
    return {
      y,
      x,
    };
  }

  /**
   * Given a coordinate pair, calculate the (zero-based) position in the maze.
   * Origin of grid is in the top left.
   * Y axis starts at top left, descending by 1 for each row downward (e.g. -1, -2, -3... -(mazeHeight))
   * X axis starts at the top left and ascending by 1 for each column to the right, (e.g. 1, 2, 4...mazeWidth)
   * Formulas for finding P (position), X and Y:

   * X = P % mazeWidth
   * Y = -1 * (((P - (X - 1)) / mazeWidth) + 1)
   * P = (X - 1) + (-Y - 1) * mazeWidth
   *
   * @param coordinates An x,y coordinate pair within the maze
   * @returns A position within the maze (zero-based)
   */
  coordinatesToPosition({ x, y }: CoordinatePair): number {
    if (!this.maze) {
      throw new Error(
        'Cannot calculate position without a maze. Please set maze data.'
      );
    }
    if (x < 1 || x > this.mazeWidth) {
      throw new Error(
        `X Coordinate is not within the maze. Valid values: 1-${this.mazeWidth}. Got: ${x}`
      );
    }
    if (y > -1 || y < -this.mazeHeight) {
      throw new Error(
        `Y Coordinate is not within the maze. Valid values: -1 -> ${-this
          .mazeHeight}. Got: ${y}`
      );
    }
    return x - 1 + (-y - 1) * this.mazeWidth;
  }

  findValidDirections(position: number): ValidDirections {
    if (position < 0 || position >= this.maze.length) {
      throw new PositionError(position, this.maze.length);
    }
    const coords = this.positionToCoordinates(position);
    const directionPositions = {
      north: position - this.mazeWidth,
      south: position + this.mazeWidth,
      east: position + 1,
      west: position - 1,
    };
    let isDomokunPosition: ValidDirections = {
      north: false,
      south: false,
      east: false,
      west: false,
    };
    switch (this.domokunPosition) {
      case directionPositions.north:
        isDomokunPosition.north = true;
        break;
      case directionPositions.south:
        isDomokunPosition.south = true;
        break;
      case directionPositions.east:
        isDomokunPosition.east = true;
        break;
      case directionPositions.west:
        isDomokunPosition.west = true;
        break;
    }

    return {
      north:
        isDomokunPosition.north || coords.y === -1
          ? false
          : !this.maze[position].includes('north'),
      south:
        isDomokunPosition.south || coords.y === -this.mazeHeight
          ? false
          : !this.maze[position + this.mazeWidth].includes('north'),
      east:
        isDomokunPosition.east || coords.x === this.mazeHeight
          ? false
          : !this.maze[position + 1].includes('west'),
      west:
        isDomokunPosition.west || coords.x === 1
          ? false
          : !this.maze[position].includes('west'),
    };
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
