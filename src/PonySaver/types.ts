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
