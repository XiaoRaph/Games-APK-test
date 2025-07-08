/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react'; // Added React import
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { Canvas, Circle, Group } from "@shopify/react-native-skia"; // Updated imports

// Function definition for the App component
function App() {
  const isDarkMode = useColorScheme() === 'dark'; // Moved inside App
  const width = 256;
  const height = 256;
  const r = width * 0.33;

  return (
    <View style={styles.container}>
      <Canvas style={{ width, height }}>
        <Group blendMode="multiply">
          <Circle cx={r} cy={r} r={r} color="cyan" />
          <Circle cx={width - r} cy={r} r={r} color="magenta" />
          <Circle cx={width / 2} cy={width - r} r={r} color="yellow" />
        </Group>
      </Canvas>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {/* The content View is kept, but it might be covered by the Canvas depending on styling.
          The user might want to adjust the layout further. */}
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
    // backgroundColor: '#000', // Commented out as Canvas might provide background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute', // This will overlay the content on top of the canvas
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
