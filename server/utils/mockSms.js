// Generates a random 6-digit number
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// The Mock "Twilio" sender
export const sendMockSMS = (phoneNumber, otp) => {
  console.log(`\n=========================================`);
  console.log(`📱 MOCK SMS DISPATCHED`);
  console.log(`To: ${phoneNumber}`);
  console.log(`Message: Your Admin verification code is: ${otp}`);
  console.log(`=========================================\n`);

  // We return a resolved promise so the controller thinks an actual API call succeeded
  return Promise.resolve(true);
};
