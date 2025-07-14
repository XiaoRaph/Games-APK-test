import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';

const COLS = 20;
const ROWS = 30;
const INITIAL_SNAKE = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];

interface Point { x: number; y: number; }

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some(p => p.x === food.x && p.y === food.y));
  return food;
}

const Joystick = ({ onDirectionChange }: { onDirectionChange: (dir: string) => void }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const dx = gesture.dx;
          const dy = gesture.dy;
          const lim = 40;
          const x = Math.max(-lim, Math.min(lim, dx));
          const y = Math.max(-lim, Math.min(lim, dy));
          setPosition({ x, y });
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 10) onDirectionChange('RIGHT');
            else if (dx < -10) onDirectionChange('LEFT');
          } else {
            if (dy > 10) onDirectionChange('DOWN');
            else if (dy < -10) onDirectionChange('UP');
          }
        },
        onPanResponderRelease: () => {
          setPosition({ x: 0, y: 0 });
        },
      }),
    [onDirectionChange],
  );

  return (
    <View style={styles.joystick}>
      <View
        {...responder.panHandlers}
        style={[
          styles.joystickKnob,
          { transform: [{ translateX: position.x }, { translateY: position.y }] },
        ]}
      />
    </View>
  );
};

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [food, setFood] = useState<Point>(() => randomFood(INITIAL_SNAKE));
  const [speed, setSpeed] = useState(200); // ms per move
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        if (
          newHead.x < 0 ||
          newHead.y < 0 ||
          newHead.x >= COLS ||
          newHead.y >= ROWS ||
          prev.some(p => p.x === newHead.x && p.y === newHead.y)
        ) {
          setGameOver(true);
          return prev;
        }
        const eat = newHead.x === food.x && newHead.y === food.y;
        const next = [newHead, ...prev.slice(0, eat ? prev.length : prev.length - 1)];
        if (eat) {
          setScore(s => s + 1);
          setFood(randomFood(next));
        }
        return next;
      });
    }, speed);
    return () => clearInterval(id);
  }, [direction, food, speed, gameOver]);

  const cell = 10;
  const width = COLS * cell;
  const height = ROWS * cell;

  const changeDirection = (dir: string) => {
    setDirection(prev => {
      if (dir === 'UP' && prev.y !== 1) return { x: 0, y: -1 };
      if (dir === 'DOWN' && prev.y !== -1) return { x: 0, y: 1 };
      if (dir === 'LEFT' && prev.x !== 1) return { x: -1, y: 0 };
      if (dir === 'RIGHT' && prev.x !== -1) return { x: 1, y: 0 };
      return prev;
    });
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection({ x: 1, y: 0 });
    setFood(randomFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        {snake.map((p, i) => (
          <Rect
            key={i}
            x={p.x * cell}
            y={p.y * cell}
            width={cell}
            height={cell}
            color="lime"
          />
        ))}
        <Rect x={food.x * cell} y={food.y * cell} width={cell} height={cell} color="red" />
      </Canvas>
      <Text style={styles.score}>Score: {score}</Text>
      <View style={styles.speedControls}>
        <TouchableOpacity onPress={() => setSpeed(s => Math.max(50, s - 50))} style={styles.speedBtn}>
          <Text style={styles.speedText}>Faster</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSpeed(s => s + 50)} style={styles.speedBtn}>
          <Text style={styles.speedText}>Slower</Text>
        </TouchableOpacity>
      </View>
      <Joystick onDirectionChange={changeDirection} />
      {gameOver && (
        <TouchableOpacity onPress={resetGame} style={styles.gameOver}>
          <Text style={styles.gameOverText}>Game Over - Tap to Restart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  score: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 8,
  },
  speedControls: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  speedBtn: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  speedText: {
    color: '#fff',
  },
  joystick: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystickKnob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  gameOver: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
  },
  gameOverText: {
    color: '#fff',
  },
});

