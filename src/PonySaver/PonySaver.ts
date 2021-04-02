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
  GridNode,
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
  // grid: GridNode[][];
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
    // this.grid = [];
    // for (let y = 1; y <= mazeHeight; y++) {
    //   this.grid.push([]);
    //   for (let x = 1; x <= mazeWidth; x++) {
    //     this.grid[y].push({
    //       position: null,
    //       gx: Infinity,
    //       hx: Infinity,
    //       fx: Infinity,
    //       parent: null,
    //     });
    //   }
    // }
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

  findValidNextPositions(position: number, isDomokunOrPanic = false): number[] {
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

    // Invalid positions are the domokun's valid next position, and all positions adjacent
    // UNLESS we are checking the domokun's valid positions.
    let invalidPositions =
      !this.domokunPosition || isDomokunOrPanic
        ? []
        : [
            this.domokunPosition,
            ...this.findValidNextPositions(this.domokunPosition, true),
          ];
    // If any of the invalidPositions are the endPoint, make them valid again. Always try for the endpoint
    // The only exception is if the invalid point is Domokun's position. If he's standing on the endpoint, it's invalid
    invalidPositions = invalidPositions.filter(
      (pos) => pos !== this.endPoint || pos === this.domokunPosition
    );
    const possibleDirectionPositions = [];
    if (
      !invalidPositions.includes(directionPositions.north) &&
      coords.y !== -1 && // At an edge
      !this.maze[position].includes('north') // There's a wall
    ) {
      possibleDirectionPositions.push(directionPositions.north); // north is available
    }
    if (
      !invalidPositions.includes(directionPositions.east) &&
      coords.x !== this.mazeWidth && // At an edge
      !this.maze[position + 1].includes('west') // There's a wall
    ) {
      possibleDirectionPositions.push(directionPositions.east); // east is available
    }
    if (
      !invalidPositions.includes(directionPositions.south) &&
      coords.y !== -this.mazeHeight && // At an edge
      !this.maze[position + this.mazeWidth].includes('north') // There's a wall
    ) {
      possibleDirectionPositions.push(directionPositions.south); // south is available
    }
    if (
      !invalidPositions.includes(directionPositions.west) &&
      coords.x !== 1 && // At an edge
      !this.maze[position].includes('west') // There's a wall
    ) {
      possibleDirectionPositions.push(directionPositions.west); // west is available
    }
    return possibleDirectionPositions;
  }

  getOffset(position1: number, position2: number) {
    const coords1 = this.positionToCoordinates(position1),
      coords2 = this.positionToCoordinates(position2);
    return {
      x: coords1.x - coords2.x,
      y: coords1.y - coords2.y,
    };
  }

  getHeuristic(position1: number, position2: number) {
    // Heuristic is the Manhattan Distance (taxicab metric).
    const offset = this.getOffset(position1, position2);
    return Math.abs(offset.x) + Math.abs(offset.y);
  }

  getRelativeDirection(position1: number, position2: number) {
    const coords1 = this.positionToCoordinates(position1),
      coords2 = this.positionToCoordinates(position2);
    const offset = this.getOffset(position1, position2);
    // Heuristic is the Manhattan Distance ()
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

  /**
   * This function uses the A* Search Algorithm to find the shortest path through the maze.
   * It assigns relative value (f(x)) to subsequent nodes by virtue of g(x) and h(x)
   *
   * g(x): the cost of the path from the start node to x
   * h(x): the heuristic function that estimates the cost of the cheapest path from x to the goal (in
   *       our case, the Manhattan Distance)
   *
   * See:
   * - https://en.wikipedia.org/wiki/A*_search_algorithm
   * - https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
   */
  findPath() {
    const openNodes: GridNode[] = [];
    const closedNodes: GridNode[] = [];
    openNodes.push(new GridNode(this.ponyPosition));
    while (openNodes.length) {
      // Sort openNodes array ascending by fx, which defines the 'best' node for this round
      openNodes.sort((a, b) => a.fx - b.fx);

      // Grab the current not, removing it from `openNodes`
      const currNode = openNodes.shift();

      if (!currNode) {
        throw new Error('Somehow the openNodes stack was empty...');
      }

      // End case: result has been found, return the traced path
      if (currNode.position === this.endPoint) {
        let curr = currNode;
        let result = [];
        while (curr.parent) {
          result.push(curr.position);
          curr = curr.parent;
        }

        return result.reverse();
      }

      // Normal case: add the currNode to the `closedNodes`, process each of the possible movements
      closedNodes.push(currNode);
      const possiblePositions = this.findValidNextPositions(currNode.position);

      for (let possiblePosition of possiblePositions) {
        // skip already-visited nodes (if we already encountered it, that was the best)
        if (closedNodes.some((node) => node.position === possiblePosition)) {
          continue;
        }

        // g(x) is the shortest distance from the start node to the current node. We must
        // check if the path we have arrived at for this possiblePosition is the shortest
        // one we have seen yet.
        const gx = currNode.gx + 1;
        let gxIsBest = false;

        // See if we have visited this position before
        const visitedNode = openNodes.find(
          (node) => node.position === possiblePosition
        );
        if (!visitedNode) {
          // If not in `openNodes`, we have not encountered it before. It must be the best.
          gxIsBest = true;
          // Must also add a heuristic score since we haven't done so yet.
          const hx = this.getHeuristic(possiblePosition, this.endPoint);
          openNodes.push(new GridNode(possiblePosition, currNode, gx, hx));
        } else if (gx < visitedNode.gx) {
          // We have seen the node before, but we have a better g(x) (distance from start) than we got before
          gxIsBest = true;
        }

        if (gxIsBest) {
          // Determine if we should be modifying the preexisting node, or the one we just created
          const currStepNode = visitedNode
            ? visitedNode
            : openNodes[openNodes.length - 1];
          currStepNode.parent = currNode;
          currStepNode.gx = gx;
          currStepNode.fx = currStepNode.gx + currStepNode.hx;
        }
      }
    }

    // No result found
    return [];
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
