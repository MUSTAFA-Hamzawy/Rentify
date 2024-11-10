import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import * as path from 'path';

import {
  ROOT_PATH,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_NUM_OF_IMAGES_PER_CAR,
} from './app.config';
import { ConflictException } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      if (!fs.existsSync(path.join(ROOT_PATH, 'uploads')))
        fsPromises.mkdir(path.join(ROOT_PATH, 'uploads'));

      callback(null, path.join(ROOT_PATH, 'uploads'));
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-`;
      callback(null, uniqueSuffix + file.originalname);
    },
  }),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: MAX_NUM_OF_IMAGES_PER_CAR,
  },
  fileFilter: (req, file, callback) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new ConflictException('Unsupported file type'), false);
    }
  },
};
