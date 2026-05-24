import { Cart, Product } from '../models/db.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Populate products
    let populatedCart = await Cart.findOne({ _id: cart._id }).populate('items.product').lean();
    if (!populatedCart) {
      populatedCart = cart;
    }

    // Calculate subtotal
    let subtotal = 0;
    const items = populatedCart.items || [];
    items.forEach(item => {
      if (item.product) {
        subtotal += Number(item.price) * Number(item.quantity);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        items,
        subtotal
      },
      message: 'Cart retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    cart.items = cart.items || [];
    const itemIndex = cart.items.findIndex(item => item.product?.toString() === productId.toString());

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
      cart.items[itemIndex].price = product.price; // update latest price
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price: product.price
      });
    }

    await Cart.findByIdAndUpdate(cart._id, { items: cart.items });

    // Retrieve populated cart to return
    const updatedCart = await Cart.findOne({ _id: cart._id }).populate('items.product').lean();
    let subtotal = 0;
    updatedCart.items.forEach(item => {
      if (item.product) {
        subtotal += Number(item.price) * Number(item.quantity);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        items: updatedCart.items,
        subtotal
      },
      message: 'Product added to cart successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    cart.items = cart.items || [];
    const itemIndex = cart.items.findIndex(item => item._id?.toString() === itemId.toString() || item.product?.toString() === itemId.toString());

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }

    if (Number(quantity) <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    await Cart.findByIdAndUpdate(cart._id, { items: cart.items });

    const updatedCart = await Cart.findOne({ _id: cart._id }).populate('items.product').lean();
    let subtotal = 0;
    updatedCart.items.forEach(item => {
      if (item.product) {
        subtotal += Number(item.price) * Number(item.quantity);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        items: updatedCart.items,
        subtotal
      },
      message: 'Cart item updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    cart.items = cart.items || [];
    cart.items = cart.items.filter(item => item._id?.toString() !== itemId.toString() && item.product?.toString() !== itemId.toString());

    await Cart.findByIdAndUpdate(cart._id, { items: cart.items });

    const updatedCart = await Cart.findOne({ _id: cart._id }).populate('items.product').lean();
    let subtotal = 0;
    updatedCart.items.forEach(item => {
      if (item.product) {
        subtotal += Number(item.price) * Number(item.quantity);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        items: updatedCart.items,
        subtotal
      },
      message: 'Cart item removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      await Cart.findByIdAndUpdate(cart._id, { items: [] });
    }

    res.status(200).json({
      success: true,
      data: {
        items: [],
        subtotal: 0
      },
      message: 'Cart cleared successfully.'
    });
  } catch (err) {
    next(err);
  }
};
