export const emailMessage = (userName, email, OTP) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://via.placeholder.com/150x50?text=TravelAgency" alt="TravelAgency Logo" style="max-width: 100%; height: auto;">
    </div>
    <h2 style="color: #007bff;">Welcome to TravelAgency!</h2>
    <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
    <p style="color: #333; font-size: 16px;">Thank you for signing up with TravelAgency. To complete your registration, please use the OTP code below:</p>
    <div style="text-align: center; margin: 20px 0;">
      <div style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">${OTP}</div>
    </div>
    <p style="color: #333; font-size: 16px;">This OTP is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
    <p style="color: #333; font-size: 16px;">Cheers,</p>
    <p style="color: #333; font-size: 16px;">The TravelAgency Team</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you did not sign up for TravelAgency, please disregard this email.</p>
  </div>
`;
};


export const emailUpdateOTP = (userName, email, newOTP) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=SocialApp" alt="SocialApp Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #007bff;">Update OTP for SocialApp</h2>
      <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">We have received a request to update the OTP for your account on SocialApp. Please use the new OTP code below:</p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">${newOTP}</div>
      </div>
      <p style="color: #333; font-size: 16px;">This OTP is valid for 10 minutes. If you did not request this update, please ignore this email.</p>
      <p style="color: #333; font-size: 16px;">Cheers,</p>
      <p style="color: #333; font-size: 16px;">The SocialApp Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you are not expecting this OTP update, please disregard this email.</p>
    </div>
  `;
};

export const emailForgotPasswordOTP = (userName, email, OTP) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=SocialApp" alt="SocialApp Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #007bff;">Forgot Password Request</h2>
      <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">You have requested to reset your password on SocialApp. Please use the OTP code below to proceed:</p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">${OTP}</div>
      </div>
      <p style="color: #333; font-size: 16px;">This OTP is valid for 10 minutes. If you did not request this password reset, please ignore this email.</p>
      <p style="color: #333; font-size: 16px;">Cheers,</p>
      <p style="color: #333; font-size: 16px;">The SocialApp Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you did not initiate this password reset, please disregard this email.</p>
    </div>
  `;
};


export const resendRegistrationOTPEmail = (userName, email, OTP) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=SocialApp" alt="SocialApp Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #007bff;">Resend Registration OTP</h2>
      <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">We noticed you requested a new OTP code for completing your registration on SocialApp. Please use the OTP code below:</p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">${OTP}</div>
      </div>
      <p style="color: #333; font-size: 16px;">This OTP is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
      <p style="color: #333; font-size: 16px;">Cheers,</p>
      <p style="color: #333; font-size: 16px;">The SocialApp Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you did not sign up for SocialApp, please disregard this email.</p>
    </div>
  `;
};





// --------------------------------------------------------------------------------------------------




export const sendCreditsAddedEmail = (userName, email, creditBalance) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=Luiz+Music" alt="Luiz Music Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #28a745;">Credits Added to Your Account</h2>
      <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">We are excited to inform you that you have been awarded <strong>10 additional credits</strong>!</p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 15px 30px; background-color: #28a745; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          ${creditBalance}
        </div>
      </div>
      <p style="color: #333; font-size: 16px;">Your new credit balance is now <strong>${creditBalance}</strong>.</p>
      <p style="color: #333; font-size: 16px;">Thank you for using our service!</p>
      <p style="color: #333; font-size: 16px;">Best regards,</p>
      <p style="color: #333; font-size: 16px;">The Luiz Music Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you did not request this action, please disregard this email.</p>
    </div>
  `;
};


export const sendNewSubscriptionEmail = (userName, email, creditBalance) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=Luiz+Music" alt="Luiz Music Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #17a2b8;">New Subscription Added</h2>
      <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">A new subscription has been successfully added to your account!</p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 15px 30px; background-color: #17a2b8; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          ${creditBalance}
        </div>
      </div>
      <p style="color: #333; font-size: 16px;">Your current credit balance is now <strong>${creditBalance}</strong>.</p>
      <p style="color: #333; font-size: 16px;">Thank you for choosing our service!</p>
      <p style="color: #333; font-size: 16px;">Best regards,</p>
      <p style="color: #333; font-size: 16px;">The Luiz Music Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you did not request this subscription, please contact our support team.</p>
    </div>
  `;
};




export const SubscriptionCanceledEmail = (userName, email) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=Luiz+Music" alt="Luiz Music Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #dc3545;">Subscription Canceled</h2>
      <p style="color: #333; font-size: 18px;">Dear ${userName},</p>
      <p style="color: #333; font-size: 16px;">We want to let you know that your subscription has been successfully canceled.</p>
      <p style="color: #333; font-size: 16px;">Thank you for being with us! We hope to see you again in the future.</p>
      <p style="color: #333; font-size: 16px;">Best regards,</p>
      <p style="color: #333; font-size: 16px;">The Luiz Music Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you have any questions or need assistance, please contact our support team.</p>
    </div>
  `;
};




export const KeyEventNotificationEmail = (userName, email) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=Luiz+Music" alt="Luiz Music Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #007bff;">Stay Updated with Key Event Notifications!</h2>
      <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">You will now receive <strong>email notifications</strong> for key events, including successfully registering new beats. Stay informed and never miss an important update!</p>
      <p style="color: #333; font-size: 16px;">Thank you for using our service.</p>
      <p style="color: #333; font-size: 16px;">Best regards,</p>
      <p style="color: #333; font-size: 16px;">The Luiz Music Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you have any questions or need assistance, please contact our support team.</p>
    </div>
  `;
};



export const KeyEventFailedNotificationEmail = (userName, email) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://via.placeholder.com/150x50?text=Luiz+Music" alt="Luiz Music Logo" style="max-width: 100%; height: auto;">
      </div>
      <h2 style="color: #dc3545;">Notification: Event Registration Failed</h2>
      <p style="color: #333; font-size: 18px;">Hi ${userName},</p>
      <p style="color: #333; font-size: 16px;">You will now receive <strong>email notifications</strong> for key events, including <span style="color: #dc3545; font-weight: bold;">failed</span> registrations of new beats. Stay informed and never miss an important update!</p>
      <p style="color: #333; font-size: 16px;">Thank you for using our service.</p>
      <p style="color: #333; font-size: 16px;">Best regards,</p>
      <p style="color: #333; font-size: 16px;">The Luiz Music Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #777; font-size: 12px; text-align: center;">This email was sent to ${email}. If you have any questions or need assistance, please contact our support team.</p>
    </div>
  `;
};


