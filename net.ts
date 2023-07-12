import * as fs from 'fs';

import axios, { AxiosResponse } from 'axios';

import cliProgress, { SingleBar } from 'cli-progress';
import theme from "./style.js";

interface DownloadProgress {
  totalLength: number;
  downloadedLength: number;
  progressBar: SingleBar;
}

export async function downloadFile (url: string, destination: string): Promise<void> {
  const writer = fs.createWriteStream(destination)

  const response: AxiosResponse = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const totalLength: number = parseInt(response.headers['content-length'] || '0', 10);
  let downloadedLength: number = 0;

  console.log ( theme.info ( `Downloading ${ url } to ${ destination }` ) )
  const progressBar: SingleBar = new cliProgress.SingleBar({
    format: `{bar} | {percentage}% | ETA: {eta}s | {value}/{total} bytes`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(totalLength, 0);

  response.data.on('data', (chunk: Buffer) => {
    downloadedLength += chunk.length;
    progressBar.update(downloadedLength);
  });

  response.data.pipe(writer);

  return new Promise<void>((resolve, reject) => {
    writer.on('finish', () => {
      progressBar.stop();
      resolve();
    });
    writer.on('error', reject);
  });
};