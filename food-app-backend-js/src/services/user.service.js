import User from '../models/User.js';
import jwtUtils from '../utils/jwt.utils.js';
import bcrypt from 'bcryptjs';

class UserService {
  sanitizeLocation(location = {}) {
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return { lat, lng };
  }

  sanitizeAddress(address = {}) {
    return {
      firstName: address.firstName?.trim() || '',
      lastName: address.lastName?.trim() || '',
      phone: address.phone?.trim() || '',
      line1: address.line1?.trim() || '',
      city: address.city?.trim() || '',
      state: address.state?.trim() || '',
      country: address.country?.trim() || 'IN',
      zipcode: address.zipcode?.trim() || ''
    };
  }

  formatAddress(address = {}) {
    return [
      `${address.firstName || ''} ${address.lastName || ''}`.trim(),
      address.line1,
      address.city,
      address.state,
      address.country,
      address.zipcode
    ]
      .filter(Boolean)
      .join(', ');
  }

  convertToUserResponse(user) {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      phoneNumber: user.phoneNumber || '',
      location: user.location || null,
      savedAddress: user.savedAddress || null,
      restaurantProfile: user.restaurantProfile || null
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

    const role = request.role === 'RESTAURANT' ? 'RESTAURANT' : 'CUSTOMER';
    const savedAddress = request.savedAddress
      ? this.sanitizeAddress(request.savedAddress)
      : undefined;
    const location = this.sanitizeLocation(request.location);
    const restaurantAddress = request.restaurantProfile?.address
      ? this.sanitizeAddress(request.restaurantProfile.address)
      : undefined;
    const restaurantLocation = this.sanitizeLocation(
      request.restaurantProfile?.location
    );

    const user = new User({
      name:
        role === 'RESTAURANT'
          ? request.restaurantProfile?.restaurantName?.trim() || request.name
          : request.name,
      email: request.email,
      password: hashedPassword,
      role,
      status: role === 'RESTAURANT' ? 'PENDING' : 'ACTIVE',
      phoneNumber: request.phoneNumber?.trim() || savedAddress?.phone || '',
      location,
      savedAddress,
      restaurantProfile:
        role === 'RESTAURANT'
          ? {
              restaurantName:
                request.restaurantProfile?.restaurantName?.trim() || request.name,
              address: restaurantAddress,
              location: restaurantLocation || location,
              deliveryRadiusKm:
                Number(request.restaurantProfile?.deliveryRadiusKm) || 10
            }
          : undefined
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

    if (user.role === 'RESTAURANT' && user.status !== 'ACTIVE') {
      throw new Error(
        user.status === 'PENDING'
          ? 'Restaurant account is pending admin approval.'
          : 'Restaurant account has not been approved.'
      );
    }

   
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
      role: user.role,
      name: user.name,
      profile: this.convertToUserResponse(user)
    };
  }

  async findByUserId(loggedInEmail) {
    const user = await User.findOne({ email: loggedInEmail });
    if (!user) throw new Error('User not found');
    return user._id.toString();
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return this.convertToUserResponse(user);
  }

  async upsertProfile(userId, request) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (request.name?.trim()) user.name = request.name.trim();
    if (request.phoneNumber?.trim()) user.phoneNumber = request.phoneNumber.trim();

    const location = this.sanitizeLocation(request.location);
    if (location) user.location = location;

    if (request.savedAddress) {
      const savedAddress = this.sanitizeAddress(request.savedAddress);
      user.savedAddress = savedAddress;
      if (savedAddress.phone) user.phoneNumber = savedAddress.phone;
    }

    await user.save();
    return this.convertToUserResponse(user);
  }

  async getPendingRestaurants() {
    const restaurants = await User.find({
      role: 'RESTAURANT',
      status: 'PENDING'
    }).sort({ createdAt: -1 });

    return restaurants.map((restaurant) => this.convertToUserResponse(restaurant));
  }

  async updateRestaurantApproval(restaurantId, status) {
    const nextStatus = (status || '').toUpperCase();
    if (!['ACTIVE', 'REJECTED'].includes(nextStatus)) {
      throw new Error('Invalid restaurant approval status.');
    }

    const restaurant = await User.findById(restaurantId);
    if (!restaurant || restaurant.role !== 'RESTAURANT') {
      throw new Error('Restaurant not found.');
    }

    restaurant.status = nextStatus;
    await restaurant.save();
    return this.convertToUserResponse(restaurant);
  }
}

export default new UserService();
