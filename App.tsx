/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react'; // Added React import
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { Canvas, Circle, Group } from "@shopify/react-native-skia"; // Updated imports
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native'; // Added Dimensions import
import SnakeGame from './SnakeGame';

// Type definition for AnimatedCircle props
type AnimatedCircleProps = {
  color: string;
  size: number;
  centerX: number;
  centerY: number;
  initialAngle: number;
};

// AnimatedCircle component definition
const AnimatedCircle = ({color, size, centerX, centerY, initialAngle}: AnimatedCircleProps) => {
  const distance = size * 0.25;
  const angle = useSharedValue(initialAngle);
  const r_val = useSharedValue(size * 0.3); // Renamed r to r_val to avoid conflict
  const cx = useDerivedValue(
    () => centerX + distance * Math.cos(angle.value)
  );
  const cy = useDerivedValue(
    () => centerY + distance * Math.sin(angle.value)
  );

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(angle.value + Math.PI * 6, { duration: 3000 }),
      -1
    );
  }, [angle]);

  useEffect(() => {
    r_val.value = withRepeat(withTiming(size * 1.15, { duration: 1500 }), -1, true);
  }, [r_val, size]);

  return <Circle cx={cx} cy={cy} r={r_val} color={color} />;
};


// Function definition for the App component
function App() {
  const isDarkMode = useColorScheme() === 'dark'; // Moved inside App
  // const headerHeight = useHeaderHeight(); // Assuming no header or headerHeight is 0 for now
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const size = screenWidth * 0.33;
  const centerX = screenWidth / 2;
  // const centerY = screenHeight / 2 - headerHeight; // Adjusted for no headerHeight
  const centerY = screenHeight / 2; // Canvas centered vertically using screenHeight

  // Define fixed height for the canvas for now
  const canvasHeight = screenHeight * 0.6; // Canvas takes 60% of screen height
  const [screen, setScreen] = useState<'home' | 'settings' | 'game'>('home');
  const [speed, setSpeed] = useState(300); // default slow

  const HomeScreen = () => (
    <>
      <View style={{height: canvasHeight, width: '100%'}}>
        <Canvas style={{ flex: 1 }}>
          <Group blendMode="multiply">
                {/* centerX and centerY reference canvasHeight to center the circles within the canvas */}
                <AnimatedCircle centerX={screenWidth / 2} centerY={canvasHeight / 2} size={size} initialAngle={0} color="cyan" />
                <AnimatedCircle centerX={screenWidth / 2} centerY={canvasHeight / 2} size={size} initialAngle={(Math.PI * 2) / 3}  color="magenta" />
                <AnimatedCircle centerX={screenWidth / 2} centerY={canvasHeight / 2} size={size} initialAngle={(Math.PI * 4) / 3}  color="yellow" />
              </Group>
            </Canvas>
          </View>

          {/* Content View is now below the Canvas */}
          <View style={styles.content}>
            <Text style={styles.title}>Bienvenue sur Games APK</Text>
            <Text style={styles.subtitle}>Découvrez et lancez vos jeux préférés !</Text>
        <TouchableOpacity style={styles.button} onPress={() => setScreen('settings')}>
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Explorer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>À propos</Text>
            </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {screen === 'home' && (
        <HomeScreen />
      )}
      {screen === 'settings' && (
        <View style={styles.content}>
          <Text style={styles.title}>Choisissez la vitesse</Text>
          <TouchableOpacity style={styles.button} onPress={() => {setSpeed(300); setScreen('game');}}>
            <Text style={styles.buttonText}>Lent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {setSpeed(200); setScreen('game');}}>
            <Text style={styles.buttonText}>Moyen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {setSpeed(100); setScreen('game');}}>
            <Text style={styles.buttonText}>Rapide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setScreen('home')}>
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      )}
      {screen === 'game' && (
        <SnakeGame initialSpeed={speed} onExit={() => setScreen('home')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column', // Arrange canvas and content vertically
    // backgroundColor: '#000', // Keep commented out or set a page background
    alignItems: 'center', // Center items horizontally
    justifyContent: 'flex-start', // Start content from the top
  },
  content: {
    // position: 'absolute', // Removed absolute positioning
    // top: 0, // Removed
    // left: 0, // Removed
    // right: 0, // Removed
    // bottom: 0, // Removed
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex: 2, // Removed
    paddingVertical: 20, // Add some padding
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 32,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default App;
