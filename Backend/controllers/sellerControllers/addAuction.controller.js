// controllers/sellerControllers/addAuction.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import { uploadToCloudinary } from '../../utils/fileUpload.js';

export const postAddAuction = async (req, res) => {
  console.log('📋 [Add Auction] ========================================');
  console.log('📋 [Add Auction] Request received');
  console.log('📋 [Add Auction] Files:', req.files ? Object.keys(req.files) : 'No files');
  console.log('📋 [Add Auction] Body keys:', Object.keys(req.body));
  console.log('📋 [Add Auction] Documentation fields received:', {
    registrationNumber: req.body['registration-number'],
    vinNumber: req.body['vin-number'],
    chassisNumber: req.body['chassis-number'],
    insuranceStatus: req.body['insurance-status'],
    accidentHistory: req.body['accident-history'],
    pollutionCertificate: req.body['pollution-certificate'],
    odometerReading: req.body['odometer-reading'],
  });

  try {
    // Check for required vehicle image
    if (!req.files || !req.files['vehicleImage'] || !req.files['vehicleImage'][0]) {
      console.log('❌ [Add Auction] Vehicle image missing');
      return res.status(400).json({ success: false, message: 'Vehicle image required' });
    }

    // Helper function to upload single file
    const uploadFile = async (file, folder = 'drivebidrent/documents') => {
      if (!file) return null;
      try {
        const uploaded = await uploadToCloudinary(file.buffer, folder);
        return uploaded?.secure_url || uploaded?.url || null;
      } catch (error) {
        console.error(`Upload error for ${folder}:`, error);
        return null;
      }
    };

    // Upload ALL vehicle images (supports multiple)
    const vehicleImageFiles = req.files['vehicleImage'];
    const vehicleImageUrls = [];
    for (const file of vehicleImageFiles) {
      const url = await uploadFile(file, 'drivebidrent/vehicles');
      if (url) vehicleImageUrls.push(url);
    }
    
    if (vehicleImageUrls.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to upload vehicle image(s)' });
    }

    // First image is the primary (backward compat)
    const mainImageUrl = vehicleImageUrls[0];
    const additionalImageUrls = vehicleImageUrls.slice(1);
    console.log(`✅ [Add Auction] Uploaded ${vehicleImageUrls.length} vehicle image(s)`);

    // Upload all document files
    const registrationCertUrl = req.files['registration-certificate'] 
      ? await uploadFile(req.files['registration-certificate'][0], 'drivebidrent/documents/rc') 
      : null;
    
    const insuranceDocUrl = req.files['insurance-document'] 
      ? await uploadFile(req.files['insurance-document'][0], 'drivebidrent/documents/insurance') 
      : null;
    
    const fitnessCertUrl = req.files['fitness-certificate'] 
      ? await uploadFile(req.files['fitness-certificate'][0], 'drivebidrent/documents/fitness') 
      : null;
    
    const form29Url = req.files['rc-transfer-form29'] 
      ? await uploadFile(req.files['rc-transfer-form29'][0], 'drivebidrent/documents/forms') 
      : null;
    
    const form30Url = req.files['rc-transfer-form30'] 
      ? await uploadFile(req.files['rc-transfer-form30'][0], 'drivebidrent/documents/forms') 
      : null;
    
    const roadTaxUrl = req.files['road-tax-receipt'] 
      ? await uploadFile(req.files['road-tax-receipt'][0], 'drivebidrent/documents/tax') 
      : null;
    
    const addressProofUrl = req.files['address-proof'] 
      ? await uploadFile(req.files['address-proof'][0], 'drivebidrent/documents/kyc') 
      : null;

    // Build vehicle documentation object
    const vehicleDocumentation = {
      // Registration & Ownership
      registrationNumber: req.body['registration-number'],
      registrationState: req.body['registration-state'],
      ownershipType: req.body['ownership-type'],
      registrationCertificate: registrationCertUrl,
      
      // VIN & Chassis
      vinNumber: req.body['vin-number'],
      chassisNumber: req.body['chassis-number'],
      engineNumber: req.body['engine-number'],
      
      // Insurance
      insuranceStatus: req.body['insurance-status'],
      insuranceExpiryDate: req.body['insurance-expiry-date'] || null,
      insuranceType: req.body['insurance-type'] || null,
      previousInsuranceClaims: req.body['previous-insurance-claims'] === 'yes',
      insuranceClaimDetails: req.body['insurance-claim-details'] || '',
      insuranceDocument: insuranceDocUrl,
      
      // Accident History
      accidentHistory: req.body['accident-history'] === 'yes',
      numberOfAccidents: parseInt(req.body['number-of-accidents']) || 0,
      accidentDetails: req.body['accident-details'] || '',
      majorRepairs: req.body['major-repairs'] === 'yes',
      repairDetails: req.body['repair-details'] || '',
      
      // Legal & Transfer
      hypothecationStatus: req.body['hypothecation-status'],
      loanProvider: req.body['loan-provider'] || '',
      nocAvailable: req.body['noc-available'] === 'yes',
      readyForTransfer: req.body['ready-for-transfer'] === 'yes',
      
      // Theft & Legal
      stolenVehicleCheck: req.body['stolen-vehicle-check'],
      policeNOC: req.body['police-noc'] === 'yes',
      courtCases: req.body['court-cases'] === 'yes',
      courtCaseDetails: req.body['court-case-details'] || '',
      
      // Odometer & Service
      odometerReading: req.body['odometer-reading'] ? parseInt(req.body['odometer-reading']) : undefined,
      odometerVerified: req.body['odometer-verified'] === 'yes',
      odometerTampering: req.body['odometer-tampering'] || 'Unknown',
      serviceHistory: req.body['service-history'] || 'No Records',
      lastServiceDate: req.body['last-service-date'] || null,
      serviceBookAvailable: req.body['service-book-available'] === 'yes',
      
      // Pollution & Fitness
      pollutionCertificate: req.body['pollution-certificate'],
      pollutionExpiryDate: req.body['pollution-expiry-date'] || null,
      fitnessCertificate: fitnessCertUrl,
      fitnessCertificateExpiry: req.body['fitness-certificate-expiry'] || null,
      
      // Additional Documents
      rcTransferForm29: form29Url,
      rcTransferForm30: form30Url,
      roadTaxReceipt: roadTaxUrl,
      addressProof: addressProofUrl,
      
      // Verification Status (defaults)
      documentsVerified: false,
      verifiedBy: null,
      verificationDate: null,
      verificationNotes: ''
    };

    // Create auction request with complete data
    const auction = new AuctionRequest({
      // Basic Vehicle Info
      vehicleName: req.body['vehicle-name'],
      mainImage: mainImageUrl,
      additionalImages: additionalImageUrls,
      carType: req.body['car-type'],
      year: parseInt(req.body['vehicle-year']),
      mileage: parseInt(req.body['vehicle-mileage']),
      fuelType: req.body['fuel-type'],
      transmission: req.body['transmission'],
      condition: req.body['vehicle-condition'],
      auctionDate: req.body['auction-date'],
      expectedBid: parseFloat(req.body['starting-bid']),  // seller's expected amount
      
      // Documentation
      vehicleDocumentation,
      
      // Seller info & status
      sellerId: req.user._id,
      status: 'pending',
    });

    await auction.save();
    
    console.log('✅ [Add Auction] Auction created successfully:', auction._id);
    console.log('✅ [Add Auction] Vehicle Documentation saved:', {
      hasDocumentation: !!auction.vehicleDocumentation,
      registrationNumber: auction.vehicleDocumentation?.registrationNumber,
      vinNumber: auction.vehicleDocumentation?.vinNumber,
      insuranceStatus: auction.vehicleDocumentation?.insuranceStatus,
    });
    console.log('📋 [Add Auction] ========================================');
    
    res.json({ 
      success: true, 
      message: 'Auction request submitted successfully. Awaiting verification and mechanic inspection.', 
      data: auction 
    });
  } catch (err) {
    console.error('Add Auction Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to create auction request' 
    });
  }
};