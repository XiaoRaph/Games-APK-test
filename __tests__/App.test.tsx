/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const MockComponent = ({children}: any) => <>{children}</>;
  return {
    Canvas: MockComponent,
    Circle: 'Circle',
    Group: MockComponent,
  };
}, { virtual: true });

jest.mock('react-native-reanimated', () => ({
  useSharedValue: (val: any) => ({ value: val }),
  useDerivedValue: (fn: any) => fn(),
  withRepeat: (animation: any) => animation,
  withTiming: (value: any) => value,
}));

import App from '../App';

import { Text } from 'react-native';

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const texts = renderer!.root.findAllByType(Text);
  const hasBienvenue = texts.some(t => {
    const content = Array.isArray(t.props.children)
      ? t.props.children.join('')
      : t.props.children;
    return typeof content === 'string' && content.includes('Bienvenue sur Games APK');
  });
  expect(hasBienvenue).toBe(true);
});
