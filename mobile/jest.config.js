module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo|expo-router|expo-status-bar|nativewind|moti|@react-native-async-storage)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
