import { v2 as cloudinary } from "cloudinary";
import type { Request } from "express";
import fs from "fs";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { env } from "../config/env";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});
const uploadDir = "/uploads";

const fullUploadDir = path.join(process.cwd(), uploadDir);

if (!fs.existsSync(fullUploadDir)) {
  fs.mkdirSync(fullUploadDir, { recursive: true });
}

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(file.originalname.toLowerCase());

  if (mimeType && extName) {
    callback(null, true);
  } else {
    callback(new Error("Only images and PDF files are allowed!"));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, fullUploadDir);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const deleteLocalFile = async (filePath: string) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      console.error(`Failed to delete ${filePath}:`, err.message);
    }
  }
};

const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      public_id: `${path.parse(file.originalname).name}-${Date.now()}`,
      folder: "travel-buddy",
      resource_type: "auto",
    });
    return uploadResult;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  } finally {
    await deleteLocalFile(file.path);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadMultipleToCloudinary = async (files: Express.Multer.File[]) => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
