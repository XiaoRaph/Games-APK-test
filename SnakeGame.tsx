import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder, Dimensions } from 'react-native';
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

const EDGE_SIZE = 30;

const Joystick = ({ onDirectionChange, onEdgeTouch }: { onDirectionChange: (dir: string) => void; onEdgeTouch: () => void }) => {
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
          const { x0, y0 } = gesture;
          const { width: screenW, height: screenH } = Dimensions.get('window');
          if (
            x0 < EDGE_SIZE ||
            x0 > screenW - EDGE_SIZE ||
            y0 < EDGE_SIZE ||
            y0 > screenH - EDGE_SIZE
          ) {
            onEdgeTouch();
            setStartPos(null);
          } else {
            setStartPos({ x: x0, y: y0 });
          }
        },
        onPanResponderMove: (_, gesture) => {
          if (!startPos) return;
          const dx = gesture.moveX - startPos.x;
          const dy = gesture.moveY - startPos.y;
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
          setStartPos(null);
          setPosition({ x: 0, y: 0 });
        },
      }),
    [onDirectionChange, onEdgeTouch, startPos],
  );

  return (
    <View {...responder.panHandlers} style={StyleSheet.absoluteFill}>
      {startPos && (
        <View
          style={[
            styles.joystick,
            { position: 'absolute', left: startPos.x - 60, top: startPos.y - 60 },
          ]}
        >
          <View
            style={[
              styles.joystickKnob,
              { transform: [{ translateX: position.x }, { translateY: position.y }] },
            ]}
          />
        </View>
      )}
    </View>
  );
};

interface SnakeGameProps {
  initialSpeed: number;
  onExit: () => void;
}

export default function SnakeGame({ initialSpeed, onExit }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [food, setFood] = useState<Point>(() => randomFood(INITIAL_SNAKE));
  const [speed, setSpeed] = useState(initialSpeed); // ms per move
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const hideBackTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSpeed(initialSpeed);
  }, [initialSpeed]);

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

  const { width: screenW, height: screenH } = Dimensions.get('window');
  const cell = Math.floor(Math.min(screenW / COLS, screenH / ROWS));
  const width = cell * COLS;
  const height = cell * ROWS;

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

  const handleEdgeTouch = () => {
    setShowBack(true);
    if (hideBackTimeout.current) clearTimeout(hideBackTimeout.current);
    hideBackTimeout.current = setTimeout(() => setShowBack(false), 2000);
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
      <Joystick onDirectionChange={changeDirection} onEdgeTouch={handleEdgeTouch} />
      {gameOver && (
        <TouchableOpacity onPress={resetGame} style={styles.gameOver}>
          <Text style={styles.gameOverText}>Game Over - Tap to Restart</Text>
        </TouchableOpacity>
      )}
      {showBack && (
        <TouchableOpacity onPress={onExit} style={styles.backButton}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  joystickKnob: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#000',
  },
  gameOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  gameOverText: {
    color: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
  },
});

