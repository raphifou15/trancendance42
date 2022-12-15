import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  console.log(env)
  const fallback: string = '/backend/.env';
  console.log(fallback)
  const filename: string = env ? `${env}.env` : 'development.env';
  console.log(filename)
  let filePath: string = resolve(`${dest}/${filename}`);

  if (!existsSync(filePath)) {
    filePath = fallback;
  }
  console.log(filePath)
  return filePath;
}