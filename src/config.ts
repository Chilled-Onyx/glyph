import { existsSync as fileExists, readFileSync as readFile } from 'node:fs';

let config = {
  httpPort: 80,
  caching: true,
  cacheClearingIntervalSeconds: 60
};

if(fileExists('.env')) {
  const configFile = JSON.parse(readFile('.env').toString());
  config = Object.assign(config, configFile);
}

export default config;