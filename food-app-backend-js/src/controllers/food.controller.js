import foodService from '../services/food.service.js';
import fs from 'fs';

class FoodController {
  async addFood(req, res) {
    const file = req.file;
    let foodRequest;

    if (typeof req.body.food === 'string') {
      try {
        foodRequest = JSON.parse(req.body.food);
      } catch (e) {
        if (file?.path) {
          try { fs.unlinkSync(file.path); } catch (err) { /* ignore cleanup error */ }
        }
        return res.status(400).send({ message: 'Invalid JSON format for food data.' });
      }
    } else {
      foodRequest = req.body;
    }

    try {
      const response = await foodService.addFood(foodRequest, file, req.user);
      res.status(201).json(response);
    } catch (error) {
      console.error('Error adding food:', error.message);
      res.status(500).send({ message: error.message });
    }
  }

  async getFoods(req, res) {
    try {
      const response = await foodService.getFoods(req.query);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).send({ message: 'Failed to retrieve food list.' });
    }
  }

  async getFoodById(req, res) {
    try {
      const response = await foodService.getFoodById(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  }

  async deleteFood(req, res) {
    try {
      await foodService.deleteFood(req.params.id, req.user);
      res.status(204).end();
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }

  async addReview(req, res) {
    try {
      const response = await foodService.addReview(
        req.params.id,
        req.body,
        req.user
      );
      res.status(201).json(response);
    } catch (error) {
      const message = error.message || 'Failed to save review.';
      const status =
        message.includes('Only customers') || message.includes('Please order')
          ? 403
          : message.includes('Invalid food ID')
          ? 404
          : message.includes('Rating must')
          ? 400
          : 500;
      res.status(status).json({ message });
    }
  }
}

export default new FoodController();
