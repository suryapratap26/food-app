import Food from '../models/Food.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { promisify } from 'util';
const unlinkFile = promisify(fs.unlink);

class FoodService {
  // Helpers
  convertFoodIntoResponse(food) {
    return {
      id: food._id.toString(),
      name: food.name,
      description: food.description,
      imageUrl: food.imageUrl,
      price: food.price,
      category: food.category,
    };
  }

  convertRequestIntoFood(request) {
    return new Food({
      name: request.name,
      description: request.description,
      price: request.price,
      category: request.category,
    });
  }

  extractPublicIdFromUrl(imageUrl) {
    if (!imageUrl) return null;
    // remove query params
    let url = imageUrl.split('?')[0];
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let pathAndFile = parts[1]; // after /upload/
    const slashIndex = pathAndFile.indexOf('/');
    if (slashIndex !== -1) {
      pathAndFile = pathAndFile.substring(slashIndex + 1);
    }
    if (pathAndFile.includes('.')) {
      pathAndFile = pathAndFile.substring(0, pathAndFile.lastIndexOf('.'));
    }
    return pathAndFile;
  }

  async uploadFile(file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'food-delivery-app',
      });
      await unlinkFile(file.path);
      return uploadResult.secure_url;
    } catch (e) {
      await unlinkFile(file.path).catch((err) =>
        console.error('Cleanup failed:', err)
      );
      throw new Error('Failed to upload image to Cloudinary.');
    }
  }

  async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (e) {
      return false;
    }
  }

  // Core methods
  async addFood(foodRequest, file) {
    const food = this.convertRequestIntoFood(foodRequest);
    const foodUrl = await this.uploadFile(file);

    food.imageUrl = foodUrl;
    await food.save();
    return this.convertFoodIntoResponse(food);
  }

  async getFoods() {
    const foods = await Food.find({});
    return foods.map((f) => this.convertFoodIntoResponse(f));
  }

  async getFoodById(id) {
    const food = await Food.findById(id);
    if (!food) throw new Error(`Invalid food ID: ${id}`);
    return this.convertFoodIntoResponse(food);
  }

  async deleteFood(id) {
    const foodResponse = await this.getFoodById(id);
    const publicId = this.extractPublicIdFromUrl(foodResponse.imageUrl);

    const isFileDeleted = await this.deleteFile(publicId);
    if (isFileDeleted) {
      await Food.findByIdAndDelete(foodResponse.id);
    } else {
      throw new Error('Failed to delete image from Cloudinary.');
    }
  }
}

export default new FoodService();
