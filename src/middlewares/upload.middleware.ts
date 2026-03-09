// @ts-ignore

// import * as multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "companio_profiles",
//     allowed_formats: ["jpg", "jpeg", "png"],
//   } as any,
// });

// export const upload = multer.default({ storage });





const multer = require("multer");
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "companio_profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
} as any);

// Export upload middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});




// const multer = require("multer");
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "companio_profiles",
//     allowed_formats: ["jpg", "jpeg", "png"],
//   },
// } as any);

// export const upload = multer({
//   storage,
//   limits: {
//     fileSize: 2 * 1024 * 1024,
//   },
// });