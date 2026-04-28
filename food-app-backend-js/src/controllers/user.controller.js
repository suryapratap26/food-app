import userService from '../services/user.service.js';

class UserController {
  async registerUser(req, res) {
    try {
      const response = await userService.registerUser(req.body);
      res.status(201).json(response);
    } catch (error) {
      console.error('[REGISTER ERROR]', error.message);
      res.status(400).send({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const response = await userService.login(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.error('[LOGIN ERROR]', error.message);
      res.status(401).send({ message: error.message || 'Invalid email or password.' });
    }
  }

  async createAdmin(req, res) {
    try {
      const response = await userService.createAdmin(req.body);
      res.status(201).json(response);
    } catch (error) {
      console.error('[CREATE ADMIN ERROR]', error.message);
      res.status(400).send({ message: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const response = await userService.getProfile(req.userId);
      res.status(200).json(response);
    } catch (error) {
      console.error('[GET PROFILE ERROR]', error.message);
      res.status(404).send({ message: error.message });
    }
  }

  async upsertProfile(req, res) {
    try {
      const response = await userService.upsertProfile(req.userId, req.body);
      res.status(200).json(response);
    } catch (error) {
      console.error('[UPSERT PROFILE ERROR]', error.message);
      res.status(400).send({ message: error.message });
    }
  }

  async getPendingRestaurants(req, res) {
    try {
      const response = await userService.getPendingRestaurants();
      res.status(200).json(response);
    } catch (error) {
      console.error('[GET PENDING RESTAURANTS ERROR]', error.message);
      res.status(500).send({ message: error.message });
    }
  }

  async updateRestaurantApproval(req, res) {
    try {
      const response = await userService.updateRestaurantApproval(
        req.params.restaurantId,
        req.body.status
      );
      res.status(200).json(response);
    } catch (error) {
      console.error('[UPDATE RESTAURANT APPROVAL ERROR]', error.message);
      res.status(400).send({ message: error.message });
    }
  }
}

export default new UserController();
