const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../data/Application1.xlsx');

console.log('📊 Testing Excel Import with Application1.xlsx');
console.log('==============================================');

try {
  // Check if file exists
  if (!fs.existsSync(excelFilePath)) {
    console.error('❌ Excel file not found:', excelFilePath);
    process.exit(1);
  }

  console.log('✅ Excel file found:', excelFilePath);

  // Read the Excel file
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('📊 Total rows:', jsonData.length);
  
  if (jsonData.length > 0) {
    // Extract headers (first row)
    const headers = jsonData[0];
    console.log('📋 Headers found:', headers.length);
    
    // Process first 5 data rows to test the mapping
    const dataRows = jsonData.slice(1);
    console.log('\n📝 Testing field mapping for first 5 rows:');
    
    for (let i = 0; i < Math.min(5, dataRows.length); i++) {
      const row = dataRows[i];
      const rowNumber = i + 2;
      
      // Create a mapping from headers to values
      const rowData = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          rowData[header.trim()] = row[index];
        }
      });
      
      // Map fields based on the existing Excel structure
      const firstName = rowData['formData.q1'] || rowData['First Name'] || '';
      const lastName = rowData['formData.q2'] || rowData['Last Name'] || '';
      const email = rowData['email'] || rowData['formData.email'] || rowData['Email'] || '';
      const phone = rowData['phone'] || rowData['formData.phone'] || rowData['Phone'] || '';
      
      console.log(`\nRow ${rowNumber}:`);
      console.log(`  First Name: "${firstName}"`);
      console.log(`  Last Name: "${lastName}"`);
      console.log(`  Email: "${email}"`);
      console.log(`  Phone: "${phone}"`);
      
      // Check if all required fields are present
      const missingFields = [];
      if (!firstName) missingFields.push('First Name');
      if (!lastName) missingFields.push('Last Name');
      if (!email) missingFields.push('Email');
      if (!phone) missingFields.push('Phone');
      
      if (missingFields.length > 0) {
        console.log(`  ❌ Missing: ${missingFields.join(', ')}`);
      } else {
        console.log(`  ✅ All required fields present`);
      }
    }
    
    // Count valid rows
    let validRows = 0;
    let invalidRows = 0;
    
    dataRows.forEach((row, index) => {
      const rowNumber = index + 2;
      
      // Create a mapping from headers to values
      const rowData = {};
      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          rowData[header.trim()] = row[index];
        }
      });
      
      // Map fields
      const firstName = rowData['formData.q1'] || rowData['First Name'] || '';
      const lastName = rowData['formData.q2'] || rowData['Last Name'] || '';
      const email = rowData['email'] || rowData['formData.email'] || rowData['Email'] || '';
      const phone = rowData['phone'] || rowData['formData.phone'] || rowData['Phone'] || '';
      
      // Check if all required fields are present
      if (firstName && lastName && email && phone) {
        validRows++;
      } else {
        invalidRows++;
      }
    });
    
    console.log(`\n📊 Import Analysis:`);
    console.log(`✅ Valid rows: ${validRows}`);
    console.log(`❌ Invalid rows: ${invalidRows}`);
    console.log(`📈 Success rate: ${((validRows / dataRows.length) * 100).toFixed(1)}%`);
    
    if (validRows > 0) {
      console.log(`\n🎯 Ready to import ${validRows} applications!`);
      console.log(`💡 Use the "Import Excel" button in the applications dashboard to import these applications.`);
    } else {
      console.log(`\n⚠️  No valid applications found to import.`);
    }
    
  } else {
    console.log('❌ No data found in Excel file');
  }
  
} catch (error) {
  console.error('❌ Error reading Excel file:', error.message);
  process.exit(1);
}

console.log('\n🎉 Excel import test completed!'); 