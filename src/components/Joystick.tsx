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

  const DEAD_ZONE_RADIUS = maxOffset * 0.1; // 10% of maxOffset as dead zone

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

  // Memoized updateDirection function
  const updateDirection = React.useCallback((x: number, y: number) => {
    const dx = x - center.x;
    const dy = y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < DEAD_ZONE_RADIUS) {
      return; // Input is within the dead zone
    }

    let newDirection: Direction | null = null;
    if (Math.abs(dx) > Math.abs(dy)) { // More horizontal movement
      if (dx > 0) newDirection = 'RIGHT';
      else newDirection = 'LEFT';
    } else { // More vertical movement
      if (dy > 0) newDirection = 'DOWN';
      else newDirection = 'UP';
    }

    if (newDirection) {
        if (currentDirection === 'UP' && newDirection === 'DOWN') return;
        if (currentDirection === 'DOWN' && newDirection === 'UP') return;
        if (currentDirection === 'LEFT' && newDirection === 'RIGHT') return;
        if (currentDirection === 'RIGHT' && newDirection === 'LEFT') return;
        onDirectionChange(newDirection);
    }
  }, [center.x, center.y, DEAD_ZONE_RADIUS, currentDirection, onDirectionChange]);

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
      // onDirectionChange(null); // Optional: stop movement on release
    },
  }, [updateDirection]); // Add memoized updateDirection to touchHandler dependencies

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
