
import { cleanDir, makeDir, writeFile } from '../tools/fs';

/**
 * Cleans up the output (build) directory.
 */
function clean() {
  return Promise.all([
    cleanDir('dist', {
      nosort: true,
      dot: true,
      ignore: [],
    }),
    makeDir('dist')
  ]);
}

export default clean;
