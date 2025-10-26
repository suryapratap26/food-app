import { v2 as cloudinary } from 'cloudinary';

// Define the function
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  });
  console.log('✅ Cloudinary configured.');
};

// Export it as a default module export
export default configureCloudinary;
