function cleanEnv(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  return value.trim().replace(/^['\"]|['\"]$/g, "");
}

export const env = {
  NODE_ENV: cleanEnv(process.env.NODE_ENV || process.env.env, "development"),
  APP_BASE_URL:
    cleanEnv(process.env.APP_BASE_URL) ||
    cleanEnv(process.env.NEXT_PUBLIC_APP_URL) ||
    "http://localhost:3000",
  MONGODB_URI:
    cleanEnv(process.env.MONGODB_URI) ||
    "mongodb://localhost:27017/ImproveInfrastructure",
  JWT_SECRET: cleanEnv(process.env.JWT_SECRET, "dev-secret-key"),
  CLOUDINARY_CLOUD_NAME: cleanEnv(process.env.CLOUDINARY_CLOUD_NAME),
  CLOUDINARY_API_KEY: cleanEnv(process.env.CLOUDINARY_API_KEY),
  CLOUDINARY_API_SECRET: cleanEnv(process.env.CLOUDINARY_API_SECRET),
  BREVO_API_KEY: cleanEnv(process.env.BREVO_API_KEY),
  BREVO_SENDER: cleanEnv(process.env.BREVO_SENDER),
  BREVO_SMTP_USER: cleanEnv(process.env.BREVO_SMTP_USER),
  CONTACT_RECEIVER_EMAIL: cleanEnv(process.env.CONTACT_RECEIVER_EMAIL),
};
