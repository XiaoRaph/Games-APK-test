import React, {
  useState,
  useEffect,
  useCallback
} from 'react';
import { View, StyleSheet,
  // Text,
  // TouchableOpacity
} from 'react-native'; // Import Text and TouchableOpacity
import { Canvas,
  RoundedRect,
  Path, Skia,
  // useDrawCallback, // No longer needed for grid
  Circle,
  // Text as SkiaText,
  // PaintStyle,
  Group } from '@shopify/react-native-skia';
import { COLORS, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, GRID_SIZE,
  GAME_SPEED_MS,
  DIRECTIONS
} from '../constants/gameConstants';
import { Snake as SnakeType,
  Coordinates,
  Direction,
  Food
} from '../types';
// import Joystick from '../components/Joystick'; // Keep commented for now

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
  const initialSnake: SnakeType = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ];
  const [snake, setSnake] = useState<SnakeType>(initialSnake);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Food>(getRandomPosition(initialSnake));
  const [score, setScore] = useState<number>(0);
  // const [isGameOver, setIsGameOver] = useState<boolean>(false); // Will be uncommented later
  const gameLoopIntervalRef = React.useRef<NodeJS.Timeout | null>(null);


  // Grid drawing
  const gridPath = Skia.Path.Make();
  for (let i = 0; i <= GRID_SIZE; i++) {
    gridPath.moveTo(i * TILE_SIZE, 0);
    gridPath.lineTo(i * TILE_SIZE, CANVAS_HEIGHT);
    gridPath.moveTo(0, i * TILE_SIZE);
    gridPath.lineTo(CANVAS_WIDTH, i * TILE_SIZE);
  }

  // const handleDirectionChange = useCallback((newDirection: Direction | null) => { // Keep commented for now
  //   if (newDirection) {
  //     const currentMove = DIRECTIONS[direction];
  //     const newMove = DIRECTIONS[newDirection];
  //     if (currentMove.x + newMove.x === 0 && currentMove.y + newMove.y === 0) {
  //       return;
  //     }
  //     setDirection(newDirection);
  //   }
  // }, [direction]);

  const updateGame = useCallback(() => {
    setSnake(prevSnake => {
      const newSnake = prevSnake.map(segment => ({ ...segment }));
      const head = { ...newSnake[0] };
      const move = DIRECTIONS[direction];

      head.x += move.x;
      head.y += move.y;

      // Check for wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        // setIsGameOver(true); // Temporarily commented
        return prevSnake;
      }

      // Check for self-collision
      // for (let i = 1; i < newSnake.length -1 ; i++) { // Temporarily commented
      //   if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
      //     // setIsGameOver(true);
      //     return prevSnake;
      //   }
      // }

      let ateFood = false;
      if (head.x === food.x && head.y === food.y) {
        ateFood = true;
        setScore(s => s + 10);
        setFood(getRandomPosition(newSnake));
      }

      newSnake.unshift(head);

      if (!ateFood) {
         newSnake.pop();
      }
      return newSnake;
    });
  }, [direction, food, score]);

  // const resetGame = () => { // Keep commented for now
  //   setSnake(initialSnake);
  //   setDirection('RIGHT');
  //   setFood(getRandomPosition(initialSnake));
  //   // setScore(0);
  //   // setIsGameOver(false);
  // };

  useEffect(() => {
    // if (isGameOver) { // Temporarily commented
    //   if (gameLoopIntervalRef.current) {
    //     clearInterval(gameLoopIntervalRef.current);
    //     gameLoopIntervalRef.current = null;
    //   }
    //   return;
    // }

    if (!gameLoopIntervalRef.current) {
        gameLoopIntervalRef.current = setInterval(updateGame, GAME_SPEED_MS);
    }

    return () => {
      if (gameLoopIntervalRef.current) {
        clearInterval(gameLoopIntervalRef.current);
        gameLoopIntervalRef.current = null;
      }
    };
  // }, [updateGame, isGameOver]); // isGameOver dependency will be added back
  }, [updateGame]);

  // Score text paint & font will be uncommented later
  // const scoreTextPaint = Skia.Paint();
  // scoreTextPaint.setColor(Skia.Color(COLORS.white));
  // scoreTextPaint.setStyle(PaintStyle.Fill);
  // let scoreFont = Skia.FontMgr.RefDefault().matchFamilyStyle('monospace');
  // if (!scoreFont) scoreFont = Skia.FontMgr.RefDefault().default();
  // if (!scoreFont) scoreFont = Skia.Font();


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
        <Circle
          cx={food.x * TILE_SIZE + TILE_SIZE / 2}
          cy={food.y * TILE_SIZE + TILE_SIZE / 2}
          r={TILE_SIZE / 2.5}
          color={COLORS.food}
        />

        {/* Snake */}
        {snake.map((segment, index) => (
          <RoundedRect
            key={index}
            x={segment.x * TILE_SIZE}
            y={segment.y * TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            r={3}
            color={index === 0 ? COLORS.snakeHead : COLORS.snakeBody}
          />
        ))}

        {/* Score Display will be uncommented later */}
        {/* <SkiaText
            x={10}
            y={25}
            text={`Score: ${score}`}
            font={scoreFont}
            size={20}
            paint={scoreTextPaint}
        /> */}
        </Group>
      </Canvas>

      {/* Game Over UI will be uncommented later */}
      {/* {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverText}>Game Over</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}</Text>
          <TouchableOpacity style={styles.replayButton} onPress={resetGame}>
            <Text style={styles.replayButtonText}>Replay</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {/* Joystick UI will be uncommented later */}
      {/* {!isGameOver && (
        <View style={styles.joystickContainer}>
          <Joystick size={150} onDirectionChange={handleDirectionChange} currentDirection={direction} />
        </View>
      )} */}
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
    backgroundColor: COLORS.black,
  },
  joystickContainer: { // Keep for later
    position: 'absolute',
    bottom: 30,
  },
  gameOverOverlay: { // Keep for later
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gameOverBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: { // Keep for later
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.red,
    marginBottom: 20,
  },
  finalScoreText: { // Keep for later
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 30,
  },
  replayButton: { // Keep for later
    backgroundColor: COLORS.blue,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  replayButtonText: { // Keep for later
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Game;
