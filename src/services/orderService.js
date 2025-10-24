const mongoose = require('mongoose');

const Order = require('../models/Order');
const InstallationCharge = require('../models/InstallationCharge');
const Product = require('../models/Product');
const  logger  = require('../utils/logger');
const Technician = require('../models/Technician');

class OrderService {
    async createDraftOrder(orderData) {
        const installationCharge = await InstallationCharge.findOne({ isCurrent: true });
        console.log("orderData:", orderData);
        const order = await Order.create({
          ...orderData,
          installationCharge: installationCharge.amount,
          status: 'draft',
          customer: {
            name: orderData.customer.name,
            contact: {
              phone: orderData.customer.contact.phone,
              alternatePhone: orderData.customer.contact.alternatePhone
            },
            address: {
              street: orderData.customer.address.street,
              city: orderData.customer.address.city,
              state: orderData.customer.address.state,
              pincode: orderData.customer.address.pincode
            }
          }
        });
        
        return order.populate('company technician');
      }


      async updateDraftOrder(orderId, orderData) {
  // 1. Find existing draft order
  const order = await Order.findOne({ 
    _id: orderId, 
    status: 'draft' 
  });

  if (!order) {
    throw new Error('Draft order not found or already completed');
  }

  // 2. Update core order fields
  if (orderData.TCRNumber !== undefined) order.TCRNumber = orderData.TCRNumber;
  if (orderData.company !== undefined) order.company = orderData.company;
  if (orderData.technician !== undefined) order.technician = orderData.technician;

  // 3. Update customer information (full nested update)
  if (orderData.customer) {
    // Name
    if (orderData.customer.name !== undefined) {
      order.customer.name = orderData.customer.name;
    }
    
    // Contact
    if (orderData.customer.contact) {
      if (orderData.customer.contact.phone !== undefined) {
        order.customer.contact.phone = orderData.customer.contact.phone;
      }
      if (orderData.customer.contact.alternatePhone !== undefined) {
        order.customer.contact.alternatePhone = orderData.customer.contact.alternatePhone;
      }
    }
    
    // Address
    if (orderData.customer.address) {
      if (orderData.customer.address.street !== undefined) {
        order.customer.address.street = orderData.customer.address.street;
      }
      if (orderData.customer.address.city !== undefined) {
        order.customer.address.city = orderData.customer.address.city;
      }
      if (orderData.customer.address.state !== undefined) {
        order.customer.address.state = orderData.customer.address.state;
      }
      if (orderData.customer.address.pincode !== undefined) {
        order.customer.address.pincode = orderData.customer.address.pincode;
      }
    }
  }

  // 4. Save and return populated order
  await order.save();
  return Order.findById(orderId).populate('company technician');
}

  async submitOrderCompletion(orderId, completionData) {
    console.log("completionData:", completionData);
    const order = await Order.findById(orderId);
    
    // Update products and pricing
    order.products = completionData.products;
    order.miscellaneousCost = completionData.miscellaneousCost;
    order.discountPercentage = completionData.discountPercentage;
    order.status = 'pending-approval';
    
    await this.calculateFinancials(order);
    return order.save();
  }

//   async calculateFinancials(order) {
//   try {
//     // Safeguard: Ensure products array exists
//     const products = order.products || [];
//     let subtotal = 0;

//     // Calculate subtotal
//     for (const item of products) {
//       const product = await Product.findById(item.product);
      
//       // Convert to numbers with fallbacks
//       const price = Number(product?.price) || 0;
//       const quantity = Number(item.quantity) || 0;
      
//       subtotal += price * quantity;
//     }

//     // Convert inputs with proper validation
//     const miscellaneousCost = Number(order.miscellaneousCost) || 0;
//     let discountPercentage = Number(order.discountPercentage) || 0;
    
//     // Ensure discount is between 0-100
//     discountPercentage = Math.max(0, Math.min(100, discountPercentage));

//     // Calculate financials
//     const totalAmount = subtotal + miscellaneousCost;
//     const discountAmount = totalAmount * (discountPercentage / 100);
//     const netAmount = totalAmount - discountAmount;

//     // Calculate cuts (adjust percentages as needed)
//     const technicianCutPercentage = 70; // Example: 70% to technician
//     const technicianCut = netAmount * (technicianCutPercentage / 100);
//     const companyCut = netAmount - technicianCut;

//     // Assign with final validation
//     order.subtotal = subtotal;
//     order.totalAmount = isNaN(totalAmount) ? 0 : totalAmount;
//     order.discountAmount = isNaN(discountAmount) ? 0 : discountAmount;
//     order.netAmount = isNaN(netAmount) ? 0 : netAmount;
//     order.technicianCut = isNaN(technicianCut) ? 0 : technicianCut;
//     order.companyCut = isNaN(companyCut) ? 0 : companyCut;

//   } catch (error) {
//     console.error("Error in calculateFinancials:", error);
//     // Fallback to zero values
//     order.subtotal = 0;
//     order.totalAmount = 0;
//     // ... other fields
//   }
// }

//   async approveDiscount(orderId, userId) {
//     const order = await Order.findByIdAndUpdate(
//       orderId,
//       { 
//         discountApproved: true,
//         discountApprovedBy: userId,
//         status: 'completed' 
//       },
//       { new: true }
//     );
    
//     await this.calculateFinancials(order);
//     return order.save();
//   }


async calculateFinancials(order) {
    try {
      // Calculate subtotal from products
      const products = order.products || [];
      let subtotal = 0;

      for (const item of products) {
        const product = await Product.findById(item.product);
        const price = Number(product?.price) || 0;
        const quantity = Number(item.quantity) || 0;
        subtotal += price * quantity;
      }

      // Process financial values
      const miscellaneousCost = Number(order.miscellaneousCost) || 0;
      let discountPercentage = Number(order.discountPercentage) || 0;
      discountPercentage = Math.max(0, Math.min(100, discountPercentage));

      const totalAmount = subtotal + miscellaneousCost;
      const discountAmount = totalAmount * (discountPercentage / 100);
      const netAmount = totalAmount - discountAmount;

      // Calculate discount responsibility
      const discountSplit = order.discountSplit || { ownerPercentage: 100, technicianPercentage: 0 };
      const ownerDiscountShare = discountAmount * (discountSplit.ownerPercentage / 100);
      const techDiscountShare = discountAmount * (discountSplit.technicianPercentage / 100);

      // Calculate cuts with discount responsibility
      const technicianCutPercentage = 70; // Base technician percentage
      const baseTechnicianCut = netAmount * (technicianCutPercentage / 100);
      const technicianCut = baseTechnicianCut - techDiscountShare;
      const companyCut = netAmount - technicianCut;

      // Assign values
      order.subtotal = subtotal;
      order.totalAmount = isNaN(totalAmount) ? 0 : totalAmount;
      order.discountAmount = isNaN(discountAmount) ? 0 : discountAmount;
      order.netAmount = isNaN(netAmount) ? 0 : netAmount;
      order.technicianCut = isNaN(technicianCut) ? 0 : technicianCut;
      order.companyCut = isNaN(companyCut) ? 0 : companyCut;
      order.outstandingAmount = netAmount;

    } catch (error) {
      logger.error("Error in calculateFinancials:", error);
      // Fallback to zero values
      order.subtotal = 0;
      order.totalAmount = 0;
      order.discountAmount = 0;
      order.netAmount = 0;
      order.technicianCut = 0;
      order.companyCut = 0;
      order.outstandingAmount = 0;
    }
  }

  async approveDiscount(orderId, userId, discountSplit) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error('Order not found');
    if (order.discountApproved !== 'pending') {
      throw new Error('Discount already processed');
    }

    // Validate discount split
    if (discountSplit.ownerPercentage + discountSplit.technicianPercentage !== 100) {
      throw new Error('Discount split must total 100%');
    }

    // Update discount details
    order.discountSplit = discountSplit;
    order.discountApproved = 'approved';
    order.discountApprovedBy = userId;
    order.status = 'completed'; // Set to completed

    // Recalculate financials with new split
    await this.calculateFinancials(order);
    await order.save({ session });

    // Update technician's liability if applicable
    if (discountSplit.technicianPercentage > 0) {
      const techShare = order.discountAmount * (discountSplit.technicianPercentage / 100);
      await Technician.findByIdAndUpdate(
        order.technician,
        { 
          $inc: { 
            dueFromDiscounts: techShare,
            outstandingBalance: techShare 
          } 
        },
        { session }
      );
    }

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

  async rejectDiscount(orderId, userId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');
    if (order.discountApproved !== 'pending') {
      throw new Error('Discount already processed');
    }

    order.discountApproved = 'rejected';
    order.discountApprovedBy = userId;
    order.discountSplit = { ownerPercentage: 100, technicianPercentage: 0 };
    
    // Recalculate without discount
    const originalDiscount = order.discountPercentage;
    order.discountPercentage = 0;
    await this.calculateFinancials(order);
    
    // Restore original discount for records but keep financials without discount
    order.discountPercentage = originalDiscount;
    await order.save();
    
    return order;
  }


async getDraftOrders({ skip = 0, limit = 50 } = {}) {
  try {
    const [draftOrders, total] = await Promise.all([
      Order.find()  // Filter by draft status
        .populate('company technician')
        .populate({
          path: 'products.product',   // Correct nested population path
          model: 'Product'            // Ensure this matches your model name
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments()  // Count only drafts
    ]);
    
    return { draftOrders, total, skip, limit };
  } catch (error) {
    logger.error('Error fetching draft orders:', error);
    throw new Error('Failed to retrieve draft orders');
  }
}
}

module.exports = new OrderService();