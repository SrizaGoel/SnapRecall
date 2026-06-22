module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
          extensions: [
            '.ios.js', '.android.js',
            '.ios.ts', '.android.ts',
            '.ios.tsx', '.android.tsx',
            '.web.js', '.web.ts', '.web.tsx',
            '.js', '.ts', '.tsx', '.json',
          ],
        },
      ],
    ],
  };
};
