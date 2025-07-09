import React from 'react';
import { Canvas, Circle, Path, Skia, useTouchHandler, useSharedValue, useDerivedValue } from '@shopify/react-native-skia';
import { COLORS, DIRECTIONS } from '../constants/gameConstants';
import { Direction } from '../types';

interface JoystickProps {
  size: number;
  onDirectionChange: (direction: Direction | null) => void;
  currentDirection: Direction; // To prevent moving directly opposite
}

const STICK_RADIUS_RATIO = 0.3; // Ratio of stick radius to joystick size
const BASE_RADIUS_RATIO = 0.8;  // Ratio of base radius to joystick size (outer ring)
const CENTER_OFFSET_RATIO = 0.4; // How far the stick can move from the center

const Joystick: React.FC<JoystickProps> = ({ size, onDirectionChange, currentDirection }) => {
  const center = { x: size / 2, y: size / 2 };
  const baseRadius = (size / 2) * BASE_RADIUS_RATIO;
  const stickRadius = (size / 2) * STICK_RADIUS_RATIO;
  const maxOffset = (size / 2) * CENTER_OFFSET_RATIO;

  const touchX = useSharedValue(center.x);
  const touchY = useSharedValue(center.y);
  const isActive = useSharedValue(false);

  const stickPosition = useDerivedValue(() => {
    const dx = touchX.value - center.x;
    const dy = touchY.value - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxOffset) {
      return {
        x: center.x + (dx / distance) * maxOffset,
        y: center.y + (dy / distance) * maxOffset,
      };
    }
    return { x: touchX.value, y: touchY.value };
  }, [touchX, touchY, isActive]); // Rerun when touchX, touchY or isActive changes

  const touchHandler = useTouchHandler({
    onStart: (event) => {
      isActive.value = true;
      touchX.value = event.x;
      touchY.value = event.y;
      updateDirection(event.x, event.y);
    },
    onActive: (event) => {
      if (isActive.value) {
        touchX.value = event.x;
        touchY.value = event.y;
        updateDirection(event.x, event.y);
      }
    },
    onEnd: () => {
      isActive.value = false;
      touchX.value = center.x; // Reset stick to center
      touchY.value = center.y;
      // Optionally, you might want to set direction to null or keep last direction
      // onDirectionChange(null); // Uncomment if you want to stop movement on release
    },
  });

  const updateDirection = (x: number, y: number) => {
    const dx = x - center.x;
    const dy = y - center.y;
    const angle = Math.atan2(dy, dx); // Angle in radians

    let newDirection: Direction | null = null;

    // Determine direction based on angle
    // Top-Right: -PI/2 to 0
    // Bottom-Right: 0 to PI/2
    // Bottom-Left: PI/2 to PI
    // Top-Left: -PI to -PI/2

    const angleDeg = angle * 180 / Math.PI; // For easier understanding

    if (Math.abs(dx) > Math.abs(dy)) { // More horizontal movement
      if (dx > 0) newDirection = 'RIGHT';
      else newDirection = 'LEFT';
    } else { // More vertical movement
      if (dy > 0) newDirection = 'DOWN';
      else newDirection = 'UP';
    }

    // Prevent moving directly opposite to current direction
    if (newDirection) {
        if (currentDirection === 'UP' && newDirection === 'DOWN') return;
        if (currentDirection === 'DOWN' && newDirection === 'UP') return;
        if (currentDirection === 'LEFT' && newDirection === 'RIGHT') return;
        if (currentDirection === 'RIGHT' && newDirection === 'LEFT') return;
        onDirectionChange(newDirection);
    }
  };

  // Base of the joystick
  const baseOuterPath = Skia.Path.Make();
  baseOuterPath.addCircle(center.x, center.y, baseRadius);

  const baseInnerPath = Skia.Path.Make(); // Could be a smaller circle or just for visual effect
  baseInnerPath.addCircle(center.x, center.y, baseRadius * 0.8);


  return (
    <Canvas style={{ width: size, height: size }} onTouch={touchHandler}>
      {/* Joystick Base */}
      <Path path={baseOuterPath} color={COLORS.joystickBackground} style="fill" />
       <Path path={baseInnerPath} color={'rgba(0,0,0,0.1)'} style="fill" />


      {/* Joystick Stick/Handle */}
      <Circle cx={stickPosition.value.x} cy={stickPosition.value.y} r={stickRadius} color={COLORS.joystickHandle} />
    </Canvas>
  );
};

export default Joystick;
