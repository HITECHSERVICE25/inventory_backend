const mongoose = require('mongoose');

const Order = require('../models/Order');
const InstallationCharge = require('../models/InstallationCharge');
const Product = require('../models/Product');
const CommissionAgreement = require("../models/CommissionAgreement");

const  logger  = require('../utils/logger');
const Technician = require('../models/Technician');
const Company = require('../models/Company');

class OrderService {
    async createDraftOrder(orderData) {
      try{

        let installationCharge;
        if(orderData?.freeInstallation){
          installationCharge = 0;
        } else {
          const company = await Company.findById(orderData.company);
          installationCharge = company.installationCharge;
        }
        
        console.log("orderData:", orderData);
        const order = await Order.create({
          ...orderData,
          installationCharge: installationCharge,
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



   let installationCharge;
        if(orderData?.freeInstallation){
          installationCharge = 0;
        } else {
          const company = await Company.findById(orderData.company);
          installationCharge = company.installationCharge;
        }

  order.freeInstallation = orderData.freeInstallation;
  order.installationCharge = installationCharge;

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
  try {
    console.log("completionData:", completionData);

    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    /* ================= UPDATE BASIC FIELDS ================= */

    order.products = completionData.products;
    order.miscellaneousCost =
      Number(completionData.miscellaneousCost) || 0;

    order.fittingCost =
      Number(completionData.fittingCost) || 0;

    /* ================= NEW DISCOUNT STRUCTURE ================= */

    order.discount = completionData?.discount;

    /* If split is sent */
    if (completionData.discountSplit) {
      order.discountSplit = {
        ownerPercentage:
          Number(completionData.discountSplit.ownerPercentage) || 100,
        technicianPercentage:
          Number(completionData.discountSplit.technicianPercentage) || 0
      };
    }

    /* ================= STATUS ================= */

    order.status = "pending-approval";

    /* ================= RE-CALCULATE ================= */

    await this.calculateFinancials(order);

    await order.save();

    return Order.findById(orderId)
      .populate("company technician");

  } catch (error) {
    logger.error("Order completion failed", {
      error: error.message
    });

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const customError = new Error(`${field} already exists`);
      customError.statusCode = 400;
      throw customError;
    }

    error.statusCode = error.statusCode || 500;
    throw error;
  }
}



// async calculateFinancials(order) {
//   try {
//     console.log("\n========== FINANCIAL CALCULATION START ==========");
//     console.log("ORDER ID:", order._id?.toString());

//     /* -------------------- FETCH TECHNICIAN EARLY -------------------- */
//     const technician = await Technician.findById(order.technician);

//     const serviceRate = Number(technician?.serviceRate) || 0;
//     const miscSharePct = Math.max(
//       0,
//       Math.min(100, Number(technician?.miscShare) || 0)
//     );

//     console.log("\n[TECHNICIAN INFO]");
//     console.log("Service rate:", serviceRate);
//     console.log("Misc share %:", miscSharePct);

//     /* -------------------- INIT -------------------- */
//     let productSubtotal = Number(order.installationCharge) || 0;
//     let technicianCommissionTotal = 0;

//     console.log("\n[INIT]");
//     console.log("Installation charge:", productSubtotal);

//     /* -------------------- PRODUCTS -------------------- */
//     for (const item of order.products || []) {
//       const product = await Product.findById(item.product);
//       if (!product) continue;

//       const price = Number(item.salePrice ?? product.price) || 0;
//       const qty = Number(item.quantity) || 0;
//       const lineTotal = price * qty;

//       productSubtotal += lineTotal;

//       const agreement = await CommissionAgreement.findOne({
//         technician: order.technician,
//         product: item.product
//       });

//       if (agreement) {
//         technicianCommissionTotal += (Number(agreement.amount) || 0) * qty;
//       }
//     }

//     console.log("\n[PRODUCT TOTAL]");
//     console.log("Product subtotal:", productSubtotal);
//     console.log("Commission total:", technicianCommissionTotal);

//     /* -------------------- FITTING -------------------- */
//     const fittingCharge = Number(order.fittingCost) || 0;
//     console.log("\n[FITTING]");
//     console.log("Fitting charge:", fittingCharge);

//     /* -------------------- PRODUCT DISCOUNT -------------------- */
//     const productDiscountPct = Math.max(
//       0,
//       Math.min(100, Number(order.discountPercentage) || 0)
//     );

//     const productDiscountAmount =
//       productSubtotal * (productDiscountPct / 100);

//     const productSplit =
//       order.discountSplit || { ownerPercentage: 100, technicianPercentage: 0 };

//     const techProductDiscount =
//       productDiscountAmount *
//       ((Number(productSplit.technicianPercentage) || 0) / 100);

//     console.log("\n[PRODUCT DISCOUNT]");
//     console.log("Discount amount:", productDiscountAmount);
//     console.log("Tech share:", techProductDiscount);

//     /* -------------------- MISC COST -------------------- */
//     const miscCost = Number(order.miscellaneousCost) || 0;

//     const miscDiscountPct = Math.max(
//       0,
//       Math.min(100, Number(order.miscDiscountPercentage) || 0)
//     );

//     const miscDiscountAmount =
//       miscCost * (miscDiscountPct / 100);

//     const netMisc = miscCost - miscDiscountAmount;

//     const techMiscEarning =
//       netMisc * (miscSharePct / 100);

//     const companyMiscEarning =
//       netMisc - techMiscEarning;

//     console.log("\n[MISC UPDATED]");
//     console.log("Misc cost:", miscCost);
//     console.log("Discount:", miscDiscountAmount);
//     console.log("Net misc:", netMisc);
//     console.log("Technician misc earning:", techMiscEarning);
//     console.log("Company misc earning:", companyMiscEarning);

//     /* -------------------- TOTALS -------------------- */
//     const subtotal =
//       productSubtotal + miscCost + fittingCharge;

//     const totalDiscount =
//       productDiscountAmount + miscDiscountAmount;

//     const netAmount =
//       subtotal - totalDiscount;

//     console.log("\n[TOTALS]");
//     console.log("Subtotal:", subtotal);
//     console.log("Total discount:", totalDiscount);
//     console.log("Net amount:", netAmount);

//     /* -------------------- TECHNICIAN CUT -------------------- */
//     const technicianCut =
//       serviceRate +
//       technicianCommissionTotal +
//       fittingCharge +
//       techMiscEarning -
//       techProductDiscount;

//     console.log("\n[TECHNICIAN CUT]");
//     console.log("Technician cut:", technicianCut);

//     /* -------------------- COMPANY CUT -------------------- */
//     const companyCut =
//       netAmount - technicianCut;

//     console.log("\n[COMPANY CUT]");
//     console.log("Company cut:", companyCut);

//     /* -------------------- FINAL ASSIGN -------------------- */
//     order.subtotal = subtotal;
//     order.totalAmount = subtotal;
//     order.discountAmount = totalDiscount;
//     order.netAmount = netAmount;
//     order.technicianCut = Math.max(0, technicianCut);
//     order.companyCut = Math.max(0, companyCut);
//     order.outstandingAmount = order.companyCut;

//     console.log("\n[FINAL]");
//     console.log("Technician cut:", order.technicianCut);
//     console.log("Company cut:", order.companyCut);
//     console.log(
//       "SANITY CHECK:",
//       order.companyCut + order.technicianCut,
//       "should equal",
//       order.netAmount
//     );

//     console.log("========== FINANCIAL CALCULATION END ==========\n");

//   } catch (error) {
//     logger.error("Error in calculateFinancials:", error);

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
    const technician = await Technician.findById(order.technician);

    const serviceRate = Number(technician?.serviceRate) || 0;
    const miscSharePct = Math.max(
      0,
      Math.min(100, Number(technician?.miscShare) || 0)
    );

    let productTotal = Number(order.installationCharge) || 0;
    let commissionTotal = 0;

    for (const item of order.products || []) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const price = Number(item.salePrice ?? product.price) || 0;
      const qty = Number(item.quantity) || 0;

      productTotal += price * qty;

      const agreement = await CommissionAgreement.findOne({
        technician: order.technician,
        product: item.product
      });

      if (agreement) {
        commissionTotal += (Number(agreement.amount) || 0) * qty;
      }
    }

    const fittingCharge = Number(order.fittingCost) || 0;
    const miscCost = Number(order.miscellaneousCost) || 0;

    const techMiscEarning =
      miscCost * (miscSharePct / 100);

    const grossSubtotal =
        productTotal
      + miscCost
      + fittingCharge
      + serviceRate;

    /* ================= DISCOUNT LOGIC ================= */

    let discountAmount = 0;

    if (order.discount?.type === 'percentage') {
      const pct = Math.max(
        0,
        Math.min(100, Number(order.discount.value) || 0)
      );
      discountAmount = grossSubtotal * (pct / 100);
    }

    if (order.discount?.type === 'amount') {
      discountAmount = Math.min(
        grossSubtotal,
        Number(order.discount.value) || 0
      );
    }

    /* ================= SPLIT ================= */

    const split =
      order.discountSplit || {
        ownerPercentage: 100,
        technicianPercentage: 0
      };

    const technicianDiscount =
      discountAmount *
      (Number(split.technicianPercentage) / 100);

    const netAmount =
      grossSubtotal - discountAmount;

    const technicianCut =
        serviceRate
      + commissionTotal
      + fittingCharge
      + techMiscEarning
      - technicianDiscount;

    const companyCut =
      netAmount - technicianCut;

    /* ================= ASSIGN ================= */

    order.totalAmount = grossSubtotal;
    order.discountAmount = discountAmount;
    order.netAmount = netAmount;
    order.technicianCut = technicianCut;
    order.companyCut = companyCut;
    order.outstandingAmount = order.companyCut;

  } catch (error) {
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

    // -------------------------
    // Validate split
    // -------------------------
    if (
      discountSplit.ownerPercentage +
      discountSplit.technicianPercentage !== 100
    ) {
      throw new Error('Discount split must total 100%');
    }

    // -------------------------
    // Apply approval
    // -------------------------
    order.discountSplit = discountSplit;
    order.discountApproved = 'approved';
    order.discountApprovedBy = userId;
    order.status = 'completed';

    // -------------------------
    // Recalculate financials
    // -------------------------
    await this.calculateFinancials(order);
    await order.save({ session });

    // -------------------------
    // Update technician outstanding
    // -------------------------
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

  // Default split (100% owner absorbs)
  order.discountSplit = {
    ownerPercentage: 100,
    technicianPercentage: 0
  };

  // Preserve original discount for audit
  const originalDiscount = { ...order.discount };

  // Temporarily remove discount
  order.discount = {
    type: 'percentage',
    value: 0
  };

  await this.calculateFinancials(order);

  // Restore original discount (financials already frozen)
  order.discount = originalDiscount;

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

async exportOrders({ startDate, endDate }) {
  try {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required for export");
    }

    const filter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      }
    };

    const orders = await Order.find(filter)
      .populate('company technician')
      .populate({
        path: 'products.product',
        model: 'Product'
      })
      .sort({ createdAt: -1 })
      .lean();

    return orders;

  } catch (error) {
    logger.error('Error exporting orders:', error);
    throw new Error('Failed to export orders');
  }
}


async deleteOrderById(orderId, userId) {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Optional: Add business rules check here
    // Example: Prevent deleting completed orders
    // if (order.status === 'completed') {
    //   throw new Error('Completed orders cannot be deleted');
    // }

    await Order.findByIdAndDelete(orderId);

    logger.info('Order deleted successfully', {
      orderId,
      deletedBy: userId
    });

    return {
      message: 'Order deleted successfully'
    };
  } catch (error) {
    logger.error('Failed to delete order', {
      error: error.message,
      orderId,
      deletedBy: userId
    });

    throw error;
  }
}

}

module.exports = new OrderService();



// async calculateFinancials(order) {
//   try {
//     console.log("\n========== FINANCIAL CALCULATION START ==========");
//     console.log("ORDER ID:", order._id?.toString());

//     /* -------------------- INIT -------------------- */
//     let productSubtotal = Number(order.installationCharge) || 0;
//     let technicianCommissionTotal = 0;

//     console.log("\n[INIT]");
//     console.log("Installation charge:", Number(order.installationCharge) || 0);
//     console.log("Starting productSubtotal:", productSubtotal);

//     /* -------------------- PRODUCTS -------------------- */
//     for (const item of order.products) {
//       console.log("\n[PRODUCT ITEM]");
//       console.log("Raw item:", item);

//       const product = await Product.findById(item.product);
//       if (!product) {
//         console.warn("Product not found:", item.product);
//         continue;
//       }

//       const price = Number(item.salePrice ?? product.price) || 0;
//       const qty = Number(item.quantity) || 0;
//       const lineTotal = price * qty;

//       console.log("Product:", product.name);
//       console.log("Price:", price);
//       console.log("Qty:", qty);
//       console.log("Line total:", lineTotal);

//       productSubtotal += lineTotal;
//       console.log("Updated productSubtotal:", productSubtotal);

//       const agreement = await CommissionAgreement.findOne({
//         technician: order.technician,
//         product: item.product
//       });

//       if (agreement) {
//         const commission = agreement.amount * qty;
//         technicianCommissionTotal += commission;

//         console.log("Commission rate:", agreement.amount);
//         console.log("Commission added:", commission);
//       } else {
//         console.log("No commission agreement");
//       }
//     }

//     console.log("\n[PRODUCT TOTAL]");
//     console.log("Final productSubtotal:", productSubtotal);
//     console.log("Total technician commission:", technicianCommissionTotal);

//     /* -------------------- FITTING -------------------- */
//     const fittingCharge = Number(order.fittingCost) || 0;
//     console.log("\n[FITTING]");
//     console.log("Fitting charge (100% technician):", fittingCharge);

//     /* -------------------- PRODUCT DISCOUNT -------------------- */
//     const productDiscountPct = Math.max(
//       0,
//       Math.min(100, Number(order.discountPercentage) || 0)
//     );

//     const productDiscountAmount =
//       productSubtotal * (productDiscountPct / 100);

//     const productSplit =
//       order.discountSplit || { ownerPercentage: 100, technicianPercentage: 0 };

//     const ownerProductDiscount =
//       productDiscountAmount * (productSplit.ownerPercentage / 100);

//     const techProductDiscount =
//       productDiscountAmount * (productSplit.technicianPercentage / 100);

//     console.log("\n[PRODUCT DISCOUNT]");
//     console.log("Discount %:", productDiscountPct);
//     console.log("Discount amount:", productDiscountAmount);
//     console.log("Split:", productSplit);
//     console.log("Owner discount:", ownerProductDiscount);
//     console.log("Tech discount:", techProductDiscount);

//     /* -------------------- MISC COST -------------------- */
//     const miscCost = Number(order.miscellaneousCost) || 0;

//     const miscDiscountPct = Math.max(
//       0,
//       Math.min(100, Number(order.miscDiscountPercentage) || 0)
//     );

//     const miscDiscountAmount =
//       miscCost * (miscDiscountPct / 100);

//     const miscSplit =
//       order.miscDiscountSplit || { ownerPercentage: 100, technicianPercentage: 0 };

//     const ownerMiscDiscount =
//       miscDiscountAmount * (miscSplit.ownerPercentage / 100);

//     const techMiscDiscount =
//       miscDiscountAmount * (miscSplit.technicianPercentage / 100);

//     console.log("\n[MISC COST]");
//     console.log("Misc cost:", miscCost);
//     console.log("Misc discount %:", miscDiscountPct);
//     console.log("Misc discount amount:", miscDiscountAmount);
//     console.log("Split:", miscSplit);
//     console.log("Owner misc discount:", ownerMiscDiscount);
//     console.log("Tech misc discount:", techMiscDiscount);

//     /* -------------------- TOTALS -------------------- */
//     const subtotal =
//       productSubtotal + miscCost + fittingCharge;

//     const totalDiscount =
//       productDiscountAmount + miscDiscountAmount;

//     const netAmount =
//       subtotal - totalDiscount;

//     console.log("\n[TOTALS]");
//     console.log("Subtotal:", subtotal);
//     console.log("Total discount:", totalDiscount);
//     console.log("Net amount:", netAmount);

//     /* -------------------- TECHNICIAN CUT -------------------- */
//     const technician = await Technician.findById(order.technician);
//     const serviceRate = Number(technician?.serviceRate) || 0;

//     const technicianCut =
//       serviceRate +
//       technicianCommissionTotal +
//       fittingCharge -
//       techProductDiscount -
//       techMiscDiscount;

//     console.log("\n[TECHNICIAN CUT]");
//     console.log("Service rate:", serviceRate);
//     console.log("Commission total:", technicianCommissionTotal);
//     console.log("Fitting charge:", fittingCharge);
//     console.log("Tech product discount:", techProductDiscount);
//     console.log("Tech misc discount:", techMiscDiscount);
//     console.log("Technician cut:", technicianCut);

//     /* -------------------- COMPANY CUT -------------------- */
//     const companyCut =
//       netAmount - technicianCut;

//     console.log("\n[COMPANY CUT]");
//     console.log("Company cut:", companyCut);

//     /* -------------------- FINAL ASSIGN -------------------- */
//     order.subtotal = subtotal;
//     order.totalAmount = subtotal;
//     order.discountAmount = totalDiscount;
//     order.netAmount = netAmount;
//     order.technicianCut = Math.max(0, technicianCut);
//     order.companyCut = Math.max(0, companyCut);
//     order.outstandingAmount =
//       netAmount - order.technicianCut;

//     console.log("\n[FINAL]");
//     console.log("Technician cut:", order.technicianCut);
//     console.log("Company cut:", order.companyCut);
//     console.log("Outstanding:", order.outstandingAmount);
//     console.log(
//       "SANITY CHECK:",
//       order.companyCut + order.technicianCut,
//       "should equal",
//       order.netAmount
//     );

//     console.log("========== FINANCIAL CALCULATION END ==========\n");

//   } catch (error) {
//     logger.error("Error in calculateFinancials:", error);

//     order.subtotal = 0;
//     order.totalAmount = 0;
//     order.discountAmount = 0;
//     order.netAmount = 0;
//     order.technicianCut = 0;
//     order.companyCut = 0;
//     order.outstandingAmount = 0;
//   }
// }
