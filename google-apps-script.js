/**
 * ========================================
 * GOOGLE APPS SCRIPT - BACKEND INTEGRATION
 * ========================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. In the first row, create headers: Timestamp, Theme, Package, Names, Date, Venue, Email
 * 3. Name the sheet tab "Sheet1" (at the bottom)
 * 4. Go to Extensions > Apps Script
 * 5. Delete any existing code and paste this entire script
 * 6. Click Deploy > New Deployment
 * 7. Select "Web App" as the type
 * 8. Change "Who has access" to "Anyone"
 * 9. Click Deploy and copy the Web App URL
 * 10. Paste the URL into script.js as GOOGLE_APPS_SCRIPT_URL
 */

/**
 * Handle POST requests from the web form
 * @param {Object} e - Event object containing POST data
 * @returns {ContentService} JSON response
 */
function doPost(e) {
  // Add CORS headers to ensure the browser accepts the response
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
  };

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

    // Parse JSON from request body (sent from JavaScript with Content-Type: application/json)
    var data = JSON.parse(e.postData.contents);

    // Append the data as a new row
    sheet.appendRow([
      new Date(),                    // Timestamp
      data.theme || "N/A",           // Selected theme
      data.package || "Signature",   // Selected package
      data.coupleNames || "N/A",     // Couple's names
      data.weddingDate || "N/A",     // Wedding date
      data.venue || "N/A",           // Venue/location
      data.email || ""               // Email
    ]);

    // Send auto-reply if email is provided
    if (data.email) {
      sendAutoReplyEmail(data);
    }

    // Return success response with CORS headers
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "Data saved successfully"
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Graceful error logging
    Logger.log("Error saving data: " + error.message);
    Logger.log("Raw postData: " + JSON.stringify(e.postData));
    
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.message
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 * @returns {ContentService} Simple response
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "active",
    "message": "Sabah Wedding E-Invite API is running"
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Send professional auto-reply email to the couple
 * @param {Object} data - Form data object
 */
function sendAutoReplyEmail(data) {
  // Determine package-specific details
  var packageName = data.package || "Signature";
  var packageFeatures = "";
  var contactTimeframe = "24 hours";
  
  if (packageName === "Classic") {
    packageFeatures = "Classic (Static E-Invite)";
    contactTimeframe = "24 hours";
  } else if (packageName === "Signature") {
    packageFeatures = "Signature (Animated + RSVP)";
    contactTimeframe = "24 hours";
  } else if (packageName === "Bespoke") {
    packageFeatures = "Bespoke (Fully Custom Design)";
    contactTimeframe = "48 hours (VIP priority)";
  } else {
    packageFeatures = packageName;
  }

  var subject = "Your Sabah Wedding Invitation Inquiry";

  var htmlBody = `
    <div style="font-family: 'Georgia', serif; padding: 30px; background: #f8f9fa; border-radius: 10px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; font-size: 24px; margin: 0; font-family: 'Playfair Display', serif;">Magnificent Sabah Weddings</h1>
          <p style="color: #888; font-size: 12px; margin: 5px 0 0; letter-spacing: 2px;">DIGITAL E-INVITATIONS</p>
        </div>

        <!-- Greeting -->
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Dear <strong>${data.coupleNames}</strong>,</p>

        <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          Thank you for choosing our <strong style="color: #D4AF37;">${data.theme}</strong> theme with the
          <strong style="color: #D4AF37;">${packageFeatures}</strong> package for your celebration at
          <strong>${data.venue}</strong> on <strong>${data.weddingDate}</strong>.
        </p>

        <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          Our team is reviewing your details and will reach out via WhatsApp shortly to finalize your custom e-invite design.
        </p>

        <!-- What's Next -->
        <div style="background: #FDF5E6; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #D4AF37; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">What's Next?</h3>
          <ul style="color: #555; font-size: 13px; line-height: 2; margin: 0; padding-left: 20px;">
            <li>Our designer will contact you within ${contactTimeframe}</li>
            <li>Review and customize your ${packageFeatures} features</li>
            <li>Finalize guest list and delivery method</li>
            <li>Launch your beautiful digital invitation</li>
          </ul>
        </div>

        <!-- Contact Info -->
        <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
          If you have any immediate questions, feel free to reach out via WhatsApp.
        </p>

        <!-- Signature -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #333; font-size: 14px; margin: 0;"><i>Warm regards,</i></p>
          <p style="color: #D4AF37; font-size: 16px; font-weight: bold; margin: 5px 0 0;">The Wedding Design Team</p>
          <p style="color: #888; font-size: 12px; margin: 5px 0 0;">Sabah Wedding E-Invites</p>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #aaa; font-size: 11px; margin: 0;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>

      </div>
    </div>
  `;

  var plainTextBody = `Dear ${data.coupleNames},\n\n` +
    `Thank you for choosing our ${data.theme} theme with the ${packageFeatures} package for your celebration at ${data.venue} on ${data.weddingDate}.\n\n` +
    `Our team is reviewing your details and will reach out via WhatsApp shortly to finalize your custom e-invite design.\n\n` +
    `What's Next:\n` +
    `- Our designer will contact you within ${contactTimeframe}\n` +
    `- Review and customize your ${packageFeatures} features\n` +
    `- Finalize guest list and delivery method\n` +
    `- Launch your beautiful digital invitation\n\n` +
    `If you have any immediate questions, feel free to reach out via WhatsApp.\n\n` +
    `Warm regards,\n` +
    `The Wedding Design Team\n` +
    `Sabah Wedding E-Invites`;

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody,
    plainTextBody: plainTextBody
  });
}

/**
 * Test function to verify the script is working
 * Run this from the Apps Script editor to test
 */
function testFunction() {
  Logger.log("Google Apps Script is working correctly!");

  // Test data formatted as e.parameter would receive it
  var mockEvent = {
    parameter: {
      theme: "Enchanted Rainforest",
      package: "Signature",
      coupleNames: "Adam & Hawa",
      weddingDate: "2026-05-30",
      venue: "Borneo Royale Hotel",
      email: "test@example.com"
    }
  };

  // Call doPost with the mock event to test the sheet appending and email
  doPost(mockEvent);
}
