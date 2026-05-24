import { Order, Cart, Product } from '../models/db.js';
import { generateOrderId } from '../utils/generateOrderId.js';
import { sendEmail } from '../utils/sendEmail.js';

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'A valid shipping address must be supplied to execute checkout.'
      });
    }

    // 1. Fetch user's cart populated with products
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Add products before placing an order.'
      });
    }

    // 2. Validate inventory / stock for each item
    const orderItems = [];
    let grandTotal = 0;

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(404).json({
          success: false,
          message: 'One of the items in your cart is no longer available.'
        });
      }

      const dbProduct = await Product.findById(item.product._id);
      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product.title} has been discontinued.`
        });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: '${dbProduct.title}'. Available stock: ${dbProduct.stock}`
        });
      }

      // Deduct stock, increase sold count
      const updatedStock = Math.max(0, dbProduct.stock - item.quantity);
      const updatedSoldCount = (dbProduct.soldCount || 0) + item.quantity;
      await Product.findByIdAndUpdate(dbProduct._id, {
        stock: updatedStock,
        soldCount: updatedSoldCount
      });

      orderItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: item.price,
        // Include product detail for receipt rendering
        _tempTitle: dbProduct.title
      });

      grandTotal += Number(item.price) * Number(item.quantity);
    }

    // 3. Create Order
    const randomOrderId = generateOrderId();
    const newOrder = await Order.create({
      orderId: randomOrderId,
      user: req.user._id,
      items: orderItems.map(oi => ({ product: oi.product, quantity: oi.quantity, price: oi.price })),
      shippingAddress,
      totalAmount: grandTotal,
      status: 'Placed'
    });

    // 4. Clear User Cart
    await Cart.findByIdAndUpdate(cart._id, { items: [] });

    // 5. Send Flipkart-branded transactional confirmation e-receipt
    const itemsTableRows = orderItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ECECEC; font-family: Inter, Arial, sans-serif; font-size: 14px; color: #212121;">
          ${item._tempTitle}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ECECEC; text-align: center; font-family: Inter, Arial, sans-serif; font-size: 14px; color: #212121;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ECECEC; text-align: right; font-family: Inter, Arial, sans-serif; font-size: 14px; color: #212121;">
          ₹${item.price.toLocaleString()}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ECECEC; text-align: right; font-family: Inter, Arial, sans-serif; font-size: 14px; font-weight: 500; color: #212121;">
          ₹${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    const emailTemplate = `
      <div style="background-color: #F1F3F6; padding: 20px; font-family: Inter, Arial, sans-serif; max-width: 600px; margin: auto;">
        <!-- Header -->
        <div style="background-color: #2874F0; padding: 15px 25px; border-radius: 4px 4px 0 0; display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #FFFFFF; font-size: 24px; font-weight: 700; font-style: italic; letter-spacing: 0.5px;">Flipkart</span>
          <span style="color: #FFE11B; font-size: 11px; font-weight: 600; font-style: italic; border: 1px solid #FFE11B; padding: 2px 6px; border-radius: 2px;">PLUS</span>
        </div>

        <!-- Body -->
        <div style="background-color: #FFFFFF; padding: 25px; border-radius: 0 0 4px 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #212121; font-size: 18px; margin-top: 0; font-weight: 600;">Hi ${req.user.name || 'Valued Purchaser'},</h2>
          <p style="color: #878787; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            Thank you for shopping with us! Your order has been placed successfully and is currently being processed.
          </p>

          <!-- Order details highlight -->
          <div style="background-color: #F1F3F6; border-left: 4px solid #2874F0; padding: 15px; margin-bottom: 25px; border-radius: 0 4px 4px 0;">
            <div style="font-size: 11px; color: #878787; text-transform: uppercase; font-weight: 500;">ORDER REFERENCE</div>
            <div style="font-size: 18px; color: #2874F0; font-weight: 700; margin-top: 2px;">${randomOrderId}</div>
          </div>

          <!-- Items list table -->
          <h3 style="color: #212121; font-size: 15px; border-bottom: 1px solid #ECECEC; padding-bottom: 8px; margin-bottom: 12px; font-weight: 600;">Purchased Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #F1F3F6;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #878787; text-transform: uppercase;">Product</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #878787; text-transform: uppercase; width: 60px;">Qty</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #878787; text-transform: uppercase; width: 100px;">Price</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #878787; text-transform: uppercase; width: 100px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          <!-- Amount box -->
          <div style="text-align: right; margin-bottom: 25px; border-top: 2px solid #212121; padding-top: 15px;">
            <span style="font-size: 15px; color: #878787; font-weight: 500;">Total Amount Spanned:</span>
            <span style="font-size: 20px; color: #212121; font-weight: 700; margin-left: 10px;">₹${grandTotal.toLocaleString()}</span>
          </div>

          <!-- Shipping details block -->
          <div style="background-color: #F1F3F6; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
            <h4 style="color: #212121; font-size: 13px; margin: 0 0 10px 0; font-weight: 600; text-transform: uppercase;">Shipping To:</h4>
            <div style="font-size: 14px; font-weight: 600; color: #212121; margin-bottom: 4px;">${shippingAddress.fullName}</div>
            <div style="font-size: 13px; color: #212121; line-height: 1.4;">
              ${shippingAddress.addressLine}, ${shippingAddress.locality}<br />
              ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br />
              <strong>Phone:</strong> ${shippingAddress.phone}
            </div>
          </div>

          <p style="text-align: center; color: #388E3C; font-size: 14px; font-weight: 600; margin-top: 30px; letter-spacing: 0.2px;">
            Thank you for shopping with Flipkart
          </p>
        </div>
      </div>
    `;

    // Fire email (no await to keep checkouts light and fast)
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmation - ${randomOrderId} from Flipkart!`,
      html: emailTemplate
    }).catch(err => {
      console.error('Email pipeline failed silently in checkouts:', err);
    });

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const listMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skipIndex = (Number(page) - 1) * Number(limit);

    const filterObj = { user: req.user._id };
    const totalCount = await Order.countDocuments(filterObj);
    const orderList = await Order.find(filterObj)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit))
      .populate('items.product')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        orders: orderList,
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      },
      message: 'Past orders retrieved successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = await Order.findById(id).populate('items.product').lean();
    if (!order) {
      // Also check if id corresponds to orderId string of the FK-XXXXXXXX form
      const allOrders = await Order.find().populate('items.product').lean();
      order = allOrders.find(ord => ord.orderId === id || ord._id === id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Security Gate check
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order details retrieved.'
    });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    let orderObj = await Order.findById(id);
    if (!orderObj) {
      const allOrders = await Order.find();
      orderObj = allOrders.find(o => o.orderId === id || o._id === id);
    }

    if (!orderObj) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Security check
    const isOwner = orderObj.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are unauthorized to modify this order.'
      });
    }

    // Check capability status
    if (orderObj.status !== 'Placed' && orderObj.status !== 'Processing') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Active status: ${orderObj.status}`
      });
    }

    // Restore stock inventory
    for (const item of orderObj.items) {
      const dbProduct = await Product.findById(item.product);
      if (dbProduct) {
        await Product.findByIdAndUpdate(dbProduct._id, {
          stock: dbProduct.stock + item.quantity,
          soldCount: Math.max(0, (dbProduct.soldCount || 0) - item.quantity)
        });
      }
    }

    // Update state
    await Order.findByIdAndUpdate(orderObj._id, { status: 'Cancelled' });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.'
    });
  } catch (err) {
    next(err);
  }
};
