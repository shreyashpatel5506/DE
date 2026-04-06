export const env = {
  NODE_ENV: process.env.NODE_ENV || process.env.env || "development",
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/ImproveInfrastructure",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER: process.env.BREVO_SENDER,
  BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
};
