import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Canvas,
  RoundedRect,
  Path,
  Skia,
  Circle,
  Group,
  useClock,
  useSharedValue,
  useDerivedValue,
  runOnJS,
} from '@shopify/react-native-skia';
import { useAnimatedReaction } from 'react-native-reanimated';
import { Direction, Food, Snake as SnakeType, Coordinates } from '../types';
import { COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, GRID_SIZE, GAME_SPEED_MS, DIRECTIONS } from '../constants/gameConstants';
import Joystick from '../components/Joystick';

const getRandomPosition = (snakeBody: SnakeType): Coordinates => {
  let position: Coordinates;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snakeBody.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
};

const Game: React.FC = () => {
  const initialSnake: SnakeType = useMemo(() => [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ], []);

  const snake = useSharedValue<SnakeType>(initialSnake);
  const direction = useSharedValue<Direction>('RIGHT');
  const [food, setFood] = useState<Food>(() => getRandomPosition(initialSnake));
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const clock = useClock();
  const lastUpdateTime = useSharedValue<number>(0);

  // Grid drawing (static, so no need for state/memo)
  const gridPath = Skia.Path.Make();
  for (let i = 0; i <= GRID_SIZE; i++) {
    gridPath.moveTo(i * TILE_SIZE, 0);
    gridPath.lineTo(i * TILE_SIZE, CANVAS_HEIGHT);
    gridPath.moveTo(0, i * TILE_SIZE);
    gridPath.lineTo(CANVAS_WIDTH, i * TILE_SIZE);
  }

  const resetGame = () => {
    snake.value = initialSnake;
    direction.value = 'RIGHT';
    setFood(getRandomPosition(initialSnake));
    setScore(0);
    setIsGameOver(false);
    lastUpdateTime.value = clock.value; // Reset game loop timer
  };

  const handleGameOver = runOnJS(() => {
    setIsGameOver(true);
  });

  const handleEatFood = runOnJS((newSnake: SnakeType) => {
    setScore(s => s + 10);
    setFood(getRandomPosition(newSnake));
  });

  useDerivedValue(() => {
    if (isGameOver) {
      return;
    }
    const currentTime = clock.value;
    if (currentTime - lastUpdateTime.value > GAME_SPEED_MS) {
      lastUpdateTime.value = currentTime;

      const newSnake = [...snake.value];
      const head = { ...newSnake[0] };
      const move = DIRECTIONS[direction.value];

      head.x += move.x;
      head.y += move.y;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        handleGameOver();
        return;
      }

      // Self-collision
      for (let i = 1; i < newSnake.length; i++) {
        if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
          handleGameOver();
          return;
        }
      }

      newSnake.unshift(head);

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        handleEatFood(newSnake);
      } else {
        newSnake.pop();
      }

      snake.value = newSnake;
    }
  }, [clock, food, isGameOver]);

  const snakePath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    snake.value.forEach((segment) => {
      path.addRRect(
        Skia.RRectXY(
          Skia.XYWHRect(
            segment.x * TILE_SIZE,
            segment.y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          ),
          3,
          3
        )
      );
    });
    return path;
  }, [snake]);

  // Score text paint
  // const scoreTextPaint = Skia.Paint(); // Original declaration, now replaced by useMemo version
  // scoreTextPaint.setColor(Skia.Color(COLORS.white));
  // scoreTextPaint.setStyle(PaintStyle.Fill);
  // scoreTextPaint.setAntiAlias(true); // Skia does this by default for text

  // const scoreTextPaint = useMemo(() => { // Commenting out score display logic
  //   const paint = Skia.Paint();
  //   paint.setColor(Skia.Color(COLORS.white));
  //   paint.setStyle(PaintStyle.Fill);
  //   return paint;
  // }, []);

  // Game Over text paint
  // const gameOverTextPaint = Skia.Paint(); // This will also be memoized later if Game Over UI is added
  // gameOverTextPaint.setColor(Skia.Color(COLORS.red));
  // gameOverTextPaint.setStyle(PaintStyle.Fill);
  // gameOverTextPaint.setAntiAlias(true);

  // const scoreFont: Skia.Font | null = useMemo(() => { // Commenting out score display logic
  //   try {
  //     const defaultFontMgr = Skia.FontMgr.RefDefault();
  //     if (defaultFontMgr) {
  //       let typeface = defaultFontMgr.matchFamilyStyle('monospace');
  //       if (!typeface) {
  //         console.warn("Monospace font not found, trying Roboto.");
  //         typeface = defaultFontMgr.matchFamilyStyle('Roboto');
  //       }
  //       if (!typeface) {
  //         console.warn("Roboto font not found, trying sans-serif.");
  //         typeface = defaultFontMgr.matchFamilyStyle('sans-serif');
  //       }
  //       if (!typeface) {
  //         console.warn("Sans-serif font not found, trying default system font.");
  //         typeface = defaultFontMgr.default();
  //       }

  //       if (typeface) {
  //         // return Skia.Font(typeface, 20); // Commented out as requested
  //         return null; // Explicitly return null
  //       } else {
  //         console.warn("No suitable system font found for score. Score will not be displayed.");
  //         return null;
  //       }
  //     } else {
  //       console.warn("Default Font Manager not available. Score will not be displayed.");
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error("Error loading font for score:", error);
  //     return null;
  //   }
  // }, []);


  return (
    <View style={styles.container}>
      <Canvas style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <Group>
          {/* Grid */}
          <Path
          path={gridPath}
          color={COLORS.grey}
          style="stroke"
          strokeWidth={0.5}
        />

        {/* Food */}
        {food && typeof food.x === 'number' && typeof food.y === 'number' && (
          <Circle
            cx={food.x * TILE_SIZE + TILE_SIZE / 2}
            cy={food.y * TILE_SIZE + TILE_SIZE / 2}
            r={TILE_SIZE / 2.5}
            color={COLORS.food}
          />
        )}

        {/* Snake */}
        <Path path={snakePath} color={COLORS.snakeBody} />
        {/* We can draw the head separately if we want a different color */}
        <RoundedRect
          x={snake.value[0].x * TILE_SIZE}
          y={snake.value[0].y * TILE_SIZE}
          width={TILE_SIZE}
          height={TILE_SIZE}
          r={3}
          color={COLORS.snakeHead}
        />

        {/* Score Display */}
        {/* {scoreFont && ( // Commenting out score display logic
            <SkiaText
                x={10}
                y={25} // Adjust y position as needed
                text={`Score: ${score}`}
                // font={scoreFont} // Commented out
                // size is managed by Skia.Font constructor
                // paint={scoreTextPaint} // Commented out
            />
        )} */}
        </Group>
      </Canvas>

      {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
          <TouchableOpacity style={styles.replayButton} onPress={resetGame}>
            <Text style={styles.replayButtonText}>Replay</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isGameOver && (
        <View style={styles.joystickContainer}>
          <Joystick size={150} direction={direction} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: COLORS.black, // Match canvas background if it's not covering fully
  },
  joystickContainer: {
    position: 'absolute',
    bottom: 30,
  },
  gameOverOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gameOverBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.red,
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 30,
  },
  replayButton: {
    backgroundColor: COLORS.blue, // Or any color you prefer
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  replayButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Game;
