import Food from '../models/Food.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { promisify } from 'util';
const unlinkFile = promisify(fs.unlink);

class FoodService {
  buildRatingSummary(food) {
    return {
      ratingAverage: Number((food.ratingAverage || 0).toFixed(1)),
      reviewCount: food.reviewCount || 0
    };
  }

  normalizeReview(review) {
    return {
      id: review._id?.toString?.() || '',
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.createdAt
    };
  }

  recalculateRatings(food) {
    const reviewCount = food.reviews.length;
    const total = food.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    food.reviewCount = reviewCount;
    food.ratingAverage = reviewCount ? Number((total / reviewCount).toFixed(1)) : 0;
  }

  convertFoodIntoResponse(food) {
    return {
      id: food._id.toString(),
      name: food.name,
      description: food.description,
      imageUrl: food.imageUrl,
      price: food.price,
      category: food.category,
      restaurantId: food.restaurantId,
      restaurantName: food.restaurantName,
      restaurantLocation: food.restaurantLocation || null,
      deliveryRadiusKm: food.deliveryRadiusKm || 10,
      ...this.buildRatingSummary(food)
    };
  }

  convertFoodDetailIntoResponse(food) {
    return {
      ...this.convertFoodIntoResponse(food),
      reviews: (food.reviews || [])
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((review) => this.normalizeReview(review))
    };
  }

  convertRequestIntoFood(request, restaurant) {
    return new Food({
      name: request.name,
      description: request.description,
      price: request.price,
      imageUrl: request.imageUrl?.trim?.() || request.image?.trim?.() || '',
      category: request.category,
      restaurantId: restaurant._id.toString(),
      restaurantName:
        restaurant.restaurantProfile?.restaurantName || restaurant.name,
      restaurantLocation:
        restaurant.restaurantProfile?.location || restaurant.location || null,
      deliveryRadiusKm: restaurant.restaurantProfile?.deliveryRadiusKm || 10
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
  async addFood(foodRequest, file, actor) {
    if (!actor || !['ADMIN', 'RESTAURANT'].includes(actor.role)) {
      throw new Error('Only admins or restaurants can add food.');
    }

    const restaurant =
      actor.role === 'RESTAURANT'
        ? await User.findById(actor._id)
        : await User.findById(foodRequest.restaurantId || actor._id);

    if (!restaurant) {
      throw new Error('Restaurant account not found.');
    }
    if (restaurant.role === 'RESTAURANT' && restaurant.status !== 'ACTIVE') {
      throw new Error('Restaurant must be approved before managing food.');
    }

    if (restaurant.role !== 'RESTAURANT' && actor.role !== 'ADMIN') {
      throw new Error('Food items must belong to a restaurant.');
    }

    const food = this.convertRequestIntoFood(foodRequest, restaurant);
    if (file) {
      const foodUrl = await this.uploadFile(file);
      food.imageUrl = foodUrl;
    }

    if (!food.imageUrl) {
      throw new Error('Image is required.');
    }

    await food.save();
    return this.convertFoodIntoResponse(food);
  }

  async getFoods(query = {}) {
    const filters = {};
    if (query.restaurantId) {
      filters.restaurantId = query.restaurantId;
    }
    if (query.managerRestaurantId) {
      filters.restaurantId = query.managerRestaurantId;
    }
    const foods = await Food.find(filters).sort({ createdAt: -1 });
    return foods.map((f) => this.convertFoodIntoResponse(f));
  }

  async getFoodById(id) {
    const food = await Food.findById(id);
    if (!food) throw new Error(`Invalid food ID: ${id}`);
    return this.convertFoodDetailIntoResponse(food);
  }

  async addReview(foodId, reviewRequest, actor) {
    if (!actor || actor.role !== 'CUSTOMER') {
      throw new Error('Only customers can submit reviews.');
    }

    const rating = Number(reviewRequest.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5.');
    }

    const food = await Food.findById(foodId);
    if (!food) throw new Error(`Invalid food ID: ${foodId}`);

    const purchasedOrder = await Order.findOne({
      userId: actor._id.toString(),
      paymentStatus: 'SUCCESS',
      'orderItemsList.foodId': foodId
    });

    if (!purchasedOrder) {
      throw new Error('Please order this food before leaving a review.');
    }

    const comment = reviewRequest.comment?.trim() || '';
    const existingReview = food.reviews.find(
      (review) => review.userId === actor._id.toString()
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.userName = actor.name;
    } else {
      food.reviews.push({
        userId: actor._id.toString(),
        userName: actor.name,
        rating,
        comment
      });
    }

    this.recalculateRatings(food);
    await food.save();
    return this.convertFoodDetailIntoResponse(food);
  }

  async deleteFood(id, actor) {
    const food = await Food.findById(id);
    if (!food) throw new Error(`Invalid food ID: ${id}`);
    if (
      actor?.role === 'RESTAURANT' &&
      food.restaurantId !== actor._id.toString()
    ) {
      throw new Error('You can only delete your own food items.');
    }

    const foodResponse = this.convertFoodIntoResponse(food);
    const publicId = this.extractPublicIdFromUrl(foodResponse.imageUrl);

    if (!publicId) {
      await Food.findByIdAndDelete(foodResponse.id);
      return;
    }

    const isFileDeleted = await this.deleteFile(publicId);
    if (isFileDeleted) {
      await Food.findByIdAndDelete(foodResponse.id);
    } else {
      throw new Error('Failed to delete image from Cloudinary.');
    }
  }
}

export default new FoodService();
