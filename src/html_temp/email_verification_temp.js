const verifyEmailTemp = (data) => {
  //   return `
  //   <!DOCTYPE html>
  // <html lang="en">
  //   <head>
  //     <title></title>
  //     <style>
  //     h1 { color: green; }
  //   </style>
  //   </head>
  //   <body>
  //     <div>
  //       <h1>Mealble</h1>
  //     </div>
  //     <div>
  //         <p>We are excited to welcome you to mealble. Before we proceed, we want to verify the email you provided is valid.</p>
  //         <p>Kindly use the code below for verification on the app</p>

  //         <h2>${data.otp}</h2>

  //         <p>Best Regards</p>
  //         <p>Mealble Team</p>
  //     </div>
  //   </body>
  // </html>

  // `;

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        /* Container for the email */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        /* Header section */
        .header {
            background-color: teal;
            padding: 20px;
            color: #fff;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }

        /* Mealble logo */
        .logo {
            max-width: 100px;
            margin: 0 auto;
            display: block;
        }

        /* Verification code section */
        .verification-code {
            padding: 30px;
            background-color: #f9f9f9;
            border-radius: 0 0 5px 5px;
        }

        /* Verification code text */
        .verification-code p {
            font-size: 18px;
            margin: 0;
            padding: 0;
            text-align: center;
        }

        /* Verification code number */
        .verification-code h2 {
            font-size: 36px;
            margin: 20px 0;
            padding: 0;
            text-align: center;
            color: orange;
        }

        /* CTA button */
        .cta-button {
            text-align: center;
            margin-top: 20px;
        }

        .cta-button a {
            display: inline-block;
            background-color: teal;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
        }

        /* Footer section */
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img class="logo" src="https://res.cloudinary.com/db1ipfcji/image/upload/v1690208012/5_vv7cjc.png" alt="Mealble Logo">
            <h1>Email Verification</h1>
        </div>
        <div class="verification-code">
            <p>Here's your verification code:</p>
            <h2>${data.otp}</h2>
        </div>
      
        <div class="footer">
            <p>We are glad to welcome you to Mealble Fam.</p>
            <p>Best regards,<br>from Mealble Team</p>
        </div>
    </div>
</body>
</html>

`;
};

module.exports = { verifyEmailTemp };
