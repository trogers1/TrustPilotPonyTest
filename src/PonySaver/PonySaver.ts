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
  Path,
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
    if (!this.maze) {
      throw new Error(
        'Cannot calculate coordinates without a maze. Please set maze data.'
      );
    }
    if (position < 0 || position >= this.maze.length) {
      throw new PositionError(position, this.maze.length);
    }
    const x = (position % this.mazeWidth) + 1;
    const y = -1 * ((position - (x - 1)) / this.mazeWidth + 1);
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

  findValidNextPositions(position: number): number[] {
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
    const possibleDirectionPositions = [];
    if (
      directionPositions.north !== this.domokunPosition &&
      coords.y !== -1 &&
      !this.maze[position].includes('north')
    ) {
      possibleDirectionPositions.push(directionPositions.north); // north is available
    }
    if (
      directionPositions.east !== this.domokunPosition &&
      coords.x !== this.mazeWidth &&
      !this.maze[position + 1].includes('west')
    ) {
      possibleDirectionPositions.push(directionPositions.east); // east is available
    }
    if (
      directionPositions.south !== this.domokunPosition &&
      coords.y !== -this.mazeHeight &&
      !this.maze[position + this.mazeWidth].includes('north')
    ) {
      possibleDirectionPositions.push(directionPositions.south); // south is available
    }
    if (
      directionPositions.west !== this.domokunPosition &&
      coords.x !== 1 &&
      !this.maze[position].includes('west')
    ) {
      possibleDirectionPositions.push(directionPositions.west); // west is available
    }
    return possibleDirectionPositions;
  }

  getOffset(coords1: CoordinatePair, coords2: CoordinatePair) {
    return {
      x: coords1.x - coords2.x,
      y: coords1.y - coords2.y,
    };
  }

  getRelativeDirection(position1: number, position2: number) {
    const coords1 = this.positionToCoordinates(position1),
      coords2 = this.positionToCoordinates(position2);
    const offset = this.getOffset(coords1, coords2);
    if (Math.abs(offset.x) !== 1 && Math.abs(offset.y) !== 1) {
      throw new Error(
        RedFg(
          `Relative Directions are only calculated for adjacent positions. \nPosition 1: ${RedFg_Bright(
            position1.toString()
          )} (${JSON.stringify(coords1)})\nPosition 2: ${RedFg_Bright(
            position2.toString()
          )} (${JSON.stringify(coords2)})`
        )
      );
    }
    if (offset.x === 1) {
      return 'west';
    }
    if (offset.x === -1) {
      return 'east';
    }
    if (offset.y === 1) {
      return 'south';
    }
    if (offset.y === -1) {
      return 'north';
    }
  }
  getNextPathStep(currPath: Path) {
    const currPosition = currPath.length
      ? currPath[currPath.length - 1]
      : this.ponyPosition;
    const currPositionCoords = this.positionToCoordinates(currPosition);
    const endPointCoords = this.positionToCoordinates(this.endPoint);
    const offset = this.getOffset(currPositionCoords, endPointCoords);

    if (offset.y <= 0) {
      // endpoint is north or parallel
    }
    if (offset.y > 0) {
      // endpoint is south
    }

    const validDirections = this.findValidNextPositions(currPosition);
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

  chooseNextMove() {
    it.skip('Should choose no move if on the end point', async () => {});
    it.skip('Should choose a step away from domokun if valid path isn not found', async () => {});
  }
  makeMove() {}

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
