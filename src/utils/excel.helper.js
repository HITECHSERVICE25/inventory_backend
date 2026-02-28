const ExcelJS = require("exceljs");

// async function generateOrdersExcel(orders) {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Orders");

//   // FULL HEADERS (Everything flattened)
//   worksheet.columns = [
//     // ORDER CORE
//     { header: "Order _id", key: "order_id", width: 28 },
//     { header: "TCR Number", key: "TCRNumber", width: 20 },
//     { header: "Status", key: "status", width: 15 },
//     { header: "Created At", key: "createdAt", width: 22 },

//     // COMPANY
//     { header: "Company _id", key: "company_id", width: 28 },
//     { header: "Company Name", key: "company_name", width: 20 },
//     { header: "Company Installation Charge", key: "company_install_charge", width: 20 },

//     { header: "Technician Name", key: "tech_name", width: 20 },
//     { header: "Phone", key: "tech_phone", width: 15 },
//     { header: "Email", key: "tech_email", width: 25 },
//     { header: "Aadhaar", key: "tech_aadhaar", width: 18 },
//     { header: "PAN", key: "tech_pan", width: 15 },
//     { header: "Service Rate", key: "tech_serviceRate", width: 15 },


//     // CUSTOMER
//     { header: "Customer Name", key: "cust_name", width: 20 },
//     { header: "Customer Phone", key: "cust_phone", width: 15 },
//     { header: "Customer Alt Phone", key: "cust_altPhone", width: 15 },
//     { header: "Customer Street", key: "cust_street", width: 20 },
//     { header: "Customer City", key: "cust_city", width: 15 },
//     { header: "Customer State", key: "cust_state", width: 15 },
//     { header: "Customer Pincode", key: "cust_pincode", width: 10 },

//     // ORDER FINANCIAL
//     { header: "Product Charge", key: "productCharge", width: 15 },
//     { header: "Installation Charge", key: "installationCharge", width: 15 },
//     { header: "Free Installation", key: "freeInstallation", width: 15 },
//     { header: "Fitting Cost", key: "fittingCost", width: 15 },
//     { header: "Misc Cost", key: "miscCost", width: 15 },
//     { header: "Product Discount %", key: "discountPercentage", width: 15 },
//     { header: "Discount Approved", key: "discountApproved", width: 15 },
//     { header: "Discount Approved By", key: "discountApprovedBy", width: 28 },
//     { header: "Discount Owner %", key: "discountOwner", width: 15 },
//     { header: "Discount Tech %", key: "discountTech", width: 15 },
//     { header: "Misc Discount %", key: "miscDiscountPercentage", width: 15 },
//     { header: "Misc Owner %", key: "miscOwner", width: 15 },
//     { header: "Misc Tech %", key: "miscTech", width: 15 },
//     { header: "Company Cut", key: "companyCut", width: 15 },
//     { header: "Technician Cut", key: "technicianCut", width: 15 },
//     { header: "Net Amount", key: "netAmount", width: 15 },
//     { header: "Outstanding Amount", key: "outstandingAmount", width: 18 },
//     { header: "Total Amount", key: "totalAmount", width: 15 },

//     { header: "Product Name", key: "product_name", width: 20 },
//     { header: "Unit Of Measure", key: "unitOfMeasure", width: 15 },
//     { header: "Price", key: "price", width: 12 },
//     { header: "Quantity", key: "quantity", width: 10 }
//   ];

//   worksheet.getColumn("createdAt").numFmt = "dd-mm-yyyy";


// orders.forEach((order, orderIndex) => {

//   const productTotal =
//     order.products?.reduce(
//       (sum, item) =>
//         sum + (item.product?.price || 0) * (item.quantity || 0),
//       0
//     ) || 0;

//   // 🎨 Alternate colors per order
//   const fillColor =
//     orderIndex % 2 === 0
//       ? "FFEDC7" // light grey
//       : "9CCFFF"; // white

//   order.products.forEach(item => {
//     const row = worksheet.addRow({
//       order_id: order._id,
//       TCRNumber: order.TCRNumber,
//       status: order.status,
//       createdAt: order.createdAt,

//       company_id: order.company?._id,
//       company_name: order.company?.name,
//       company_install_charge: order.company?.installationCharge,

//       tech_name: order.technician?.name,
//       tech_phone: order.technician?.phone,
//       tech_email: order.technician?.email,
//       tech_aadhaar: order.technician?.aadhaar,
//       tech_pan: order.technician?.pan,
//       tech_serviceRate: order.technician?.serviceRate,

//       cust_name: order.customer?.name,
//       cust_phone: order.customer?.contact?.phone,
//       cust_altPhone: order.customer?.contact?.alternatePhone,
//       cust_street: order.customer?.address?.street,
//       cust_city: order.customer?.address?.city,
//       cust_state: order.customer?.address?.state,
//       cust_pincode: order.customer?.address?.pincode,

//       productCharge: productTotal,
//       installationCharge: order.installationCharge,
//       freeInstallation: order.freeInstallation,
//       fittingCost: order.fittingCost,
//       miscCost: order.miscellaneousCost,
//       discountPercentage: order.discountPercentage,
//       discountApproved: order.discountApproved,
//       discountApprovedBy: order.discountApprovedBy,
//       discountOwner: order.discountSplit?.ownerPercentage,
//       discountTech: order.discountSplit?.technicianPercentage,
//       miscDiscountPercentage: order.miscDiscountPercentage,
//       miscOwner: order.miscDiscountSplit?.ownerPercentage,
//       miscTech: order.miscDiscountSplit?.technicianPercentage,
//       companyCut: order.companyCut,
//       technicianCut: order.technicianCut,
//       netAmount: order.netAmount,
//       outstandingAmount: order.outstandingAmount,
//       totalAmount: order.totalAmount,

//       product_name: item.product?.name,
//       unitOfMeasure: item.product?.unitOfMeasure,
//       price: item.product?.price,
//       quantity: item.quantity
//     });

//     // 🎨 Apply background color to entire row
//     row.eachCell((cell) => {
//       cell.fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: fillColor }
//       };
//     });
//   });
// });


//   return workbook;
// }


async function generateOrdersExcel(orders) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Orders");

  worksheet.columns = [
    // ORDER CORE
    { header: "Order _id", key: "order_id", width: 28 },
    { header: "TCR Number", key: "TCRNumber", width: 20 },
    { header: "Status", key: "status", width: 18 },
    { header: "Created At", key: "createdAt", width: 22 },
    { header: "Completion Date", key: "completionDate", width: 22 },
    { header: "Remarks", key: "remarks", width: 25 },

    // COMPANY
    { header: "Company _id", key: "company_id", width: 28 },
    { header: "Company Name", key: "company_name", width: 20 },
    { header: "Company Installation Charge", key: "company_install_charge", width: 22 },

    // TECHNICIAN
    { header: "Technician Name", key: "tech_name", width: 20 },
    { header: "Phone", key: "tech_phone", width: 15 },
    { header: "Email", key: "tech_email", width: 25 },
    { header: "Service Rate", key: "tech_serviceRate", width: 15 },
    { header: "Misc Share %", key: "tech_miscShare", width: 15 },

    // CUSTOMER
    { header: "Customer Name", key: "cust_name", width: 20 },
    { header: "Customer Phone", key: "cust_phone", width: 15 },
    { header: "Customer Alt Phone", key: "cust_altPhone", width: 15 },
    { header: "Customer Street", key: "cust_street", width: 20 },
    { header: "Customer City", key: "cust_city", width: 15 },
    { header: "Customer State", key: "cust_state", width: 15 },
    { header: "Customer Pincode", key: "cust_pincode", width: 12 },

    // FINANCIALS
    { header: "Installation Charge", key: "installationCharge", width: 18 },
    { header: "Free Installation", key: "freeInstallation", width: 18 },
    { header: "Fitting Cost", key: "fittingCost", width: 15 },
    { header: "Misc Cost", key: "miscCost", width: 15 },

    { header: "Discount Type", key: "discountType", width: 15 },
    { header: "Discount Value", key: "discountValue", width: 15 },
    { header: "Discount Amount", key: "discountAmount", width: 18 },
    { header: "Discount Approved", key: "discountApproved", width: 18 },
    { header: "Discount Approved By", key: "discountApprovedBy", width: 28 },
    { header: "Discount Owner %", key: "discountOwner", width: 15 },
    { header: "Discount Tech %", key: "discountTech", width: 15 },

    { header: "Total Amount", key: "totalAmount", width: 18 },
    { header: "Net Amount", key: "netAmount", width: 18 },
    { header: "Technician Cut", key: "technicianCut", width: 18 },
    { header: "Company Cut", key: "companyCut", width: 18 },
    { header: "Outstanding Amount", key: "outstandingAmount", width: 20 },

    // PRODUCT LEVEL
    { header: "Product Name", key: "product_name", width: 20 },
    { header: "Unit Of Measure", key: "unitOfMeasure", width: 15 },
    { header: "Price", key: "price", width: 15 },
    { header: "Quantity", key: "quantity", width: 12 }
  ];

  worksheet.getColumn("createdAt").numFmt = "dd-mm-yyyy";
  worksheet.getColumn("completionDate").numFmt = "dd-mm-yyyy";

  orders.forEach(order => {
  
  
    const products = order.products && order.products.length > 0
  ? order.products
  : [null]; // fallback row

    products.forEach(item => {
      worksheet.addRow({
        order_id: order._id,
        TCRNumber: order.TCRNumber,
        status: order.status,
        createdAt: order.createdAt,
        completionDate: order.completionDate,
        remarks: order.remarks,

        company_id: order.company?._id,
        company_name: order.company?.name,
        company_install_charge: order.company?.installationCharge,

        tech_name: order.technician?.name,
        tech_phone: order.technician?.phone,
        tech_email: order.technician?.email,
        tech_serviceRate: order.technician?.serviceRate,
        tech_miscShare: order.technician?.miscShare,

        cust_name: order.customer?.name,
        cust_phone: order.customer?.contact?.phone,
        cust_altPhone: order.customer?.contact?.alternatePhone,
        cust_street: order.customer?.address?.street,
        cust_city: order.customer?.address?.city,
        cust_state: order.customer?.address?.state,
        cust_pincode: order.customer?.address?.pincode,

        installationCharge: order.installationCharge,
        freeInstallation: order.freeInstallation,
        fittingCost: order.fittingCost,
        miscCost: order.miscellaneousCost,

        discountType: order.discount?.type,
        discountValue: order.discount?.value,
        discountAmount: order.discountAmount,
        discountApproved: order.discountApproved,
        discountApprovedBy: order.discountApprovedBy,
        discountOwner: order.discountSplit?.ownerPercentage,
        discountTech: order.discountSplit?.technicianPercentage,

        totalAmount: order.totalAmount,
        netAmount: order.netAmount,
        technicianCut: order.technicianCut,
        companyCut: order.companyCut,
        outstandingAmount: order.outstandingAmount,

        // PRODUCT LEVEL (safe handling)
        product_name: item?.product?.name || "",
        unitOfMeasure: item?.product?.unitOfMeasure || "",
        price: item?.product?.price || "",
        quantity: item?.quantity || ""
      });
    });
  });

  return workbook;
}

async function generateAllocationsExcel(allocations) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Allocations");

  worksheet.columns = [
    { header: "Allocation ID", key: "allocation_id", width: 28 },
    { header: "Allocated At", key: "allocatedAt", width: 22 },
    { header: "Created At", key: "createdAt", width: 22 },
    { header: "Updated At", key: "updatedAt", width: 22 },

    // PRODUCT
    { header: "Product ID", key: "product_id", width: 28 },
    { header: "Product Name", key: "product_name", width: 22 },
    { header: "Unit Of Measure", key: "unitOfMeasure", width: 18 },
    { header: "Product Price", key: "product_price", width: 18 },

    // TECHNICIAN
    { header: "Technician ID", key: "technician_id", width: 28 },
    { header: "Technician Name", key: "technician_name", width: 22 },
    { header: "Technician Phone", key: "technician_phone", width: 18 },
    { header: "Technician Email", key: "technician_email", width: 28 },

    // ALLOCATION
    { header: "Quantity Allocated", key: "quantity", width: 18 },
  
  ];

  // Date formatting
  worksheet.getColumn("allocatedAt").numFmt = "dd-mm-yyyy";
  worksheet.getColumn("createdAt").numFmt = "dd-mm-yyyy";
  worksheet.getColumn("updatedAt").numFmt = "dd-mm-yyyy";

  allocations.forEach(allocation => {
    worksheet.addRow({
      allocation_id: allocation._id,
      allocatedAt: allocation.allocatedAt,
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,

      product_id: allocation.product?._id || "",
      product_name: allocation.product?.name || "",
      unitOfMeasure: allocation.product?.unitOfMeasure || "",
      product_price: allocation.product?.price || "",

      technician_id: allocation.technician?._id || "",
      technician_name: allocation.technician?.name || "",
      technician_phone: allocation.technician?.phone || "",
      technician_email: allocation.technician?.email || "",

      quantity: allocation.quantity
    });
  });

  return workbook;
}

async function generatePaymentsExcel(payments) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Payments");

  worksheet.columns = [
    // PAYMENT INFO
    { header: "Payment ID", key: "payment_id", width: 28 },
    { header: "Collected At", key: "collectedAt", width: 22 },
    { header: "Created At", key: "createdAt", width: 22 },
    { header: "Updated At", key: "updatedAt", width: 22 },

    // TECHNICIAN
    { header: "Technician ID", key: "technician_id", width: 28 },
    { header: "Technician Name", key: "technician_name", width: 22 },
    { header: "Technician Phone", key: "technician_phone", width: 18 },
    { header: "Technician Email", key: "technician_email", width: 28 },

    // PAYMENT DETAILS
    { header: "Amount", key: "amount", width: 18 },
    { header: "Method", key: "method", width: 18 },
    { header: "Reference", key: "reference", width: 24 },
    { header: "Status", key: "status", width: 18 },

    // RECEIVED BY (USER)
    { header: "Received By ID", key: "receivedBy_id", width: 28 },
    { header: "Received By Name", key: "receivedBy_name", width: 22 },
    { header: "Received By Email", key: "receivedBy_email", width: 28 },

    // NOTES
    { header: "Notes", key: "notes", width: 30 },
  ];

  // Date formatting (same as allocation)
  worksheet.getColumn("collectedAt").numFmt = "dd-mm-yyyy";
  worksheet.getColumn("createdAt").numFmt = "dd-mm-yyyy";
  worksheet.getColumn("updatedAt").numFmt = "dd-mm-yyyy";

  payments.forEach(payment => {
    worksheet.addRow({
      payment_id: payment._id,
      collectedAt: payment.collectedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,

      technician_id: payment.technician?._id || "",
      technician_name: payment.technician?.name || "",
      technician_phone: payment.technician?.phone || "",
      technician_email: payment.technician?.email || "",

      amount: payment.amount,
      method: payment.method,
      reference: payment.reference || "",
      status: payment.status,

      receivedBy_id: payment.receivedBy?._id || "",
      receivedBy_name: payment.receivedBy?.name || "",
      receivedBy_email: payment.receivedBy?.email || "",

      notes: payment.notes || ""
    });
  });

  return workbook;
}

module.exports = { generateOrdersExcel, generateAllocationsExcel, generatePaymentsExcel };


// (order.products || []).forEach(item => {
    //   worksheet.addRow({
    //     order_id: order._id,
    //     TCRNumber: order.TCRNumber,
    //     status: order.status,
    //     createdAt: order.createdAt,
    //     completionDate: order.completionDate,
    //     remarks: order.remarks,

    //     company_id: order.company?._id,
    //     company_name: order.company?.name,
    //     company_install_charge: order.company?.installationCharge,

    //     tech_name: order.technician?.name,
    //     tech_phone: order.technician?.phone,
    //     tech_email: order.technician?.email,
    //     tech_serviceRate: order.technician?.serviceRate,
    //     tech_miscShare: order.technician?.miscShare,

    //     cust_name: order.customer?.name,
    //     cust_phone: order.customer?.contact?.phone,
    //     cust_altPhone: order.customer?.contact?.alternatePhone,
    //     cust_street: order.customer?.address?.street,
    //     cust_city: order.customer?.address?.city,
    //     cust_state: order.customer?.address?.state,
    //     cust_pincode: order.customer?.address?.pincode,

    //     installationCharge: order.installationCharge,
    //     freeInstallation: order.freeInstallation,
    //     fittingCost: order.fittingCost,
    //     miscCost: order.miscellaneousCost,

    //     discountType: order.discount?.type,
    //     discountValue: order.discount?.value,
    //     discountAmount: order.discountAmount,
    //     discountApproved: order.discountApproved,
    //     discountApprovedBy: order.discountApprovedBy,
    //     discountOwner: order.discountSplit?.ownerPercentage,
    //     discountTech: order.discountSplit?.technicianPercentage,

    //     totalAmount: order.totalAmount,
    //     netAmount: order.netAmount,
    //     technicianCut: order.technicianCut,
    //     companyCut: order.companyCut,
    //     outstandingAmount: order.outstandingAmount,

    //     product_name: item.product?.name,
    //     unitOfMeasure: item.product?.unitOfMeasure,
    //     price: item.product.price,
    //     quantity: item.quantity
    //   });
    // });