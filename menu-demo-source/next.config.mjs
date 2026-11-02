import path from 'node:path';
import {fileURLToPath} from 'node:url';

export default {
  output:'export',
  basePath:'/menu-demo',
  trailingSlash:true,
  poweredByHeader:false,
  outputFileTracingRoot:path.dirname(fileURLToPath(import.meta.url)),
};
