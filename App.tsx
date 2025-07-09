import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import Game from './src/game/Game';
import { COLORS } from './src/constants/gameConstants';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={'light-content'} backgroundColor={COLORS.black} />
      <View style={styles.container}>
        <Game />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
  },
});

export default App;
