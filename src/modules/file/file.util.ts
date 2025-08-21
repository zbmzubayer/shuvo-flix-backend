import { BadRequestException } from "@nestjs/common";
import { type FileInterceptor } from "@nestjs/platform-express";

export const validateUploadedFile: Parameters<typeof FileInterceptor>[1] = {
  // File Upload Validation
  fileFilter: (_req, file, cb) => {
    if (file && file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException("Only jpg, jpeg, png, gif, webp, svg are allowed"), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
    files: 1,
  },
};
