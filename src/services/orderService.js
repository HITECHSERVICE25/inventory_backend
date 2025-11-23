const mongoose = require('mongoose');

const Order = require('../models/Order');
const InstallationCharge = require('../models/InstallationCharge');
const Product = require('../models/Product');
const CommissionAgreement = require("../models/CommissionAgreement");

const  logger  = require('../utils/logger');
const Technician = require('../models/Technician');

class OrderService {
    async createDraftOrder(orderData) {
      try{
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
      } catch (error) {
            logger.error('Order creation failed', { error: error.message });
            
          // Handle duplicate key error
          if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
      
            // Throw a clean error
            const customError = new Error(`${field} already exists`);
            customError.statusCode = 400;
            throw customError;
          }
      
          // For all other errors
          error.statusCode = 500;
          throw error;
          }
        
      }


      async updateDraftOrder(orderId, orderData) {
        try{
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
        }catch (error) {
            logger.error('Order creation failed', { error: error.message });
            
          // Handle duplicate key error
          if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
      
            // Throw a clean error
            const customError = new Error(`${field} already exists`);
            customError.statusCode = 400;
            throw customError;
          }
      
          // For all other errors
          error.statusCode = 500;
          throw error;
          }
  
}

  async submitOrderCompletion(orderId, completionData) {
    try{

      console.log("completionData:", completionData);
    const order = await Order.findById(orderId);
    
    // Update products and pricing
    order.products = completionData.products;
    order.miscellaneousCost = completionData.miscellaneousCost;
    order.discountPercentage = completionData.discountPercentage;
    order.status = 'pending-approval';
    
    await this.calculateFinancials(order);
    await order.save();
    return Order.findById(orderId).populate('company technician');


    } catch (error) {
            logger.error('Order creation failed', { error: error.message });
            
          // Handle duplicate key error
          if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
      
            // Throw a clean error
            const customError = new Error(`${field} already exists`);
            customError.statusCode = 400;
            throw customError;
          }
      
          // For all other errors
          error.statusCode = 500;
          throw error;
          }
    
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


// async calculateFinancials(order) {
//     try {
//       // Calculate subtotal from products
//       const products = order.products || [];
//       let subtotal = order.installationCharge;

//       for (const item of products) {
//         const product = await Product.findById(item.product);
//         const price = Number(product?.price) || 0;
//         const quantity = Number(item.quantity) || 0;
//         subtotal += (price * quantity);
//       }

//       // Process financial values
//       const miscellaneousCost = Number(order.miscellaneousCost) || 0;
//       let discountPercentage = Number(order.discountPercentage) || 0;
//       discountPercentage = Math.max(0, Math.min(100, discountPercentage));

//       const totalAmount = subtotal + miscellaneousCost;
//       const discountAmount = totalAmount * (discountPercentage / 100);
//       const netAmount = totalAmount - discountAmount;

//       // Calculate discount responsibility
//       const discountSplit = order.discountSplit || { ownerPercentage: 100, technicianPercentage: 0 };
//       const ownerDiscountShare = discountAmount * (discountSplit.ownerPercentage / 100);
//       const techDiscountShare = discountAmount * (discountSplit.technicianPercentage / 100);

//       // Calculate cuts with discount responsibility
//       const technicianCutPercentage = 70; // Base technician percentage
//       const baseTechnicianCut = netAmount * (technicianCutPercentage / 100);
//       const technicianCut = baseTechnicianCut - techDiscountShare;
//       const companyCut = netAmount - technicianCut;

//       // Assign values
//       order.subtotal = subtotal;
//       order.totalAmount = isNaN(totalAmount) ? 0 : totalAmount;
//       order.discountAmount = isNaN(discountAmount) ? 0 : discountAmount;
//       order.netAmount = isNaN(netAmount) ? 0 : netAmount;
//       order.technicianCut = isNaN(technicianCut) ? 0 : technicianCut;
//       order.companyCut = isNaN(companyCut) ? 0 : companyCut;
//       order.outstandingAmount = netAmount;

//     } catch (error) {
//       logger.error("Error in calculateFinancials:", error);
//       // Fallback to zero values
//       order.subtotal = 0;
//       order.totalAmount = 0;
//       order.discountAmount = 0;
//       order.netAmount = 0;
//       order.technicianCut = 0;
//       order.companyCut = 0;
//       order.outstandingAmount = 0;
//     }
//   }


// async calculateFinancials(order) {
//   try {
//     let subtotal = Number(order.installationCharge) || 0;
//     let technicianCommissionTotal = 0;

//     // ✅ Calculate subtotal & technician commission
//     for (const item of order.products) {
//       const product = await Product.findById(item.product);
//       if (!product) continue;

//       const price = Number(item.salePrice ?? product.price) || 0;
//       const qty = Number(item.quantity) || 0;

//       subtotal += price * qty;

//       // ✅ Fetch technician commission if exists
//       const agreement = await CommissionAgreement.findOne({
//         technician: order.technician,
//         product: item.product
//       });

//       if (agreement) {
//         technicianCommissionTotal += agreement.amount * qty;
//       }
//     }

//     const miscellaneousCost = Number(order.miscellaneousCost) || 0;
//     const totalAmount = subtotal + miscellaneousCost;

//     // ✅ Discount calculations
//     const discountPercentage = Math.max(0, Math.min(100, Number(order.discountPercentage) || 0));
//     const discountAmount = totalAmount * (discountPercentage / 100);
//     const netAmount = totalAmount - discountAmount;

//     // ✅ Discount split handling
//     const split = order.discountSplit || { ownerPercentage: 100, technicianPercentage: 0 };
//     const ownerDiscountShare = discountAmount * (split.ownerPercentage / 100);
//     const techDiscountShare = discountAmount * (split.technicianPercentage / 100);

//     // ✅ TECHNICIAN CUT = Service + Commission − Share of Discount
//     const technician = await Technician.findById(order.technician);
//     const serviceRate = Number(technician?.serviceRate) || 0;

//     let technicianCut = (serviceRate + technicianCommissionTotal);

//     // ✅ COMPANY CUT = NetAmount − Technician Cut
//     let companyCut = totalAmount - technicianCut;

//     companyCut -= ownerDiscountShare;
//     technicianCut -=  techDiscountShare;


//     // Assign final values
//     order.subtotal = subtotal;
//     order.totalAmount = totalAmount;
//     order.discountAmount = discountAmount;
//     order.netAmount = netAmount;
//     order.technicianCut = technicianCut < 0 ? 0 : technicianCut;
//     order.companyCut = companyCut < 0 ? 0 : companyCut;
//     order.outstandingAmount = netAmount - technicianCut;

//   } catch (error) {
//     logger.error("Error in calculateFinancials:", error);

//     // Fallback to zero on error
//     order.subtotal = 0;
//     order.totalAmount = 0;
//     order.discountAmount = 0;
//     order.netAmount = 0;
//     order.technicianCut = 0;
//     order.companyCut = 0;
//     order.outstandingAmount = 0;
//   }
// }

async calculateFinancials(order) {
  try {
    console.log("\n========== FINANCIAL CALCULATION STARTED ==========");

    let subtotal = Number(order.installationCharge) || 0;
    let technicianCommissionTotal = 0;

    console.log("➡ Installation Charge:", order.installationCharge);
    console.log("➡ Initial Subtotal:", subtotal);

    // ✅ Calculate subtotal & technician commission
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const price = Number(item.salePrice ?? product.price) || 0;
      const qty = Number(item.quantity) || 0;

      console.log("\n---- PRODUCT LINE ----");
      console.log("Product:", product.name);
      console.log("Sale Price Used:", price);
      console.log("Quantity:", qty);

      subtotal += price * qty;

      // ✅ Fetch technician commission for that product
      const agreement = await CommissionAgreement.findOne({
        technician: order.technician,
        product: item.product
      });

      if (agreement) {
        const commission = agreement.amount * qty;
        technicianCommissionTotal += commission;
        console.log("Commission Found: ", agreement.amount, " x ", qty, " =", commission);
      } else {
        console.log("No commission agreement found");
      }

      console.log("Updated subtotal:", subtotal);
      console.log("Total Technician Commission So Far:", technicianCommissionTotal);
    }

    const miscellaneousCost = Number(order.miscellaneousCost) || 0;
    const totalAmount = subtotal + miscellaneousCost;

    console.log("\n➡ Miscellaneous Cost:", miscellaneousCost);
    console.log("➡ Total Amount (Subtotal + Misc):", totalAmount);

    // ✅ Discount calculations
    const discountPercentage = Math.max(0, Math.min(100, Number(order.discountPercentage) || 0));
    const discountAmount = totalAmount * (discountPercentage / 100);
    const netAmount = totalAmount - discountAmount;

    console.log("\n➡ Discount %:", discountPercentage);
    console.log("➡ Discount Amount:", discountAmount);
    console.log("➡ Net Amount (After Discount):", netAmount);

    // ✅ Discount split handling
    const split = order.discountSplit || { ownerPercentage: 100, technicianPercentage: 0 };
    const ownerDiscountShare = discountAmount * (split.ownerPercentage / 100);
    const techDiscountShare = discountAmount * (split.technicianPercentage / 100);

    console.log("\n➡ Discount Split:", split);
    console.log("Owner Discount Share:", ownerDiscountShare);
    console.log("Technician Discount Share:", techDiscountShare);

    // ✅ TECHNICIAN CUT = Service + Commission − Discount Share
    const technician = await Technician.findById(order.technician);
    const serviceRate = Number(technician?.serviceRate) || 0;

    console.log("\n➡ Technician Service Charge:", serviceRate);

    let technicianCut = (serviceRate + technicianCommissionTotal);
    console.log("Technician Cut Before Discount:", technicianCut);

    technicianCut -= techDiscountShare;
    console.log("Technician Cut After Tech Discount Share:", technicianCut);

    // ✅ COMPANY CUT = TotalAmount − Technician Cut − Owner Discount Share
    let companyCut = totalAmount - technicianCut;
    companyCut -= ownerDiscountShare;

    console.log("\n➡ Company Cut After Discount Share:", companyCut);

    order.subtotal = subtotal;
    order.totalAmount = totalAmount;
    order.discountAmount = discountAmount;
    order.netAmount = netAmount;
    order.technicianCut = technicianCut < 0 ? 0 : technicianCut;
    order.companyCut = companyCut < 0 ? 0 : companyCut;
    order.outstandingAmount = netAmount - order.technicianCut;

    console.log("\n========== FINAL VALUES ==========");
    console.log("Subtotal:", order.subtotal);
    console.log("Total Amount:", order.totalAmount);
    console.log("Discount Amount:", order.discountAmount);
    console.log("Net Amount:", order.netAmount);
    console.log("Technician Cut:", order.technicianCut);
    console.log("Company Cut:", order.companyCut);
    console.log("Outstanding Amount:", order.outstandingAmount);
    console.log("========== CALCULATION COMPLETE ==========\n");

  } catch (error) {
    logger.error("Error in calculateFinancials:", error);

    // Fallback to zero on error
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
    await Technician.findByIdAndUpdate(
      order.technician,
      { 
        $inc: { 
          outstandingBalance: order.outstandingAmount 
        } 
      },
      { session }
    );
    

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