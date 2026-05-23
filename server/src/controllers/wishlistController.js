import { Wishlist, Product } from '../models/db.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const populated = await Wishlist.findOne({ _id: wishlist._id }).populate('products').lean();
    res.status(200).json({
      success: true,
      data: populated ? populated.products : [],
      message: 'Wishlist retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    wishlist.products = wishlist.products || [];
    const index = wishlist.products.findIndex(id => id.toString() === productId.toString());

    let message;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      message = 'Product removed from wishlist.';
    } else {
      wishlist.products.push(productId);
      message = 'Product added to wishlist.';
    }

    await Wishlist.findByIdAndUpdate(wishlist._id, { products: wishlist.products });

    const updated = await Wishlist.findOne({ _id: wishlist._id }).populate('products').lean();

    res.status(200).json({
      success: true,
      data: updated ? updated.products : [],
      message
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(200).json({ success: true, data: [] });
    }

    wishlist.products = wishlist.products || [];
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId.toString());

    await Wishlist.findByIdAndUpdate(wishlist._id, { products: wishlist.products });
    const updated = await Wishlist.findOne({ _id: wishlist._id }).populate('products').lean();

    res.status(200).json({
      success: true,
      data: updated ? updated.products : [],
      message: 'Product removed from wishlist.'
    });
  } catch (err) {
    next(err);
  }
};
