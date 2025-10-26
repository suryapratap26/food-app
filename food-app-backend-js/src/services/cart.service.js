import Cart from '../models/Cart.js';

class CartService {
  convertToResponse(cart) {
    return {
      id: cart._id.toString(),
      userId: cart.userId,
      items: cart.items ? Object.fromEntries(cart.items) : {},
    };
  }

  async addToCart(userId, cartRequest) {
    const { foodId } = cartRequest;
    let cart = await Cart.findByUserId(userId);

    if (!cart) {
      cart = new Cart({ userId: userId, items: new Map() });
    }

    const cartItems = cart.items;
    const currentQty = cartItems.get(foodId) || 0;

    cartItems.set(foodId, currentQty + 1);

    await cart.save();
    return this.convertToResponse(cart);
  }

  async getCart(userId) {
    const cart = await Cart.findByUserId(userId);
    return this.convertToResponse(
      cart || new Cart({ userId: userId, items: new Map() })
    );
  }

  async clearCart(userId) {
    await Cart.deleteByUserId(userId);
  }

  async removeFromCart(userId, cartRequest) {
    const { foodId } = cartRequest;
    const cart = await Cart.findByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    const cartItems = cart.items;

    if (cartItems.has(foodId)) {
      const currentQty = cartItems.get(foodId);

      if (currentQty > 1) {
        cartItems.set(foodId, currentQty - 1);
      } else {
        cartItems.delete(foodId);
      }

      await cart.save();
      return this.convertToResponse(cart);
    }
    return null;
  }
}

export default new CartService();
