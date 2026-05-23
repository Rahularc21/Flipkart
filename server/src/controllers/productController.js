import { Product, Category } from '../models/db.js';

export const listProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      rating,
      discount,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // 1. Text search / pattern match (case-insensitive substring match)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category Filter (supports category slug or category ID)
    if (category) {
      const resolvedCategory = await Category.findOne({ slug: category });
      if (resolvedCategory) {
        query.category = resolvedCategory._id;
      } else {
        // Fallback to direct ID match if it's already an ID
        query.category = category;
      }
    }

    // 3. Price Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 4. Brands Filter (splits comma values if provided, e.g., "Apple,Samsung")
    if (brand) {
      const brandList = brand.split(',').map(b => b.trim());
      query.brand = { $in: brandList };
    }

    // 5. Customer Rating Filter
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    // 6. Discount slab filter
    if (discount) {
      query.discount = { $gte: Number(discount) };
    }

    // Determine Sort options
    let sortOption = {};
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { 'ratings.average': -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      // Default: popularity/soldCount descending
      sortOption = { soldCount: -1 };
    }

    const skipIndex = (Number(page) - 1) * Number(limit);

    // Run queries
    const totalCount = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skipIndex)
      .limit(Number(limit))
      .populate('category')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
        currentPage: Number(page)
      },
      message: 'Products queried successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getProductDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id).lean();
    
    // Fallback: try querying by slug if matching
    if (!product) {
      // Search by standard slug matching of the title
      const prods = await Product.find({}).lean();
      product = prods.find(p => p._id === id || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === id);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Populate category if string ID
    if (product.category && typeof product.category === 'string') {
      product.category = await Category.findById(product.category).lean();
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const addProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const newReview = {
      userName: req.user.name || 'Anonymous Purchaser',
      rating: Number(rating),
      reviewText,
      createdAt: new Date()
    };

    product.reviews = product.reviews || [];
    product.reviews.push(newReview);

    // Recalculating average rating
    const totalRatings = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc, obj) => acc + obj.rating, 0);
    const averageRating = Number((sumRatings / totalRatings).toFixed(1));

    product.ratings = {
      average: averageRating,
      count: totalRatings
    };

    // Save update inside our DB
    const updated = await Product.findByIdAndUpdate(id, {
      reviews: product.reviews,
      ratings: product.ratings
    });

    res.status(200).json({
      success: true,
      data: {
        average: averageRating,
        count: totalRatings,
        reviews: product.reviews
      },
      message: 'Review recorded successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsByCategory = async (req, res, next) => {
  try {
    // Inject the slug parameter into req.query for listProducts reuse
    req.query.category = req.params.slug;
    return listProducts(req, res, next);
  } catch (err) {
    next(err);
  }
};
