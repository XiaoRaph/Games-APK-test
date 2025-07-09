import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Canvas will be a square, taking 90% of the smaller screen dimension
const smallerScreenDimension = Math.min(screenWidth, screenHeight);
export const CANVAS_SIZE = smallerScreenDimension * 0.9;

export const CANVAS_WIDTH = CANVAS_SIZE;
export const CANVAS_HEIGHT = CANVAS_SIZE;

export const GRID_SIZE = 20; // We want a 20x20 grid

// Adjust TILE_SIZE so that the GRID_SIZE x GRID_SIZE grid fits perfectly into the CANVAS_SIZE
export const TILE_SIZE = CANVAS_SIZE / GRID_SIZE;

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
