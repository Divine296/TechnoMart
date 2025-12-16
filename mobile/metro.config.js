const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure Metro handles .ts, .tsx, and .cjs files
config.resolver.sourceExts.push('cjs', 'ts', 'tsx');

module.exports = withNativeWind(config, { input: './global.css' });
