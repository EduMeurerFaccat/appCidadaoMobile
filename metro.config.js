const { getDefaultConfig } = require('expo/metro-config'); // ou 'metro-config' para projetos sem Expo

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
  config.resolver.sourceExts.push('svg');

  return config;
})();
