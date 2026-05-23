import { Category } from '../models/db.js';

export const listCategories = async (req, res, next) => {
  try {
    // Return all categories in DB (lean, strip __v)
    const list = await Category.find().lean();
    res.status(200).json({
      success: true,
      data: list,
      message: 'Categories listed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const cat = await Category.findOne({ slug });
    if (!cat) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    const subcategories = await Category.find({ parentCategory: cat._id }).lean();

    res.status(200).json({
      success: true,
      data: {
        category: cat,
        subcategories
      },
      message: 'Category retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
};
