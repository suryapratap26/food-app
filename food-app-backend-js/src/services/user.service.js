import User from '../models/User.js';
import jwtUtils from '../utils/jwt.utils.js';
import bcrypt from 'bcryptjs';

class UserService {
  convertToUserResponse(user) {
    return { 
      id: user._id.toString(), 
      email: user.email, 
      name: user.name, 
      role: user.role 
    };
  }

  async loadUserByUsername(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User email does not exist');
    return user;
  }

  async registerUser(request) {
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) throw new Error('User already exists with this email.');

    const hashedPassword = await bcrypt.hash(request.password, 10);
    
    console.log(`[DEBUG] Registering user: ${request.email}`);
    console.log(`[DEBUG] Hashed Password: ${hashedPassword.substring(0, 10)}...`);

    const user = new User({
      ...request,
      password: hashedPassword,
      role: 'CUSTOMER',
    });

    await user.save();
    return this.convertToUserResponse(user);
  }

  async createAdmin(request) {
    const existingAdmin = await User.findOne({ email: request.email });
    if (existingAdmin) throw new Error('User already exists with this email.');

    const hashedPassword = await bcrypt.hash(request.password, 10);
    const admin = new User({
      ...request,
      password: hashedPassword,
      role: 'ADMIN',
    });

    await admin.save();
    return this.convertToUserResponse(admin);
  }

  async login(request) {
    const user = await this.loadUserByUsername(request.email);

   
    if (!user.password || user.password.length < 10) {
      console.error(`[FATAL] Invalid password hash for user: ${request.email}`);
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(request.password, user.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

     const jwtToken = jwtUtils.generateToken(user);

    return { 
      token: jwtToken, 
      email: user.email, 
      role: user.role 
    };
  }

  async findByUserId(loggedInEmail) {
    const user = await User.findOne({ email: loggedInEmail });
    if (!user) throw new Error('User not found');
    return user._id.toString();
  }
}

export default new UserService();
