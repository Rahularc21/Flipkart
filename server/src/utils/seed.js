import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Category, Product } from '../models/db.js';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', image: 'https://picsum.photos/seed/electronics-icon/200/200', level: 0 },
  { name: 'Mobiles', slug: 'mobiles', image: 'https://picsum.photos/seed/mobiles-icon/200/200', level: 0 },
  { name: 'Laptops', slug: 'laptops', image: 'https://picsum.photos/seed/laptops-icon/200/200', level: 0 },
  { name: 'TVs', slug: 'tvs', image: 'https://picsum.photos/seed/tvs-icon/200/200', level: 0 },
  { name: 'Fashion', slug: 'fashion', image: 'https://picsum.photos/seed/fashion-icon/200/200', level: 0 },
  { name: 'Home & Furniture', slug: 'home-furniture', image: 'https://picsum.photos/seed/home-furniture-icon/200/200', level: 0 },
  { name: 'Appliances', slug: 'appliances', image: 'https://picsum.photos/seed/appliances-icon/200/200', level: 0 },
  { name: 'Beauty', slug: 'beauty', image: 'https://picsum.photos/seed/beauty-icon/200/200', level: 0 }
];

const BRANDS = {
  electronics: ['Sony', 'Bose', 'Noise', 'boAt', 'JBL', 'Sennheiser'],
  mobiles: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Realme'],
  laptops: ['Apple', 'Dell', 'HP', 'Asus', 'Lenovo', 'Acer'],
  tvs: ['LG', 'Sony', 'Samsung', 'Mi', 'OnePlus', 'TCL'],
  fashion: ['Nike', 'Adidas', 'Puma', 'Levis', 'Zara', 'Roadster'],
  'home-furniture': ['Sleepwell', 'Nilkamal', 'Urban Ladder', 'IKEA', 'Durian'],
  appliances: ['Whirlpool', 'LG', 'Samsung', 'Godrej', 'Daikin', 'IFB'],
  beauty: ['Loreal', 'Nivea', 'The Body Shop', 'Maybelline', 'Mamaearth', 'Clinique']
};

const PRODUCT_TEMPLATES = [
  // 1. ELECTRONICS (8 items)
  { cat: 'electronics', name: 'Z100 Active Noise Cancelling Headphones', brand: 'Sony', basePrice: 24999, originalPrice: 29999 },
  { cat: 'electronics', name: 'SoundLink Flex Waterproof Wireless Speaker', brand: 'Bose', basePrice: 12900, originalPrice: 15900 },
  { cat: 'electronics', name: 'ColorFit Pro 5 Smartwatch with Bluetooth Calling', brand: 'Noise', basePrice: 3499, originalPrice: 4999 },
  { cat: 'electronics', name: 'Airdopes 131 Pro True Wireless Earbuds', brand: 'boAt', basePrice: 1499, originalPrice: 2990 },
  { cat: 'electronics', name: 'Bar 500 Pro 5.1 Channel Home Theatre Soundbar', brand: 'JBL', basePrice: 44999, originalPrice: 59999 },
  { cat: 'electronics', name: 'HD 450BT Wireless Noise Cancelling Headset', brand: 'Sennheiser', basePrice: 8990, originalPrice: 12990 },
  { cat: 'electronics', name: 'Cinema XB200 160W Soundbar with Subwoofer', brand: 'Sony', basePrice: 11999, originalPrice: 16999 },
  { cat: 'electronics', name: 'Smart Fitness Band 7 with AMOLED Display', brand: 'Noise', basePrice: 2499, originalPrice: 3999 },

  // 2. MOBILES (8 items)
  { cat: 'mobiles', name: 'Galaxy S24 Ultra 5G (Titanium Gray, 512GB)', brand: 'Samsung', basePrice: 129999, originalPrice: 139999 },
  { cat: 'mobiles', name: 'iPhone 15 Pro Max (Blue Titanium, 256GB)', brand: 'Apple', basePrice: 148900, originalPrice: 159900 },
  { cat: 'mobiles', name: '12R 5G (Cool Blue, 12GB RAM, 256GB)', brand: 'OnePlus', basePrice: 39999, originalPrice: 42999 },
  { cat: 'mobiles', name: 'Pixel 8 Pro (Bay, 12GB RAM, 128GB)', brand: 'Google', basePrice: 93999, originalPrice: 106999 },
  { cat: 'mobiles', name: 'Redmi Note 13 Pro+ 5G (Fusion Purple, 256GB)', brand: 'Xiaomi', basePrice: 31999, originalPrice: 35999 },
  { cat: 'mobiles', name: '12 Pro 5G (Submarine Blue, 256GB)', brand: 'Realme', basePrice: 25999, originalPrice: 29999 },
  { cat: 'mobiles', name: 'Galaxy A55 5G (Awesome Iceblue, 128GB)', brand: 'Samsung', basePrice: 38200, originalPrice: 42999 },
  { cat: 'mobiles', name: 'iPhone 13 (Midnight Black, 128GB)', brand: 'Apple', basePrice: 48999, originalPrice: 59900 },

  // 3. LAPTOPS (8 items)
  { cat: 'laptops', name: 'MacBook Air M3 (13-inch, 8GB RAM, 256GB SSD)', brand: 'Apple', basePrice: 104900, originalPrice: 114900 },
  { cat: 'laptops', name: 'XPS 13 Evo Core i7 Laptop (Thin & Light)', brand: 'Dell', basePrice: 124999, originalPrice: 149999 },
  { cat: 'laptops', name: 'Pavilion 15 AMD Ryzen 7 Touchscreen Laptop', brand: 'HP', basePrice: 62990, originalPrice: 74900 },
  { cat: 'laptops', name: 'ROG Zephyrus G14 Gaming Laptop (RTX 4060)', brand: 'Asus', basePrice: 139990, originalPrice: 164990 },
  { cat: 'laptops', name: 'IdeaPad Slim 3 Intel Core i5 Thin Laptop', brand: 'Lenovo', basePrice: 42990, originalPrice: 54900 },
  { cat: 'laptops', name: 'Aspire 7 Gaming Laptop Core i5 12th Gen', brand: 'Acer', basePrice: 48990, originalPrice: 62900 },
  { cat: 'laptops', name: 'MacBook Pro M3 Max (16-inch, 36GB, 1TB)', brand: 'Apple', basePrice: 349900, originalPrice: 399900 },
  { cat: 'laptops', name: 'Dell Inspiron 15 Core i3 Work Laptop', brand: 'Dell', basePrice: 32990, originalPrice: 41990 },

  // 4. TVS (8 items)
  { cat: 'tvs', name: 'OLED C3 Series 55-inch 4K Smart TV', brand: 'LG', basePrice: 119990, originalPrice: 149990 },
  { cat: 'tvs', name: 'Bravia 65-inch 4K Ultra HD Google Smart TV', brand: 'Sony', basePrice: 84990, originalPrice: 109900 },
  { cat: 'tvs', name: 'Neo QLED 55-inch Crystal 4K Smart TV', brand: 'Samsung', basePrice: 64990, originalPrice: 84900 },
  { cat: 'tvs', name: 'Series A 43-inch FHD Horizon Edition Smart TV', brand: 'Mi', basePrice: 21999, originalPrice: 28999 },
  { cat: 'tvs', name: 'Y1S 50-inch 4K Ultra HD Smart LED TV', brand: 'OnePlus', basePrice: 32999, originalPrice: 39999 },
  { cat: 'tvs', name: 'Metallic Bezel-less 40-inch Smart Android TV', brand: 'TCL', basePrice: 17990, originalPrice: 24990 },
  { cat: 'tvs', name: 'Nanocell 80 Series 65-inch AI Sound TV', brand: 'LG', basePrice: 74990, originalPrice: 94900 },
  { cat: 'tvs', name: 'QLED Premium Series 55-inch Bezel-Less TV', brand: 'OnePlus', basePrice: 47990, originalPrice: 59990 },

  // 5. FASHION (8 items)
  { cat: 'fashion', name: 'Air Max SC Lightweight Walking Sneakers', brand: 'Nike', basePrice: 5490, originalPrice: 7495 },
  { cat: 'fashion', name: 'Grand Court Base Regular White Shoes', brand: 'Adidas', basePrice: 3990, originalPrice: 4999 },
  { cat: 'fashion', name: 'Smash V2 Classic Suede Men Sneakers', brand: 'Puma', basePrice: 2990, originalPrice: 3999 },
  { cat: 'fashion', name: '511 Slim Fit Mild Wash Stretchable Jeans', brand: 'Levis', basePrice: 2490, originalPrice: 3499 },
  { cat: 'fashion', name: 'Oversized Cotton Solid Round Neck T-shirt', brand: 'Zara', basePrice: 1190, originalPrice: 1799 },
  { cat: 'fashion', name: 'Suede Biker Jacket with Zipper Pockets', brand: 'Zara', basePrice: 4990, originalPrice: 6999 },
  { cat: 'fashion', name: 'Regular Fit Striped Casual Cotton Shirt', brand: 'Roadster', basePrice: 699, originalPrice: 1499 },
  { cat: 'fashion', name: 'Jogger Trackpants with Elasticated Drawstring', brand: 'Adidas', basePrice: 1890, originalPrice: 2499 },

  // 6. HOME & FURNITURE (8 items)
  { cat: 'home-furniture', name: 'Orthopaedic Foam Single Bed Mattress (6 inch)', brand: 'Sleepwell', basePrice: 11450, originalPrice: 14900 },
  { cat: 'home-furniture', name: 'Freedom Medium Durable Plastic Chair', brand: 'Nilkamal', basePrice: 1290, originalPrice: 1890 },
  { cat: 'home-furniture', name: 'Egon Solid Sheesham Wood Study Table', brand: 'Urban Ladder', basePrice: 8990, originalPrice: 11990 },
  { cat: 'home-furniture', name: 'Classic Pre-filled XL Faux Leather Bean Bag', brand: 'IKEA', basePrice: 1990, originalPrice: 2990 },
  { cat: 'home-furniture', name: 'Grafton Premium 3-seater Velvet Fabric Sofa', brand: 'Durian', basePrice: 34900, originalPrice: 45900 },
  { cat: 'home-furniture', name: 'Laptop Desk with Foldable Metal Legs', brand: 'IKEA', basePrice: 899, originalPrice: 1299 },
  { cat: 'home-furniture', name: 'Solid Wood Bedside Nightstand Table', brand: 'Urban Ladder', basePrice: 3490, originalPrice: 4990 },
  { cat: 'home-furniture', name: 'Triple Cushion Recliner Armchair Comfort', brand: 'Durian', basePrice: 18900, originalPrice: 24900 },

  // 7. APPLIANCES (8 items)
  { cat: 'appliances', name: 'NeoFresh 265L Double Door Smart Refrigerator', brand: 'Whirlpool', basePrice: 24990, originalPrice: 29990 },
  { cat: 'appliances', name: '7.5kg Smart Motion Inverter Washing Machine', brand: 'LG', basePrice: 18990, originalPrice: 23990 },
  { cat: 'appliances', name: '253L Convertible Deep Cooling Refrigerator', brand: 'Samsung', basePrice: 28990, originalPrice: 33990 },
  { cat: 'appliances', name: '30L Convection Rotisserie Microwave Oven', brand: 'Godrej', basePrice: 11490, originalPrice: 14990 },
  { cat: 'appliances', name: '1.5 Ton 3 Star Inverter Split Air Conditioner', brand: 'Daikin', basePrice: 36990, originalPrice: 44900 },
  { cat: 'appliances', name: '6kg Fully Automatic Front Loading Washer', brand: 'IFB', basePrice: 22990, originalPrice: 27990 },
  { cat: 'appliances', name: '28L Mechanical Control Solo Solo Microwave', brand: 'Samsung', basePrice: 6990, originalPrice: 8990 },
  { cat: 'appliances', name: 'IntelliPro 1.5 Ton 5 Star Wi-Fi AC', brand: 'Whirlpool', basePrice: 42990, originalPrice: 51990 },

  // 8. BEAUTY (8 items)
  { cat: 'beauty', name: 'Extraordinary Clay Purifying Fresh Shampoo', brand: 'Loreal', basePrice: 499, originalPrice: 699 },
  { cat: 'beauty', name: 'Body Creme Rich Nourishing Moisturizer', brand: 'Nivea', basePrice: 299, originalPrice: 399 },
  { cat: 'beauty', name: 'Tea Tree Skin Clearing Purifying Facial Toner', brand: 'The Body Shop', basePrice: 790, originalPrice: 995 },
  { cat: 'beauty', name: 'Fit Me Liquid Matte Waterproof Foundation', brand: 'Maybelline', basePrice: 420, originalPrice: 599 },
  { cat: 'beauty', name: 'Onion Anti-Hair Fall Oil with Redensyl', brand: 'Mamaearth', basePrice: 349, originalPrice: 499 },
  { cat: 'beauty', name: 'Happy Spray Energizing Eau De Parfum (Men)', brand: 'Clinique', basePrice: 4900, originalPrice: 5900 },
  { cat: 'beauty', name: 'Colossal Kajal 24H Smudgeproof Eye Pencil', brand: 'Maybelline', basePrice: 199, originalPrice: 299 },
  { cat: 'beauty', name: 'Hydrating Face Cream Moisture Surge Liquid', brand: 'Clinique', basePrice: 2490, originalPrice: 2990 }
];

export async function seedDatabase() {
  console.log('Initiating database purge and seeding cycle...');

  // Reset collections
  // Note: with StaticMockModel or MongoDB, we should clear the collection cleanly.
  // StaticMockModel has its collections emptied via writing [].
  // If useRealMongo is true, we call mongoose methods.
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    console.log('MongoDB collections dropped.');
  } else {
    // Falls back to direct file reset in JSON store
    writeLocalCollection('users', []);
    writeLocalCollection('categories', []);
    writeLocalCollection('products', []);
    writeLocalCollection('carts', []);
    writeLocalCollection('wishlists', []);
    writeLocalCollection('orders', []);
    console.log('Fallback Local JSON files reset.');
  }

  // 1. Seed Categories & Track mapping to ObjectIds
  const categoryMap = {};
  for (const catData of CATEGORIES) {
    const created = await Category.create({
      name: catData.name,
      slug: catData.slug,
      image: catData.image,
      parentCategory: null,
      level: catData.level
    });
    categoryMap[catData.slug] = created._id;
  }
  console.log(`Seeded ${CATEGORIES.length} top-level categories.`);

  // 2. Seed Admin User
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  await User.create({
    name: 'Admin',
    email: 'admin@flipkart.com',
    password: adminPassword,
    role: 'admin',
    addresses: [
      {
        fullName: 'Admin Main Office',
        phone: '9876543210',
        pincode: '560001',
        locality: 'Koramangala',
        addressLine: 'Block 4, Outer Ring Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        addressType: 'Work',
        isDefault: true
      }
    ]
  });

  // Seed sample standard user for convenience
  const userPassword = await bcrypt.hash('User@123', salt);
  await User.create({
    name: 'Jane Doe',
    email: 'user@flipkart.com',
    password: userPassword,
    role: 'user',
    addresses: [
      {
        fullName: 'Jane Doe',
        phone: '9988776655',
        pincode: '110011',
        locality: 'Connaught Place',
        addressLine: '12-A Parliament Street',
        city: 'New Delhi',
        state: 'Delhi',
        addressType: 'Home',
        isDefault: true
      }
    ]
  });
  console.log('Seeded standard and admin accounts.');

  // 3. Seed 60+ Products with realistic pricing and highlights/specs
  let productCount = 0;
  for (const temp of PRODUCT_TEMPLATES) {
    const productSlug = temp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const categoryId = categoryMap[temp.cat];

    const discountPercentage = Math.floor(Math.random() * 21) + 10; // 10% to 30%
    const mrp = temp.originalPrice;
    const price = Math.round(mrp - (mrp * discountPercentage) / 100);

    // Create 3 picsum.photos URLs using productSlug
    const images = [
      `https://picsum.photos/seed/${productSlug}-1/400/400`,
      `https://picsum.photos/seed/${productSlug}-2/400/400`,
      `https://picsum.photos/seed/${productSlug}-3/400/400`
    ];

    const highlights = [
      `Genuine product from registered brand ${temp.brand}`,
      `Includes 1 Year Authorized Domestic Warranty`,
      `Covered by Flipkart 7-day hassle-free replacement replacement guarantee`,
      `Check details for bank offers and cashback eligibility`
    ];

    const specifications = [
      { section: 'General', name: 'Brand', value: temp.brand },
      { section: 'General', name: 'Model Name', value: temp.name },
      { section: 'Technical', name: 'Operational Capacity', value: 'High Efficiency Rated' },
      { section: 'Technical', name: 'Security Protocol', value: 'Authorized Standards Verified' },
      { section: 'Dimensions', name: 'Item Weight', value: 'Universal Build Weight' },
      { section: 'Dimensions', name: 'Package Dimensions', value: 'Standard Protective Packaging Box' }
    ];

    const ratingsCount = Math.floor(Math.random() * 1000) + 120;
    const ratingsAverage = Number((4 + Math.random() * 1).toFixed(1)); // 4.0 to 5.0 rating

    const reviews = [
      { userName: 'Aravind S.', rating: 5, reviewText: 'Fantastic product! Delivered super quickly and original packaging was sealed.', createdAt: new Date() },
      { userName: 'Pooja Sharma', rating: 4, reviewText: 'Very happy with the build and operations. Highly recommended at this deal price!', createdAt: new Date() },
      { userName: 'Rohan Gupta', rating: 4, reviewText: 'Excellent experience. Fully satisfied with the Flipkart service as well.', createdAt: new Date() }
    ];

    await Product.create({
      title: temp.name,
      brand: temp.brand,
      price: price,
      originalPrice: mrp,
      discount: discountPercentage,
      images: images,
      ratings: {
        average: ratingsAverage,
        count: ratingsCount
      },
      highlights: highlights,
      specifications: specifications,
      category: categoryId,
      stock: Math.floor(Math.random() * 80) + 20,
      soldCount: Math.floor(Math.random() * 400) + 50,
      reviews: reviews
    });

    productCount++;
  }

  console.log(`Successfully completed seeding database. Seeded: ${productCount} products.`);
  return productCount;
}

// Support direct script execution
function writeLocalCollection(collectionName, data) {
  const file = path.join(DATA_DIR, `${collectionName}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
