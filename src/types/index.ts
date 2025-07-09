export interface Coordinates {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Snake = Coordinates[];

export interface Food extends Coordinates {}

// For Joystick component
export interface JoystickData {
  angle: number;
  distance: number;
  direction: Direction | null;
}
