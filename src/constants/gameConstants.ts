export const TILE_SIZE = 20;
export const GRID_SIZE = 20; // Assuming a 20x20 grid
export const CANVAS_WIDTH = TILE_SIZE * GRID_SIZE;
export const CANVAS_HEIGHT = TILE_SIZE * GRID_SIZE;

export const COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  green: '#00FF00',
  red: '#FF0000',
  blue: '#0000FF',
  grey: '#808080',
  lightGrey: '#D3D3D3',
  snakeHead: '#008000', // Darker green for the head
  snakeBody: '#00FF00', // Lighter green for the body
  food: '#FF0000',     // Red for food
  gameOverBackground: 'rgba(0, 0, 0, 0.5)',
  joystickBackground: '#A9A9A9',
  joystickHandle: '#696969',
};

export const GAME_SPEED_MS = 200; // Initial game speed

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};
