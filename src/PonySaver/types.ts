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
export type ValidDirections = {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
};

export type Path = number[];

export class GridNode {
  position: number;
  gx: number;
  hx: number;
  fx: number;
  parent: GridNode | null;

  constructor(
    position: number,
    parent: GridNode | null = null,
    gx = Infinity,
    hx = Infinity
  ) {
    this.position = position;
    this.parent = parent;
    this.gx = gx;
    this.hx = hx;
    this.fx = gx + hx;
  }
}
