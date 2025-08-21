import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

import { ENV } from "@/config/env";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class FileService {
  constructor() {
    cloudinary.config({
      cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
      api_key: ENV.CLOUDINARY_API_KEY,
      api_secret: ENV.CLOUDINARY_API_SECRET,
    });
  }

  async upload(file: Express.Multer.File) {
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "shuvo-flix" }, (error, uploadResult) => {
          if (error) {
            reject(error);
          }
          if (uploadResult) {
            resolve(uploadResult);
          } else {
            reject(new InternalServerErrorException("Failed to upload file to cloud"));
          }
        })
        .end(file.buffer);
    });
    return {
      url: uploadResult.secure_url,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
    };
  }
}
