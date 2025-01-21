const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
const xml2js = require("xml2js");
const FormData = require("form-data");
const fs = require("fs");

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

    //console.log("Generated Signature: m10000000000000000000000", signature);

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
      const level = "MANAGE";

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

      return { redirectUrl, authkey, privatekey1 };
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

exports.AuthoRized = async (audio, filename) => {
  // const { filename } = req.query;
  if (!filename) {
    return { error: "Filename is required." };
  }

  const uploadurl = await makeUploadurl(filename);
  console.log("last", uploadurl);
  return { uploadurl };
};

// const crypto = require("crypto");
// const axios = require("axios");
// const xml2js = require("xml2js");

const makeUploadurl = async (filename) => {
  try {
    const authkey = process.env.AUTH_KEY; // Authorization key
    const privateKey = process.env.PRIVATE_AUTH_KEY; // Private key
    const apiUrl = "http://arena.safecreative.org/v2/"; // Base API URL
    const component = "work.upload.lookup"; // Component

    const ztime = Date.now(); // Current timestamp in milliseconds

    // Prepare parameters in the required order
    const params = {
      component,
      authkey,
      bypost: true,
      filename,
      ztime,
    };

    // Generate sorted query string for signature (sorted alphabetically by keys)
    const sortedQueryString = Object.keys(params)
      .sort() // Sort keys alphabetically
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    // Create the data stream for signature
    const dataStream = `${privateKey}&${sortedQueryString}`;

    // Generate the SHA-1 signature
    const signature = crypto
      .createHash("sha1")
      .update(dataStream, "utf8")
      .digest("hex");

    // Construct the final URL
    const finalUrl = `${apiUrl}?${sortedQueryString}&signature=${signature}`;

    // Make the API request
    const response = await axios.post(finalUrl);

    // Parse the XML response using a promise-based approach
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data); // Use the `parseStringPromise` method

    // Extract uploadurl and uploadid
    const uploadurl = result.workuploadlookup.uploadurl[0];
    const uploadid = result.workuploadlookup.uploadid[0];
    console.log(uploadid, uploadurl);

    // Return the parsed data
    return { uploadurl, uploadid };
  } catch (error) {
    console.error(
      "API Error:",
      error.response ? error.response.data : error.message
    );
    return {
      error: error.response ? error.response.data : error.message,
    };
  }
};

exports.uploadFile = async (
  uploadUrl,
  uploadId,
  filePath,
  fileName,
  mimeType
) => {
  try {
    // Read the file as a stream
    const fileStream = fs.createReadStream(filePath);

    // Create a FormData object
    const formData = new FormData();
    formData.append("uploadid", uploadId); // Append the upload ID
    formData.append("file", fileStream, {
      filename: fileName,
      contentType: mimeType, // Set the file MIME type
    });

    // Configure headers for the POST request
    const headers = {
      ...formData.getHeaders(), // Automatically set Content-Type including boundary
    };

    // Make the HTTP POST request
    const response = await axios.post(uploadUrl, formData, { headers });

    console.log("Upload successful, response:", response.data);
    return response.data; // The upload ticket
  } catch (error) {
    console.error("Error uploading file:", error.message);
    throw error;
  }
};

exports.NonckeyGet = async () => {
  const authkey = process.env.AUTH_KEY;
  const privateKey = process.env.PRIVATE_KEY;
  const sharedKey = process.env.SHAREDKEY;
  const component = "authkey.state";

  // Generate ztime in milliseconds
  const ztime = Date.now(); // Milliseconds since epoch
  console.log("ztime:", ztime);

  // Prepare parameters
  const params = {
    authkey: authkey,
    component: component,
    sharedkey: sharedKey,
    ztime: ztime,
  };

  // Sort and concatenate parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  console.log("Sorted Parameters:", sortedParams);

  // Generate signature
  const dataStream = `${privateKey}&${sortedParams}`;
  const signature = crypto
    .createHash("sha1")
    .update(dataStream, "utf8")
    .digest("hex");
  console.log("Generated Signature:", signature);

  // Build the final API URL
  const apiUrl = `http://arena.safecreative.org/v2/`; // Ensure correct base URL
  const finalUrl = `${apiUrl}?${sortedParams}&signature=${signature}`;
  console.log("Final API URL:", finalUrl);

  try {
    // Make the API request
    const response = await axios.get(finalUrl);
    console.log("API Response:", response.data);

    // Parse the XML response using the async function
    const { usercode, noncekey } = await parseXmlAsync(response.data);

    console.log("Usercode:", usercode);
    console.log("Noncekey:", noncekey);

    // Return the extracted values (or use them in further processing)
    return { usercode, noncekey };
  } catch (error) {
    console.error(
      "API Error:",
      error.response ? error.response.data : error.message
    );
    return {
      error: error.response ? error.response.data : error.message,
    };
  }
};

const parseXmlAsync = (xmlData) => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        reject("Error parsing XML: " + err);
      } else {
        // Extract usercode and noncekey from the parsed XML
        const usercode = result.authkeystate.usercode[0];
        const noncekey = result.authkeystate.noncekey[0];
        resolve({ usercode, noncekey });
      }
    });
  });
};



exports.licenseGet = async () => {
  const authkey = process.env.AUTH_KEY; // Authorization key
  const privateKey = process.env.PRIVATE_AUTH_KEY; // Private key
  const apiUrl = "http://arena.safecreative.org/v2/";

  const component = "user.licenses";
  const page = 1;  // Specify the page number
  const ztime = Date.now();  // Timestamp in milliseconds
  
  // Construct the string to sign
  const stringToSign = `authkey=${authkey}&component=${component}&page=${page}&ztime=${ztime}`;
  
  // Generate the signature using SHA256
  const signature = crypto.createHash('sha256')
    .update(stringToSign + privateKey)  // Concatenate the private key to the string
    .digest('hex');

  // Construct the full URL with query parameters
  const requestUrl = `${apiUrl}?authkey=${authkey}&component=${component}&page=${page}&ztime=${ztime}&signature=${signature}`;
  console.log("requestUrl",requestUrl)

  try {
    // Send the request
    const response = await axios.get(requestUrl);
    
    // Log the response data
    console.log(response.data);  // Handle the response
    
    return response.data;
  } catch (error) {
    console.error("Error fetching licenses:", error);
    throw error;
  }
};


// exports.workRegister = async (uploadTicket,nonckeyGet) => {
//   const authkey = process.env.AUTH_KEY; // Authorization key
//     const privateKey = process.env.PRIVATE_AUTH_KEY; // Private key
//     const apiUrl = "http://arena.safecreative.org/v2/";
//     const  noncekey = nonckeyGet.noncekey;
//     const usercode = nonckeyGet.usercode;
    

// }
exports.workRegister = async (uploadTicket, nonckeyGet) => {
  const authkey = process.env.AUTH_KEY; // Authorization key
  const privateKey = process.env.PRIVATE_AUTH_KEY; // Private key
  const apiUrl = "http://arena.safecreative.org/v2/";

  const noncekey = nonckeyGet.noncekey;
  const usercode = nonckeyGet.usercode;
  
  const title = "My first long registration";  // Replace with actual title
  const workType = "article";  // Replace with actual work type
  const license = "http://creativecommons.org/licenses/by/3.0/";  // Replace with actual license URL
  const excerpt = "Very long text about registry philosophy";  // Replace with actual excerpt
  const tags = "tag1, tag2";  // Replace with actual tags
  const registryPublic = 1;  // Set visibility
  const ztime = Date.now();  // Timestamp in milliseconds
  const obs = "Obs 2";  // Replace with actual observation note
  const userauthor = 1;  // Author id (replace with the correct one)
  
  // Construct the string to sign
  const stringToSign = `allowdownload=1&authkey=${authkey}&component=work.register&excerpt=${encodeURIComponent(excerpt)}&license=${encodeURIComponent(license)}&noncekey=${noncekey}&obs=${encodeURIComponent(obs)}&registrypublic=${registryPublic}&tags=${encodeURIComponent(tags)}&title=${encodeURIComponent(title)}&uploadticket=${uploadTicket}&userauthor=${userauthor}&worktype=${workType}&ztime=${ztime}`;
  
  // Generate the signature using SHA256
  const signature = crypto.createHash('sha256')
    .update(stringToSign + privateKey)
    .digest('hex');

  // Construct the full URL with query parameters
  const requestUrl = `${apiUrl}?allowdownload=1&authkey=${authkey}&component=work.register&excerpt=${encodeURIComponent(excerpt)}&license=${encodeURIComponent(license)}&noncekey=${noncekey}&obs=${encodeURIComponent(obs)}&registrypublic=${registryPublic}&tags=${encodeURIComponent(tags)}&title=${encodeURIComponent(title)}&uploadticket=${uploadTicket}&userauthor=${userauthor}&worktype=${workType}&ztime=${ztime}&signature=${signature}`;
  
  try {
    // Send the request
    const response = await axios.get(requestUrl);
    console.log(response.data);  // Handle the response
    return response.data;
  } catch (error) {
    console.error("Error registering the work:", error);
    throw error;
  }
};
