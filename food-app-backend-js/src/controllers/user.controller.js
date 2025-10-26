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
      res.status(401).send({ message: 'Invalid email or password.' });
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
}

export default new UserController();
