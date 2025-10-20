const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Import Prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../data/Application1.xlsx');

console.log('🚀 Starting Application Import Process');
console.log('=====================================');

async function importApplications() {
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
    
    console.log('📊 Total rows found:', jsonData.length);
    
    if (jsonData.length < 2) {
      console.log('❌ No data rows found in Excel file');
      return;
    }

    // Extract headers (first row)
    const headers = jsonData[0];
    console.log('📋 Headers found:', headers.length);
    
    // Process data rows (skip header row)
    const dataRows = jsonData.slice(1);
    console.log('📈 Data rows to process:', dataRows.length);
    
    const importedApplications = [];
    const errors = [];
    const skippedDuplicates = [];
    
    // Get a default user ID (you may want to change this)
    const defaultUserId = "cmcdl82ko0000jkigr7q2i049"; // Using the provided user ID
    
    console.log('\n🔄 Starting import process...');
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 because we start from row 2 (after header)
      
      try {
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
        const existingId = rowData['id'] || ''; // Use existing ID from Excel file
        
        // Validate required fields
        if (!firstName || !lastName || !email || !phone) {
          errors.push({
            row: rowNumber,
            error: `Missing required fields: ${!firstName ? 'First Name' : ''} ${!lastName ? 'Last Name' : ''} ${!email ? 'Email' : ''} ${!phone ? 'Phone' : ''}`.trim()
          });
          continue;
        }
        
        // Check if application already exists (by ID, email, or phone)
        const existingApplication = await prisma.application.findFirst({
          where: {
            OR: [
              { id: existingId },
              { email: email },
              { phone: phone }
            ]
          }
        });
        
        if (existingApplication) {
          skippedDuplicates.push({
            row: rowNumber,
            id: existingId,
            email: email,
            phone: phone,
            existingId: existingApplication.id
          });
          continue;
        }
        
        // Use existing ID from Excel file, or generate new one if not available
        const applicationId = existingId || `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create formData object from the Excel row
        const formDataObj = {};
        headers.forEach((header, index) => {
          if (header && header.startsWith('formData.') && row[index] !== undefined) {
            const key = header.replace('formData.', '');
            formDataObj[key] = row[index];
          }
        });
        
        // Add basic fields to formData
        formDataObj['First Name'] = firstName;
        formDataObj['Last Name'] = lastName;
        formDataObj['Email'] = email;
        formDataObj['Phone'] = phone;
        
        // Create application record
        const application = await prisma.application.create({
          data: {
            id: applicationId,
            userId: defaultUserId,
            phone: phone,
            email: email,
            status: 'SUBMITTED',
            formData: formDataObj,
            currentStep: 1,
            dccCreated: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        importedApplications.push({
          id: application.id,
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone
        });
        
        // Progress indicator
        if ((i + 1) % 100 === 0) {
          console.log(`📊 Processed ${i + 1}/${dataRows.length} rows...`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing row ${rowNumber}:`, error.message);
        errors.push({
          row: rowNumber,
          error: error.message
        });
      }
    }
    
    console.log('\n📊 Import Process Completed!');
    console.log('============================');
    console.log(`✅ Successfully imported: ${importedApplications.length} applications`);
    console.log(`⏭️  Skipped duplicates: ${skippedDuplicates.length} applications`);
    console.log(`❌ Errors: ${errors.length} rows`);
    console.log(`📈 Total processed: ${dataRows.length} rows`);
    
    if (importedApplications.length > 0) {
      console.log('\n🎉 Sample imported applications:');
      importedApplications.slice(0, 5).forEach((app, index) => {
        console.log(`  ${index + 1}. ${app.name} (${app.email})`);
      });
    }
    
    if (skippedDuplicates.length > 0) {
      console.log('\n⏭️  Sample skipped duplicates:');
      skippedDuplicates.slice(0, 5).forEach((dup, index) => {
        console.log(`  ${index + 1}. Row ${dup.row}: ${dup.email} (already exists)`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Sample errors:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. Row ${error.row}: ${error.error}`);
      });
    }
    
    console.log('\n🎯 Import Summary:');
    console.log(`   • New applications added: ${importedApplications.length}`);
    console.log(`   • Duplicates skipped: ${skippedDuplicates.length}`);
    console.log(`   • Errors encountered: ${errors.length}`);
    console.log(`   • Success rate: ${((importedApplications.length / dataRows.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importApplications()
  .then(() => {
    console.log('\n🎉 Import process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }); 