import { colors } from '../utils';

const { RedFg, RedFg_Bright } = colors;

export default class PositionError extends Error {
  position: number;
  mazeLength: number;

  constructor(position: number, mazeLength: number) {
    const message = RedFg(
      `Position is not within the maze. Valid positions: 0-${
        mazeLength - 1
      }. Got: ${RedFg_Bright(position.toString())}`
    );

    // 'Error' breaks prototype chain here in ES5
    super(message);
    // restore prototype chain
    Object.setPrototypeOf(this, PositionError.prototype);

    this.position = position;
    this.mazeLength = mazeLength;
  }
}
