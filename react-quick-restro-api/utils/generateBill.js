const PDFDocument = require('pdfkit');

exports.generateBillPDF = (orderData) => {
  return new Promise((resolve) => {
    // Create a document with compact dimensions
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Define colors and styling constants
    const primaryColor = '#2980b9';
    const secondaryColor = '#34495e';
    const textColor = '#333333';
    const lightGray = '#f9f9f9';
    const borderColor = '#dddddd';

    // --------- HEADER ---------
    // Add a minimal header with logo/restaurant name
    doc
      .fontSize(20)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('React-Quick-Restro', { align: 'center' });

    doc
      .fontSize(12)
      .fillColor(secondaryColor)
      .font('Helvetica')
      .text('Order Receipt / Tax Invoice', { align: 'center' });

    // Horizontal line
    doc
      .moveTo(40, doc.y + 5)
      .lineTo(doc.page.width - 40, doc.y + 5)
      .stroke(borderColor);

    // --------- ORDER & CUSTOMER INFO ---------
    const startY = doc.y + 15;
    const colWidth = (doc.page.width - 80) / 2;

    // Left column - Order details
    doc
      .fontSize(11)
      .fillColor(secondaryColor)
      .font('Helvetica-Bold')
      .text('ORDER DETAILS', 40, startY);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(textColor)
      .text(`Order ID: `, 40, startY + 15, { continued: true })
      .font('Helvetica-Bold')
      .text(`${orderData._id}`);

    // Status with color coding
    doc
      .font('Helvetica')
      .text(`Status: `, 40, startY + 30, { continued: true });

    // Highlight status based on value
    if (orderData.status === 'completed') {
      doc.font('Helvetica-Bold').fillColor('#27ae60');
    } else {
      doc.font('Helvetica-Bold').fillColor('#e74c3c');
    }
    doc.text(`${orderData.status.toUpperCase()}`);

    // Payment status with color coding
    doc
      .font('Helvetica')
      .fillColor(textColor)
      .text(`Payment Status: `, 40, startY + 45, { continued: true });

    if (orderData.paymentStatus === 'paid') {
      doc.font('Helvetica-Bold').fillColor('#27ae60');
    } else {
      doc.font('Helvetica-Bold').fillColor('#e74c3c');
    }
    doc.text(`${orderData.paymentStatus.toUpperCase()}`);

    doc
      .font('Helvetica')
      .fillColor(textColor)
      .text(`Payment Method: `, 40, startY + 60, { continued: true })
      .font('Helvetica-Bold')
      .text(`${orderData.paymentMethod.toUpperCase()}`);

    doc
      .font('Helvetica')
      .fillColor(textColor)
      .text(`Delivery Mode: `, 40, startY + 75, { continued: true })
      .font('Helvetica-Bold')
      .text(`${orderData.delivery.toUpperCase()}`);

    // Right column - Customer details
    doc
      .fontSize(11)
      .fillColor(secondaryColor)
      .font('Helvetica-Bold')
      .text('CUSTOMER DETAILS', 40 + colWidth, startY);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(textColor)
      .text(`Name: `, 40 + colWidth, startY + 15, { continued: true })
      .font('Helvetica-Bold')
      .text(`${orderData.recipientName}`);

    doc
      .font('Helvetica')
      .text(`Email: `, 40 + colWidth, startY + 30, { continued: true })
      .font('Helvetica-Bold')
      .text(`${orderData.recipientEmail}`);

    doc
      .font('Helvetica')
      .text(`Phone: `, 40 + colWidth, startY + 45, { continued: true })
      .font('Helvetica-Bold')
      .text(`${orderData.recipientPhoneNumber}`);

    // Horizontal line
    doc
      .moveTo(40, startY + 100)
      .lineTo(doc.page.width - 40, startY + 100)
      .stroke(borderColor);

    // --------- ITEMS TABLE ---------
    const tableTop = startY + 115;

    // Items section title
    doc
      .fontSize(11)
      .fillColor(secondaryColor)
      .font('Helvetica-Bold')
      .text('ORDER SUMMARY', 40, tableTop);

    // Table header
    const tableHeaderY = tableTop + 20;

    // Table header background
    doc.rect(40, tableHeaderY - 5, doc.page.width - 80, 20).fill(lightGray);

    // Table headers
    doc.font('Helvetica-Bold').fontSize(9).fillColor(secondaryColor);

    doc.text('No.', 50, tableHeaderY);
    doc.text('Item Name', 80, tableHeaderY);
    doc.text('Qty', 300, tableHeaderY, { width: 30, align: 'center' });
    doc.text('Price', 340, tableHeaderY, { width: 70, align: 'right' });
    doc.text('Total', 430, tableHeaderY, { width: 70, align: 'right' });

    // Table data
    let y = tableHeaderY + 25;
    let itemCount = 0;

    // Items
    orderData.items.forEach((item, index) => {
      // Add subtle separator lines between items
      if (index > 0) {
        doc
          .moveTo(50, y - 5)
          .lineTo(doc.page.width - 50, y - 5)
          .stroke('#eeeeee');
      }

      const name = item?.name || 'Unknown Item';
      const qty = item.quantity;
      const price = item.price;
      const total = qty * price;

      doc
        .fillColor(textColor)
        .font('Helvetica')
        .fontSize(9)
        .text(`${index + 1}`, 50, y);

      doc.text(name, 80, y, { width: 210 });
      doc.text(`${qty}`, 300, y, { width: 30, align: 'center' });
      doc.text(`₹${price.toFixed(2)}`, 340, y, { width: 70, align: 'right' });
      doc.text(`₹${total.toFixed(2)}`, 430, y, { width: 70, align: 'right' });

      y += 20;
      itemCount++;
    });

    // Horizontal line
    doc
      .moveTo(40, y + 5)
      .lineTo(doc.page.width - 40, y + 5)
      .stroke(borderColor);

    // --------- TOTAL SECTION ---------
    const totalY = y + 15;

    // Total amount
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(secondaryColor)
      .text('Total Amount:', 340, totalY, { align: 'left' });

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(primaryColor)
      .text(`₹${orderData.totalAmount.toFixed(2)}`, 430, totalY, {
        width: 70,
        align: 'right',
      });

    // --------- FOOTER ---------
    // Calculate footer position to ensure it stays on the first page
    const footerY = Math.min(totalY + 50, doc.page.height - 70);

    // Horizontal line
    doc
      .moveTo(40, footerY)
      .lineTo(doc.page.width - 40, footerY)
      .stroke(borderColor);

    doc
      .fontSize(8)
      .fillColor(textColor)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString()}`, 40, footerY + 10);

    doc
      .fontSize(10)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('Thank you for ordering with React-Quick-Restro!', {
        align: 'center',
      });

    doc.end();
  });
};
