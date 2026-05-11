const sellerSecurity = [{ cookieAuth: [] }];

const sellerPaths = {
  "/api/seller/add-auction": {
    post: {
      tags: ["Seller"],
      summary: "Create auction listing with vehicle details and documents",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["vehicle-name", "car-type", "vehicle-year", "vehicle-mileage", "fuel-type", "transmission", "vehicle-condition", "auction-date", "starting-bid", "registration-number", "vin-number", "chassis-number", "insurance-status", "accident-history", "odometer-reading", "pollution-certificate", "vehicleImage"],
              properties: {
                // Vehicle Basic Info
                "vehicle-name": { type: "string", example: "Toyota Innova Crysta 2020" },
                "car-type": { type: "string", enum: ["Sedan", "SUV", "Hatchback", "Pickup", "Wagon"], example: "SUV" },
                "vehicle-year": { type: "string", example: "2020" },
                "vehicle-mileage": { type: "string", example: "45000" },
                "fuel-type": { type: "string", enum: ["Petrol", "Diesel", "CNG", "Hybrid"], example: "Diesel" },
                "transmission": { type: "string", enum: ["Manual", "Automatic"], example: "Manual" },
                "vehicle-condition": { type: "string", example: "Good condition" },
                
                // Auction Details
                "auction-date": { type: "string", format: "date", example: "2026-04-15" },
                "starting-bid": { type: "string", example: "500000" },
                
                // Registration & Ownership
                "registration-number": { type: "string", example: "KL05AB1234" },
                "registration-state": { type: "string", example: "Kerala" },
                "ownership-type": { type: "string", enum: ["First Owner", "Second Owner", "Third Owner", "Fourth Owner or More"], example: "First Owner" },
                
                // VIN & Chassis
                "vin-number": { type: "string", example: "WVWZZZ1ZZ2E123456" },
                "chassis-number": { type: "string", example: "WVWZZZ1ZZ2E123456" },
                "engine-number": { type: "string", example: "12345678" },
                
                // Insurance
                "insurance-status": { type: "string", enum: ["Valid", "Expired", "No Insurance"], example: "Valid" },
                "insurance-expiry-date": { type: "string", format: "date", example: "2026-12-31" },
                "insurance-type": { type: "string", enum: ["Comprehensive", "Third Party", "None"], example: "Comprehensive" },
                "previous-insurance-claims": { type: "string", enum: ["yes", "no"], example: "no" },
                "insurance-claim-details": { type: "string", example: "No claims yet" },
                
                // Accident & Repairs
                "accident-history": { type: "string", enum: ["yes", "no"], example: "no" },
                "number-of-accidents": { type: "string", example: "0" },
                "accident-details": { type: "string", example: "None" },
                "major-repairs": { type: "string", enum: ["yes", "no"], example: "no" },
                "repair-details": { type: "string", example: "Normal servicing only" },
                
                // Legal & Transfer
                "hypothecation-status": { type: "string", enum: ["Clear - No Loan", "Under Loan/Hypothecation"], example: "Clear - No Loan" },
                "loan-provider": { type: "string", example: "None" },
                "noc-available": { type: "string", enum: ["yes", "no"], example: "yes" },
                "ready-for-transfer": { type: "string", enum: ["yes", "no"], example: "yes" },
                
                // Theft & Legal
                "stolen-vehicle-check": { type: "string", enum: ["Verified Clean", "Not Verified"], example: "Verified Clean" },
                "police-noc": { type: "string", enum: ["yes", "no"], example: "no" },
                "court-cases": { type: "string", enum: ["yes", "no"], example: "no" },
                "court-case-details": { type: "string", example: "None" },
                
                // Odometer & Service
                "odometer-reading": { type: "string", example: "45000" },
                "odometer-verified": { type: "string", enum: ["yes", "no"], example: "yes" },
                "odometer-tampering": { type: "string", enum: ["No Tampering", "Suspected", "Unknown"], example: "No Tampering" },
                "service-history": { type: "string", enum: ["Complete Service Records", "Partial Records", "No Records"], example: "Complete Service Records" },
                "last-service-date": { type: "string", format: "date", example: "2024-12-01" },
                "service-book-available": { type: "string", enum: ["yes", "no"], example: "yes" },
                
                // Pollution & Fitness
                "pollution-certificate": { type: "string", enum: ["Valid", "Expired", "Not Available"], example: "Valid" },
                "pollution-expiry-date": { type: "string", format: "date", example: "2027-12-31" },
                "fitness-certificate-expiry": { type: "string", format: "date", example: "2027-12-31" },
                
                // Files
                vehicleImage: { type: "array", items: { type: "string", format: "binary" }, description: "Multiple vehicle images (max 10)" },
                "registration-certificate": { type: "string", format: "binary", description: "RC registration PDF" },
                "insurance-document": { type: "string", format: "binary", description: "Insurance policy PDF" },
                "fitness-certificate": { type: "string", format: "binary", description: "Fitness certificate PDF" },
                "rc-transfer-form29": { type: "string", format: "binary", description: "Form 29 PDF" },
                "rc-transfer-form30": { type: "string", format: "binary", description: "Form 30 PDF" },
                "road-tax-receipt": { type: "string", format: "binary", description: "Road tax receipt PDF" },
                "address-proof": { type: "string", format: "binary", description: "Address proof PDF" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Auction created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        },
        400: { description: "Validation error - missing required fields or files" },
        401: { description: "Unauthorized - seller not authenticated" },
        500: { description: "Server error" }
      }
    }
  },
  "/api/seller/add-rental": {
    post: {
      tags: ["Seller"],
      summary: "Create rental listing",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["vehicle-name", "vehicle-year", "vehicle-ac", "vehicle-capacity", "vehicle-condition", "vehicle-fuel-type", "vehicle-transmission", "rental-cost", "driver-available", "vehicleImage"],
              properties: {
                // Vehicle Basic Info
                "vehicle-name": { type: "string", example: "Toyota Innova Crysta" },
                "vehicle-year": { type: "string", example: "2022" },
                "vehicle-ac": { type: "string", enum: ["available", "not"], example: "available" },
                "vehicle-capacity": { type: "string", example: "8" },
                "vehicle-condition": { type: "string", enum: ["excellent", "good", "fair"], example: "good" },
                "vehicle-fuel-type": { type: "string", enum: ["petrol", "diesel"], example: "diesel" },
                "vehicle-transmission": { type: "string", enum: ["automatic", "manual"], example: "manual" },
                
                // Rental Details
                "rental-cost": { type: "string", description: "Cost per day in rupees", example: "3500" },
                "driver-available": { type: "string", enum: ["yes", "no"], example: "yes" },
                "driver-rate": { type: "string", description: "Driver charge per day (required if driver-available=yes)", example: "500" },
                
                // Vehicle Image
                vehicleImage: { type: "string", format: "binary" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Rental created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        },
        400: { description: "Validation error - missing required fields" },
        401: { description: "Unauthorized - seller not authenticated" },
        500: { description: "Server error" }
      }
    }
  },
  "/api/seller/profile": {
    get: {
      tags: ["Seller"],
      summary: "Get seller profile",
      security: sellerSecurity,
      responses: { 200: { description: "Profile fetched" } }
    }
  },
  "/api/seller/update-profile": {
    post: {
      tags: ["Seller"],
      summary: "Update seller profile",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                firstName: { type: "string", example: "Ramesh" },
                lastName: { type: "string", example: "Kumar" },
                email: { type: "string", format: "email", example: "ramesh@example.com" },
                phone: { type: "string", pattern: "^\\d{10}$", example: "9876543210" },
                dateOfBirth: { type: "string", format: "date", example: "1990-05-15" },
                doorNo: { type: "string", example: "12A" },
                street: { type: "string", example: "MG Road" },
                city: { type: "string", example: "Kochi" },
                state: { type: "string", example: "Kerala" },
                shopName: { type: "string", description: "Name of the selling shop/business", example: "Ramesh Auto Centre" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" }
            }
          }
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized - seller not authenticated" },
        500: { description: "Server error" }
      }
    }
  },
  "/api/seller/change-password": {
    post: {
      tags: ["Seller"],
      summary: "Change seller password",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordRequest" } } }
      },
      responses: { 200: { description: "Password changed" } }
    }
  },
  "/api/seller/view-auctions": {
    get: {
      tags: ["Seller"],
      summary: "Get seller auctions",
      security: sellerSecurity,
      responses: { 200: { description: "Auctions fetched" } }
    }
  },
  "/api/seller/view-bids/{id}": {
    get: {
      tags: ["Seller"],
      summary: "View bids for an auction",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Bids fetched" } }
    }
  },
  "/api/seller/view-rentals": {
    get: {
      tags: ["Seller"],
      summary: "Get seller rentals",
      security: sellerSecurity,
      responses: { 200: { description: "Rentals fetched" } }
    }
  },
  "/api/seller/auction-details/{id}": {
    get: {
      tags: ["Seller"],
      summary: "Get auction details",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Auction details fetched" },
        404: { description: "Auction not found" }
      }
    }
  },
  "/api/seller/update-preferences": {
    post: {
      tags: ["Seller"],
      summary: "Update seller preferences",
      security: sellerSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["notificationPreference"],
              properties: {
                notificationPreference: {
                  type: "string",
                  enum: ["all", "important", "none"],
                  example: "important"
                }
              }
            }
          }
        }
      },
      responses: { 200: { description: "Preferences updated" } }
    }
  },
  "/api/seller/rental-details/{id}": {
    get: {
      tags: ["Seller"],
      summary: "Get rental details",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Rental details fetched" },
        404: { description: "Rental not found" }
      }
    }
  },
  "/api/seller/rental/mark-returned/{id}": {
    post: {
      tags: ["Seller"],
      summary: "Mark rental as returned",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Rental marked returned" },
        400: { description: "Cannot mark returned before drop date" },
        404: { description: "Rental not found" }
      }
    }
  },
  "/api/seller/seller": {
    get: {
      tags: ["Seller"],
      summary: "Get seller dashboard",
      security: sellerSecurity,
      responses: {
        200: { description: "Dashboard fetched" },
        404: { description: "User not found" }
      }
    }
  },
  "/api/seller/update-rental/{id}": {
    put: {
      tags: ["Seller"],
      summary: "Update rental listing",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["vehicle-ac", "vehicle-condition", "rental-cost", "driver-available", "availability"],
              properties: {
                "vehicle-ac": { type: "string", enum: ["available", "not"], example: "available" },
                "vehicle-condition": { type: "string", enum: ["excellent", "good", "fair"], example: "good" },
                "rental-cost": { type: "string", example: "3500" },
                "driver-available": { type: "string", enum: ["yes", "no"], example: "yes" },
                "driver-rate": { type: "string", example: "500" },
                availability: { type: "string", enum: ["available", "unavailable"], example: "available" },
                vehicleImage: { type: "string", format: "binary" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Rental updated" },
        400: { description: "Validation error" },
        404: { description: "Rental not found" }
      }
    }
  },
  "/api/seller/view-earnings": {
    get: {
      tags: ["Seller"],
      summary: "Get seller earnings",
      security: sellerSecurity,
      responses: { 200: { description: "Earnings fetched" } }
    }
  },
  "/api/seller/toggle-rental-status/{id}": {
    post: {
      tags: ["Seller"],
      summary: "Toggle rental availability status",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Rental status toggled" },
        403: { description: "Unauthorized" },
        404: { description: "Rental not found" }
      }
    }
  },
  "/api/seller/rentals/{id}/reviews": {
    get: {
      tags: ["Seller"],
      summary: "Get reviews for a rental",
      security: sellerSecurity,
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { 200: { description: "Reviews fetched" } }
    }
  }
};

export default sellerPaths;
