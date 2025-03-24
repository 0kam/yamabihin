const defaultResolver = require('jest-resolve/build/defaultResolver').default;
const path = require('path');

module.exports = (request, options) => {
  // @chakra-ui/utils/contextの特別なハンドリング
  if (request === '@chakra-ui/utils/context') {
    const utilsPath = path.dirname(require.resolve('@chakra-ui/utils/package.json'));
    return defaultResolver(path.join(utilsPath, 'dist/cjs/context'), options);
  }

  // その他のChakra UIモジュールのハンドリング
  if (request.startsWith('@chakra-ui/')) {
    try {
      // まずCJSバージョンを試す
      const modifiedPath = request.includes('/dist/')
        ? request.replace('/dist/', '/dist/cjs/')
        : request;
      return defaultResolver(modifiedPath, options);
    } catch (e) {
      try {
        // 次にdistディレクトリを試す
        return defaultResolver(request + '/dist/cjs', options);
      } catch (e2) {
        // 最後に通常のパスを試す
        return defaultResolver(request, options);
      }
    }
  }

  // その他のモジュールは通常通り解決
  return defaultResolver(request, options);
};