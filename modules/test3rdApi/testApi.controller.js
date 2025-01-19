const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
const xml2js = require("xml2js");



exports.testApi = async (req, res) => {
  //---------------------------------------------------- Authkey generate start here with private abd shared key-------------------------------------------------------
  const hitTheApi = async () => {
    const privateKey = process.env.PRIVATE_KEY;
    const sharedKey = process.env.SHAREDKEY;
    const component = "authkey.create";
    console.log("Private Key:", privateKey);
    console.log("Shared Key:", sharedKey);

    const ztime = Math.floor(Date.now());
    console.log(
      "Generated ztime (seconds since 1970-01-01 00:00:00 GMT):",
      ztime
    );

    const params = {
      component: component,
      sharedkey: sharedKey,
      ztime: ztime,
    };
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    console.log("Sorted Parameters:", sortedParams);

    const dataStream = `${privateKey}&${sortedParams}`;
    //console.log("Data Stream for SHA-1:", dataStream);

    const signature = crypto
      .createHash("sha1")
      .update(dataStream, "utf8")
      .digest("hex");

    console.log("Generated Signature: m10000000000000000000000", signature);

    const apiUrl = `http://arena.safecreative.org/v2/`;
    const finalUrl = `${apiUrl}?${sortedParams}&signature=${signature}`;

    console.log("Final API URL:", finalUrl);

    // Step 6: Make the API request
    try {
      const response = await axios.get(finalUrl);
      console.log("API Response:", response.data);

      //  --------------------------------respons data converting xml start here-------------------------------------------------------------

      // Parse the XML response
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      // Extract authkey and privatekey
      const authkey = result.authkeycreate.authkey[0];
      const privatekey1 = result.authkeycreate.privatekey[0];
      console.log(authkey, privateKey);
      const apiUrl2 = "http://arena.safecreative.org/api-ui/authkey.edit";
      const level = "GET";


      //const redirectUrl = `${apiUrl}?authkey=${authkey}&level=${level}&sharedkey=${sharedKey}&ztime=${ztime}&signature=${signature}`;
      //  i have to do here maintain different folder-----------------
      const stringToSign = `authkey=${authkey}&level=${level}&sharedkey=${sharedKey}&ztime=${ztime}`;
      const signature = crypto
        .createHmac("sha1", privatekey1)
        .update(stringToSign)
        .digest("hex");

      // Step 4: Construct the redirect URL
      const redirectUrl = `${apiUrl2}?authkey=${authkey}&level=${level}&sharedkey=${sharedKey}&ztime=${ztime}&signature=${signature}`;





      // const authorizationUrl = await getAuthorizationUrl(
      //   apiUrl2,
      //   sharedKey,
      //   level,
      //   authkey,
      //   privatekey1
      // );
      // console.log("Authorization URL:", authorizationUrl);
      // -----------------------------end-------------------------------------------------

      return {redirectUrl, authkey, privatekey1};
      //return response.data;
    } catch (error) {
      console.error(
        "API Error:",
        error.response ? error.response.data : error.message
      );
      throw error.response ? error.response.data : error.message;
    }
  };

  // -------------------------------Get Authorization Url--------------------------------------------
  // async function getAuthorizationUrl(
  //   apiUrl,
  //   sharedKey,
  //   level = "GET",
  //   authkey,
  //   privatekey1
  // ) {
  //   try {
  //     // Step 1: Request to create an authkey
  //     //const response = await axios.post(apiUrl);
  //     //const parser = new xml2js.Parser();
  //     //const result = await parser.parseStringPromise(response.data);

  //     // Step 2: Extract authkey and privatekey
  //     //const authkey = result.authkeycreate.authkey[0];
  //     //const privatekey = result.authkeycreate.privatekey[0];

  //     // Save the credentials securely for future use
  //     //const credentials = { authkey, privatekey };
  //     //console.log("Parsed Credentials:", credentials);

  //     // Step 3: Generate ztime and signature
  //     // const ztime = Date.now().toString();
  //     // const stringToSign = `authkey=${authkey}&level=${level}&sharedkey=${sharedKey}&ztime=${ztime}`;
  //     // const signature = crypto
  //     //   .createHmac("sha1", privatekey1)
  //     //   .update(stringToSign)
  //     //   .digest("hex");

  //     // // Step 4: Construct the redirect URL
  //     // const redirectUrl = `${apiUrl}?authkey=${authkey}&level=${level}&sharedkey=${sharedKey}&ztime=${ztime}&signature=${signature}`;

  //     // 
      










  //     // fetch(redirectUrl)
  //     // .then(response => response.json())  // Assuming the response is in JSON format
  //     // .then(data => {
  //     //   console.log('API Response:', data);
  //     //    uploadUrl =  uploadUrlfunction (authkey, ztime, signature);

  //     // })

  //     // .catch(error => {
  //     //   console.error('Error hitting the API:', error);
  //     // });

  //     // const uploadUrlfunction = async (authkey, ztime, signature) => {
  //     //   // -----------------------------getupload audiofile url---------------------------------------
  //     //   const apiUrl3 = `http://arena.safecreative.org/v2/?component=work.upload.lookup&authkey=${authkey}&filename=long.txt&ztime=${ztime}&signature=${signature}`;
  //     //   const response = await axios.get(apiUrl3);
  //     //   console.log("API Response:", response.data);
  //     //   return response.data;
  //     // };

  //     // return redirectUrl;
  //   } catch (error) {
  //     console.error("Error generating authorization URL:", error.message);
  //     throw error;
  //   }
  // }

  // -----------------------------------Parent Function--------------------------------------------------
  try {
    // Get the API response
    const value = await hitTheApi();
    res.status(200).json({ value });
  } catch (error) {
    // Handle error response
    res.status(500).json({ error: "API call failed", message: error });
  }
};


// const crypto = require("crypto");
// const axios = require("axios");

// exports.AuthoRized = async (req, res) => {
//   const authkey = process.env.AUTH_KEY;
//   const privateKey = process.env.PRIVATE_KEY;
//   const sharedKey = process.env.SHAREDKEY;
//   const component = "authkey.state";

//   // Generate ztime in milliseconds
//   const ztime = Date.now(); // Milliseconds since epoch
//   console.log("ztime:", ztime);

//   // Prepare parameters
//   const params = {
//     authkey: authkey,
//     component: component,
//     sharedkey: sharedKey,
//     ztime: ztime,
//   };

//   // Sort and concatenate parameters
//   const sortedParams = Object.keys(params)
//     .sort()
//     .map((key) => `${key}=${params[key]}`)
//     .join("&");
//   console.log("Sorted Parameters:", sortedParams);

//   // Generate signature
//   const dataStream = `${privateKey}&${sortedParams}`;
//   const signature = crypto
//     .createHash("sha1")
//     .update(dataStream, "utf8")
//     .digest("hex");
//   console.log("Generated Signature:", signature);

//   // Build the final API URL
//   const apiUrl = `http://arena.safecreative.org/v2/`; // Ensure correct base URL
//   const finalUrl = `${apiUrl}?${sortedParams}&signature=${signature}`;
//   console.log("Final API URL:", finalUrl);

//   try {
//     // Make the API request
//     const response = await axios.get(finalUrl);
//     console.log("API Response:", response.data);

//     return res.status(200).json(response.data);
//   } catch (error) {
//     console.error(
//       "API Error:",
//       error.response ? error.response.data : error.message
//     );
//     return res.status(500).json({
//       error: error.response ? error.response.data : error.message,
//     });
//   }
// };


// const crypto = require("crypto");
// const axios = require("axios");



exports.AuthoRized = async (req, res) => {
  try {
    // Load environment variables
    const authkey = process.env.AUTH_KEY; // Authorization key
    const privateKey = process.env.PRIVATE_AUTH_KEY; // Private key
    const apiUrl = "http://arena.safecreative.org/v2/"; // Base API URL
    const component = "work.upload.lookup"; // Component

    // Extract filename from query parameters
    const { filename } = req.query;
    if (!filename) {
      return res.status(400).json({ error: "Filename is required." });
    }

    // Generate ztime (current timestamp in milliseconds)
    const ztime = Date.now();
    console.log("ztime (milliseconds):", ztime);

    // Prepare parameters
    const params = {
      authkey: authkey,
      component: component,
      bypost: true, // Indicates the request is by POST
      filename: filename,
      ztime: ztime,
    };

    // Sort the parameters alphabetically by key
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    console.log("Sorted Parameters:", sortedParams);

    // Create the data stream for signature generation
    const dataStream = `${privateKey}&${sortedParams}`;
    console.log("Data Stream for Signature:", dataStream);

    // Generate the SHA-1 signature from the data stream
    const signature = crypto
      .createHash("sha1")
      .update(dataStream, "utf8")
      .digest("hex");
    console.log("Generated Signature:", signature);

    // Append signature to the parameters
    const finalUrl = `${apiUrl}?${sortedParams}&signature=${signature}`;
    console.log("Final API URL:", finalUrl);

    // Make the API request to SafeCreative
    const response = await axios.post(finalUrl);
    console.log("API Response:", response.data);

    // Return the response to the client
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle errors and log detailed information
    console.error(
      "API Error:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({
      error: error.response ? error.response.data : error.message,
    });
  }
};
