d/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { Canvas, useValue, runTiming, useComputedValue, rect, LinearGradient, vec, Group } from '@shopify/react-native-skia';
import { useEffect } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Animation value for gradient
  const t = useValue(0);
  useEffect(() => {
    runTiming(t, 1, { duration: 6000, loop: true, yoyo: true });
  }, [t]);

  // Animated gradient colors
  const colors = useComputedValue(() => {
    const progress = t.current;
    return [
      `rgba(${Math.floor(255 * progress)}, 100, 200, 1)`,
      `rgba(100, ${Math.floor(255 * (1 - progress))}, 255, 1)`,
      `rgba(255, 255, ${Math.floor(255 * progress)}, 1)`
    ];
  }, [t]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(400, 800)}
            colors={colors}
            positions={[0, 0.5, 1]}
          >
            {rect(0, 0, 400, 800)}
          </LinearGradient>
        </Group>
      </Canvas>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue sur Games APK</Text>
        <Text style={styles.subtitle}>Découvrez et lancez vos jeux préférés !</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Explorer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>À propos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
