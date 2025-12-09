import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const printWebPDF = (html, title) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    return true;
  }
  return false;
};

export const generateCustomersPDF = async (customers) => {
  const rows = customers.map((c, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding: 8px; border: 1px solid #ddd;">${c.date}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.time || '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.mobile}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.items}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #b8860b;">${c.total}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.status || 'Received'}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HGL Customer Records</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #b8860b; padding-bottom: 20px; }
        .header h1 { color: #333; margin: 0; font-size: 24px; }
        .header h2 { color: #0066b3; margin: 5px 0; font-size: 18px; }
        .header p { color: #666; font-style: italic; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #b8860b; color: white; padding: 12px 8px; text-align: left; border: 1px solid #b8860b; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; }
        .date { text-align: right; color: #888; font-size: 11px; margin-bottom: 10px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HINDUSTAN GEMOLOGICAL LABORATORY</h1>
        <h2>HGL</h2>
        <p>Accurate. Confidential. Integrity</p>
      </div>
      <div class="date">Generated: ${new Date().toLocaleString('en-IN')}</div>
      <h3 style="color: #333;">Customer Records Report</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Customer Name</th>
            <th>Mobile</th>
            <th>Items</th>
            <th>Total Pcs</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <p>www.hgl-labs.com | info@hgl-labs.com | +91 44 48553527</p>
        <p>Chennai, India</p>
      </div>
    </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      return printWebPDF(html, 'HGL Customer Records');
    }
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    return false;
  }
};

export const generateCardsPDF = async (cards) => {
  const rows = cards.map((c, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #b8860b;">HGL${String(c.jobNo).padStart(5, '0')}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.date}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.item}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.karat}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.weight}g</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.pieces}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.type}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${c.status || 'Issued'}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HGL Card Records</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #b8860b; padding-bottom: 20px; }
        .header h1 { color: #333; margin: 0; font-size: 24px; }
        .header h2 { color: #0066b3; margin: 5px 0; font-size: 18px; }
        .header p { color: #666; font-style: italic; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #b8860b; color: white; padding: 12px 8px; text-align: left; border: 1px solid #b8860b; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; }
        .date { text-align: right; color: #888; font-size: 11px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HINDUSTAN GEMOLOGICAL LABORATORY</h1>
        <h2>HGL</h2>
        <p>Accurate. Confidential. Integrity</p>
      </div>
      <div class="date">Generated: ${new Date().toLocaleString('en-IN')}</div>
      <h3 style="color: #333;">Hallmark Cards Report</h3>
      <table>
        <thead>
          <tr>
            <th>Job No</th>
            <th>Date</th>
            <th>Article</th>
            <th>Purity</th>
            <th>Weight</th>
            <th>Pieces</th>
            <th>Marking</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">
        <p>www.hgl-labs.com | info@hgl-labs.com | +91 44 48553527</p>
        <p>Chennai, India</p>
      </div>
    </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      return printWebPDF(html, 'HGL Cards Report');
    }
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    return false;
  }
};

export const generateCertificatePDF = async (cardData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HGL Certificate - ${cardData.jobNo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
        .card { border: 3px solid #b8860b; border-radius: 15px; overflow: hidden; }
        .card-header { background: linear-gradient(135deg, #b8860b 0%, #d4a84b 100%); padding: 20px; text-align: center; }
        .card-header h1 { color: #fff; margin: 0; font-size: 22px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
        .card-header h2 { color: #fff; margin: 5px 0 0 0; font-size: 16px; font-weight: normal; }
        .hallmark-badge { background: #fff; color: #b8860b; padding: 8px 20px; display: inline-block; border-radius: 20px; font-weight: bold; margin-top: 10px; font-size: 14px; }
        .card-body { padding: 25px; background: #fff; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #e0e0e0; }
        .info-label { color: #666; font-weight: bold; font-size: 13px; }
        .info-value { color: #333; font-size: 14px; }
        .purity { color: #b8860b; font-weight: bold; font-size: 18px; }
        .qr-section { text-align: center; margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 10px; }
        .footer { text-align: center; padding: 15px; background: #f5f5f5; font-size: 11px; color: #666; }
        .footer a { color: #0066b3; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="card-header">
          <h1>HINDUSTAN GEMOLOGICAL LABORATORY</h1>
          <h2>Certificate of Hallmarking</h2>
          <div class="hallmark-badge">HGL HALLMARKED</div>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">Job Number:</span>
            <span class="info-value" style="color: #b8860b; font-weight: bold;">${cardData.jobNo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date of Issue:</span>
            <span class="info-value">${cardData.date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Article:</span>
            <span class="info-value">${cardData.item}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Purity (Karat):</span>
            <span class="purity">${cardData.purity}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Gross Weight:</span>
            <span class="info-value">${cardData.weight} grams</span>
          </div>
          <div class="info-row">
            <span class="info-label">No. of Pieces:</span>
            <span class="info-value">${cardData.pieces}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Marking Type:</span>
            <span class="info-value">${cardData.type}</span>
          </div>
          ${cardData.description && cardData.description !== '-' ? `
          <div class="info-row">
            <span class="info-label">Description:</span>
            <span class="info-value">${cardData.description}</span>
          </div>
          ` : ''}
          <div class="qr-section">
            <p style="margin: 0; color: #666; font-size: 12px;">Scan QR code to verify authenticity</p>
            <p style="margin: 5px 0 0 0; color: #0066b3; font-size: 11px;">${cardData.qrValue}</p>
          </div>
        </div>
        <div class="footer">
          <p><strong>Hindustan Gemological Laboratory</strong></p>
          <p>Chennai, India | +91 44 48553527</p>
          <p><a href="https://hgl-labs.com">www.hgl-labs.com</a> | info@hgl-labs.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      return printWebPDF(html, 'HGL Certificate');
    }
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
    return true;
  } catch (error) {
    console.error('Certificate PDF error:', error);
    return false;
  }
};

export const generateCustomersCSV = async (customers) => {
  const headers = 'Date,Time,Customer Name,Mobile,Items,Total Pieces,Status\n';
  const rows = customers.map(c => 
    `"${c.date}","${c.time || '-'}","${c.name}","${c.mobile}","${c.items}","${c.total}","${c.status || 'Received'}"`
  ).join('\n');
  
  const csv = headers + rows;
  
  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HGL_Customers_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } else {
      const fileUri = FileSystem.documentDirectory + `HGL_Customers_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
      }
      return true;
    }
  } catch (error) {
    console.error('CSV generation error:', error);
    return false;
  }
};

export const generateCardsCSV = async (cards) => {
  const headers = 'Job No,Date,Article,Purity,Weight (g),Pieces,Marking Type,Description,Status\n';
  const rows = cards.map(c => 
    `"HGL${String(c.jobNo).padStart(5, '0')}","${c.date}","${c.item}","${c.karat}","${c.weight}","${c.pieces}","${c.type}","${c.desc || '-'}","${c.status || 'Issued'}"`
  ).join('\n');
  
  const csv = headers + rows;
  
  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HGL_Cards_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } else {
      const fileUri = FileSystem.documentDirectory + `HGL_Cards_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
      }
      return true;
    }
  } catch (error) {
    console.error('CSV generation error:', error);
    return false;
  }
};
