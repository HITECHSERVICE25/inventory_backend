const ExcelJS = require("exceljs");

async function generateOrdersExcel(orders) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Orders");

  // FULL HEADERS (Everything flattened)
  worksheet.columns = [
    // ORDER CORE
    { header: "Order _id", key: "order_id", width: 28 },
    { header: "TCR Number", key: "TCRNumber", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Created At", key: "createdAt", width: 22 },

    // COMPANY
    { header: "Company _id", key: "company_id", width: 28 },
    { header: "Company Name", key: "company_name", width: 20 },
    { header: "Company Installation Charge", key: "company_install_charge", width: 20 },

    { header: "Technician Name", key: "tech_name", width: 20 },
    { header: "Phone", key: "tech_phone", width: 15 },
    { header: "Email", key: "tech_email", width: 25 },
    { header: "Aadhaar", key: "tech_aadhaar", width: 18 },
    { header: "PAN", key: "tech_pan", width: 15 },
    { header: "Service Rate", key: "tech_serviceRate", width: 15 },


    // CUSTOMER
    { header: "Customer Name", key: "cust_name", width: 20 },
    { header: "Customer Phone", key: "cust_phone", width: 15 },
    { header: "Customer Alt Phone", key: "cust_altPhone", width: 15 },
    { header: "Customer Street", key: "cust_street", width: 20 },
    { header: "Customer City", key: "cust_city", width: 15 },
    { header: "Customer State", key: "cust_state", width: 15 },
    { header: "Customer Pincode", key: "cust_pincode", width: 10 },

    // ORDER FINANCIAL
    { header: "Product Charge", key: "productCharge", width: 15 },
    { header: "Installation Charge", key: "installationCharge", width: 15 },
    { header: "Free Installation", key: "freeInstallation", width: 15 },
    { header: "Fitting Cost", key: "fittingCost", width: 15 },
    { header: "Misc Cost", key: "miscCost", width: 15 },
    { header: "Product Discount %", key: "discountPercentage", width: 15 },
    { header: "Discount Approved", key: "discountApproved", width: 15 },
    { header: "Discount Approved By", key: "discountApprovedBy", width: 28 },
    { header: "Discount Owner %", key: "discountOwner", width: 15 },
    { header: "Discount Tech %", key: "discountTech", width: 15 },
    { header: "Misc Discount %", key: "miscDiscountPercentage", width: 15 },
    { header: "Misc Owner %", key: "miscOwner", width: 15 },
    { header: "Misc Tech %", key: "miscTech", width: 15 },
    { header: "Company Cut", key: "companyCut", width: 15 },
    { header: "Technician Cut", key: "technicianCut", width: 15 },
    { header: "Net Amount", key: "netAmount", width: 15 },
    { header: "Outstanding Amount", key: "outstandingAmount", width: 18 },
    { header: "Total Amount", key: "totalAmount", width: 15 },

    { header: "Product Name", key: "product_name", width: 20 },
    { header: "Unit Of Measure", key: "unitOfMeasure", width: 15 },
    { header: "Price", key: "price", width: 12 },
    { header: "Quantity", key: "quantity", width: 10 }
  ];

  worksheet.getColumn("createdAt").numFmt = "dd-mm-yyyy";


//   orders.forEach(order => {

//     const productTotal =
//     order.products?.reduce(
//       (sum, item) =>
//         sum + (item.product?.price || 0) * (item.quantity || 0),
//       0
//     ) || 0;

//     order.products.forEach(item => {
//       worksheet.addRow({
//         order_id: order._id,
//         TCRNumber: order.TCRNumber,
//         status: order.status,
//         createdAt: order.createdAt,
        

//         company_id: order.company?._id,
//         company_name: order.company?.name,
//         company_install_charge: order.company?.installationCharge,
        

//         tech_id: order.technician?._id,
//         tech_name: order.technician?.name,
//         tech_phone: order.technician?.phone,
//         tech_email: order.technician?.email,
//         tech_aadhaar: order.technician?.aadhaar,
//         tech_pan: order.technician?.pan,
//         tech_serviceRate: order.technician?.serviceRate,

//         cust_name: order.customer?.name,
//         cust_phone: order.customer?.contact?.phone,
//         cust_altPhone: order.customer?.contact?.alternatePhone,
//         cust_street: order.customer?.address?.street,
//         cust_city: order.customer?.address?.city,
//         cust_state: order.customer?.address?.state,
//         cust_pincode: order.customer?.address?.pincode,

//         productCharge:productTotal,
//         installationCharge: order.installationCharge,
//         freeInstallation: order.freeInstallation,
//         fittingCost: order.fittingCost,
//         miscCost: order.miscellaneousCost,
//         discountPercentage: order.discountPercentage,
//         discountApproved: order.discountApproved,
//         discountApprovedBy: order.discountApprovedBy,
//         discountOwner: order.discountSplit?.ownerPercentage,
//         discountTech: order.discountSplit?.technicianPercentage,
//         miscDiscountPercentage: order.miscDiscountPercentage,
//         miscOwner: order.miscDiscountSplit?.ownerPercentage,
//         miscTech: order.miscDiscountSplit?.technicianPercentage,
//         companyCut: order.companyCut,
//         technicianCut: order.technicianCut,
//         netAmount: order.netAmount,
//         outstandingAmount: order.outstandingAmount,
//         totalAmount: order.totalAmount,

//         product_row_id: item._id,
//         product_id: item.product?._id,
//         product_name: item.product?.name,
//         unitOfMeasure: item.product?.unitOfMeasure,
//         price: item.product?.price,
//         quantity: item.quantity
//       });
//     });
//   });


orders.forEach((order, orderIndex) => {

  const productTotal =
    order.products?.reduce(
      (sum, item) =>
        sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    ) || 0;

  // 🎨 Alternate colors per order
  const fillColor =
    orderIndex % 2 === 0
      ? "FFEDC7" // light grey
      : "9CCFFF"; // white

  order.products.forEach(item => {
    const row = worksheet.addRow({
      order_id: order._id,
      TCRNumber: order.TCRNumber,
      status: order.status,
      createdAt: order.createdAt,

      company_id: order.company?._id,
      company_name: order.company?.name,
      company_install_charge: order.company?.installationCharge,

      tech_name: order.technician?.name,
      tech_phone: order.technician?.phone,
      tech_email: order.technician?.email,
      tech_aadhaar: order.technician?.aadhaar,
      tech_pan: order.technician?.pan,
      tech_serviceRate: order.technician?.serviceRate,

      cust_name: order.customer?.name,
      cust_phone: order.customer?.contact?.phone,
      cust_altPhone: order.customer?.contact?.alternatePhone,
      cust_street: order.customer?.address?.street,
      cust_city: order.customer?.address?.city,
      cust_state: order.customer?.address?.state,
      cust_pincode: order.customer?.address?.pincode,

      productCharge: productTotal,
      installationCharge: order.installationCharge,
      freeInstallation: order.freeInstallation,
      fittingCost: order.fittingCost,
      miscCost: order.miscellaneousCost,
      discountPercentage: order.discountPercentage,
      discountApproved: order.discountApproved,
      discountApprovedBy: order.discountApprovedBy,
      discountOwner: order.discountSplit?.ownerPercentage,
      discountTech: order.discountSplit?.technicianPercentage,
      miscDiscountPercentage: order.miscDiscountPercentage,
      miscOwner: order.miscDiscountSplit?.ownerPercentage,
      miscTech: order.miscDiscountSplit?.technicianPercentage,
      companyCut: order.companyCut,
      technicianCut: order.technicianCut,
      netAmount: order.netAmount,
      outstandingAmount: order.outstandingAmount,
      totalAmount: order.totalAmount,

      product_name: item.product?.name,
      unitOfMeasure: item.product?.unitOfMeasure,
      price: item.product?.price,
      quantity: item.quantity
    });

    // 🎨 Apply background color to entire row
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor }
      };
    });
  });
});


  return workbook;
}

module.exports = { generateOrdersExcel };
