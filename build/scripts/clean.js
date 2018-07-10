
import { cleanDir } from '../tools/fs';

/**
 * Cleans up the output (build) directory.
 */
function clean() {
  return Promise.all([
    cleanDir('dist/*', {
      nosort: true,
      dot: true,
      ignore: ['dist/.git','dist/dll/*'],
    }),
  ]);
}

export default clean;
