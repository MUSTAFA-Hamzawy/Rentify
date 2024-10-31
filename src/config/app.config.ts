import * as path from 'path';

const ROOT_PATH: string = path.join(__dirname, '..', '..');
const UPLOADS_PATH: string = path.join(ROOT_PATH, 'uploads');
const SRC_PATH: string = path.join(ROOT_PATH, 'src');
const API_PATH: string = path.join(SRC_PATH, 'api', 'v1');

const ALLOWED_IMAGE_MIME_TYPES: string[] = ['image/jpeg', 'image/png'];
const ALLOWED_IMAGE_TYPES: string[] = ['jpeg', 'png'];
const MAX_IMAGE_SIZE: number = 5 * 1024 * 1024; // 5 MB

export {
  ROOT_PATH,
  UPLOADS_PATH,
  SRC_PATH,
  API_PATH,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
};
