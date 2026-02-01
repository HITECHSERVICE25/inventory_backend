const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');

exports.createDraftOrder = async (req, res, next) => {
  try {
    // Extract the entire customer object from the request
    const { customer } = req.body;
    
    // Create a complete customer object with all fields
    const completeCustomer = {
      name: customer.name,
      contact: {
        phone: customer.contact.phone,
        alternatePhone: customer.contact.alternatePhone || '' // Handle optional field
      },
      address: {
        street: customer.address.street || '', // Handle optional field
        city: customer.address.city || '',     // Handle optional field
        state: customer.address.state || '',   // Handle optional field
        pincode: customer.address.pincode
      }
    };

    const order = await orderService.createDraftOrder({
      ...req.body,
      customer: completeCustomer  // Use the complete customer object
    });
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.updateDraftOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Create complete update object
    const updateData = {
      ...req.body,
      customer: {
        name: req.body.customer?.name,
        contact: {
          phone: req.body.customer?.contact?.phone,
          alternatePhone: req.body.customer?.contact?.alternatePhone || ''
        },
        address: {
          street: req.body.customer?.address?.street || '',
          city: req.body.customer?.address?.city || '',
          state: req.body.customer?.address?.state || '',
          pincode: req.body.customer?.address?.pincode
        }
      }
    };

    // Validate required fields
    if (!updateData.customer.name || 
        !updateData.customer.contact.phone || 
        !updateData.customer.address.pincode) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, phone, and pincode are required'
      });
    }

    const updatedOrder = await orderService.updateDraftOrder(id, updateData);
    
    res.status(200).json({ 
      success: true, 
      data: updatedOrder 
    });
  } catch (error) {
    next(error);
  }
};

exports.completeOrder = async (req, res, next) => {
  try {
    const order = await orderService.submitOrderCompletion(
      req.params.id,
      req.body
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.approveDiscount = async (req, res, next) => {
  try {
    // const { ownerPercentage, technicianPercentage } = req.body;
    
    const order = await orderService.approveDiscount(
      req.params.id,
      req.user.id,
      req.body
    );
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.rejectDiscount = async (req, res, next) => {
  try {
    const order = await orderService.rejectDiscount(
      req.params.id,
      req.user.id
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.recordPayment({
      ...req.body,
      receivedBy: req.user.id
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.getOutstanding = async (req, res, next) => {
  try {
    const balance = await paymentService.getOutstandingBalance(req.params.technicianId);
    res.status(200).json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
};


exports.getDraftOrders = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    
    page = page > 0 ? page : 1;
    limit = limit > 0 && limit <= 100 ? limit : 10;
    
    const skip = (page - 1) * limit;
    
    const { draftOrders, total, skip: actualSkip, limit: actualLimit } = 
      await orderService.getDraftOrders({ skip, limit });
    
    const pages = Math.ceil(total / actualLimit);
    
    res.status(200).json({
      success: true,
      data: draftOrders,
      pagination: {
        total,
        page,
        pages,
        limit: actualLimit,
        skip: actualSkip
      }
    });
  } catch (error) {
    next(error);
  }
};