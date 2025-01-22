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

exports.uploadCheckk = async (uploadTicket) => {
  console.log("uploadTicket:", uploadTicket);

  const authkey = process.env.AUTH_KEY;
  const privateKey = process.env.PRIVATE_AUTH_KEY;
  const component = "work.uploadticket.status";

  // Generate ztime in milliseconds
  const ztime = Date.now(); // Milliseconds since epoch
  console.log("ztime:", ztime);

  // Prepare parameters
  const params = {
    authkey: authkey,
    component: component,
    uploadticket: uploadTicket, // Correct case for `uploadticket`
    ztime: ztime,
  };

  // Sort parameters alphabetically by key and concatenate them
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
  console.log("Check the uploaded file status:", finalUrl);

  try {
    // Make the API request
    const response = await axios.get(finalUrl);
    console.log("API Response:", response.data);

    // Return the extracted values (or use them in further processing)
    return response.data;
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
  const crypto = require("crypto");
  const axios = require("axios");

  const authkey = process.env.AUTH_KEY; // Authorization key
  const privateKey = process.env.PRIVATE_AUTH_KEY; // Private key
  const apiUrl = "http://arena.safecreative.org/v2/";
  const component = "user.licenses";
  const page = 1;
  const ztime = Date.now();

  // Create params object and sort them alphabetically
  const params = {
    authkey,
    component,
    page,
    ztime
  };

  // Sort and create parameter string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Create signature using privateKey&sortedParams (note the & between private key and params)
  const signature = crypto
    .createHash("sha1")
    .update(`${privateKey}&${sortedParams}`)
    .digest("hex");

  // Construct the final URL with query parameters
  const requestUrl = `${apiUrl}?${sortedParams}&signature=${signature}`;
  
  console.log("Request URL:", requestUrl); // For debugging

  try {
    const response = await axios.get(requestUrl);
    console.log("Response data:", response.data); // Log response data
    
    // Parse the XML response using xml2js
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    return result;
  } catch (error) {
    console.error("Error fetching licenses:", error.response?.data || error.message);
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
  const crypto = require("crypto");
  const axios = require("axios");
  const xml2js = require('xml2js');

  const authkey = process.env.AUTH_KEY;
  const privateKey = process.env.PRIVATE_AUTH_KEY;
  const apiUrl = "http://arena.safecreative.org/v2/";

  // Create params object with required parameters
  const params = {
    allowdownload: 1,
    authkey,
    component: "work.register",
    excerpt: "Very long text about registry philosophy",
    noncekey: nonckeyGet.noncekey,
   
    registrypublic: 1,
    tags: "tag1, tag2",
    title: "My first long registration",
    uploadticket: uploadTicket,
    userauthor: 1,
    worktype: "article",
    ztime: Date.now()
  };

  // Sort parameters alphabetically and create parameter string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => {
      // Don't encode the values during signature creation
      return `${key}=${params[key]}`;
    })
    .join('&');

  console.log('String to sign:', `${privateKey}&${sortedParams}`);

  // Generate signature using SHA-1
  const signature = crypto
    .createHash('sha1')
    .update(`${privateKey}&${sortedParams}`)
    .digest('hex');

  console.log('Generated signature:', signature);

  // Now create the URL-encoded parameter string for the request
  const encodedParams = Object.keys(params)
    .sort()
    .map(key => {
      const value = encodeURIComponent(params[key]);
      return `${key}=${value}`;
    })
    .join('&');

  // Construct the final URL
  const requestUrl = `${apiUrl}?${encodedParams}&signature=${signature}`;
  
  console.log('Final URL:', requestUrl);

  try {
    const response = await axios.get(requestUrl);
    
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    console.log("result",result)
    return result;
  } catch (error) {
    console.error("Error registering the work:", error.response?.data || error.message);
    throw error;
  }
};


exports.RegisterRightWork = async (workcode) => {
 

  const authkey = process.env.AUTH_KEY;
  const privateKey = process.env.PRIVATE_AUTH_KEY;
  const apiUrl = "http://arena.safecreative.org/v2/";

  // Format dates properly
  const formatDate = (date) => {
    return date.toISOString().replace(/\.\d{3}/, '');  // Remove milliseconds
  };

  const now = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // Set end date to 1 year from now

  // Create params object with required parameters
  const params = {
    authkey,
    component: "work.rights.register",
    workcode,
    type: "RIGHTS",
    rights: "Distribution and reproduction",
    begindate: formatDate(now),           // e.g., "2024-01-25T00:00:00Z"
    enddate: formatDate(endDate),         // e.g., "2025-01-25T00:00:00Z"
    jurisdictions: "Worldwide",
    rightswindow: "Web streaming",
    ztime: Date.now()
  };

  // Sort parameters alphabetically and create parameter string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => {
      return `${key}=${params[key]}`;
    })
    .join('&');

  // Generate signature using SHA-1
  const signature = crypto
    .createHash('sha1')
    .update(`${privateKey}&${sortedParams}`)
    .digest('hex');

  // Create URL-encoded parameter string
  const encodedParams = Object.keys(params)
    .sort()
    .map(key => {
      const value = encodeURIComponent(params[key]);
      return `${key}=${value}`;
    })
    .join('&');

  // Construct the final URL
  const requestUrl = `${apiUrl}?${encodedParams}&signature=${signature}`;

  try {
    const response = await axios.get(requestUrl);
    
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    console.log("result",result)
    return result;
  } catch (error) {
    console.error("Error registering rights:", error.response?.data || error.message);
    throw error;
  }
};


exports.AttachWorkFile = async (workcode, uploadTicket, title) => {


  const authkey = process.env.AUTH_KEY;
  const privateKey = process.env.PRIVATE_AUTH_KEY;
  const apiUrl = "http://arena.safecreative.org/v2/";

  // Create params object with required parameters
  const params = {
    authkey,
    component: "work.attachfile",
    workcode,
    uploadticket: uploadTicket,
    title,
    public: 1,  // Making the attachment public by default
    ztime: Date.now()
  };

  // Sort parameters alphabetically and create parameter string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => {
      return `${key}=${params[key]}`;
    })
    .join('&');

  // Generate signature using SHA-1
  const signature = crypto
    .createHash('sha1')
    .update(`${privateKey}&${sortedParams}`)
    .digest('hex');

  // Create URL-encoded parameter string
  const encodedParams = Object.keys(params)
    .sort()
    .map(key => {
      const value = encodeURIComponent(params[key]);
      return `${key}=${value}`;
    })
    .join('&');

  // Construct the final URL
  const requestUrl = `${apiUrl}?${encodedParams}&signature=${signature}`;

  try {
    const response = await axios.get(requestUrl);
    
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    console.log("attachfile",result)
    return result;
  } catch (error) {
    console.error("Error attaching file:", error.response?.data || error.message);
    throw error;
  }
};


exports.DownloadWork = async (workcode) => {
  const authkey = process.env.AUTH_KEY;
  const privateKey = process.env.PRIVATE_AUTH_KEY;
  const apiUrl = "http://arena.safecreative.org/v2/";

  // Create params object with required parameters
  const params = {
    authkey,
    component: "work.download.private",
    code: workcode,
    ztime: Date.now()
  };

  // Sort parameters alphabetically and create parameter string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => {
      return `${key}=${params[key]}`;
    })
    .join('&');

  // Generate signature using SHA-1
  const signature = crypto
    .createHash('sha1')
    .update(`${privateKey}&${sortedParams}`)
    .digest('hex');

  // Create URL-encoded parameter string
  const encodedParams = Object.keys(params)
    .sort()
    .map(key => {
      const value = encodeURIComponent(params[key]);
      return `${key}=${value}`;
    })
    .join('&');

  // Construct the final URL
  const requestUrl = `${apiUrl}?${encodedParams}&signature=${signature}`;

  try {
    const response = await axios.get(requestUrl);
    
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    console.log("download",result)
    
    // The result will contain the download URL and mimetype
    return {
      url: result.downloadinfo.url[0],
      mimetype: result.downloadinfo.mimetype[0]
    };
  } catch (error) {
    console.error("Error getting download URL:", error.response?.data || error.message);
    throw error;
  }
};



exports.WorkCertificate = async (workcode) => {
 

  const authkey = process.env.AUTH_KEY;
  const privateKey = process.env.PRIVATE_AUTH_KEY;
  const apiUrl = "http://arena.safecreative.org/v2/";

  // Create params object with required parameters
  const params = {
    authkey,
    component: "work.get.private",
    code: workcode,
    ztime: Date.now()
    // locale: 'en'  // Optional: uncomment and modify if you need a specific locale
  };

  // Sort parameters alphabetically and create parameter string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => {
      return `${key}=${params[key]}`;
    })
    .join('&');

  // Generate signature using SHA-1
  const signature = crypto
    .createHash('sha1')
    .update(`${privateKey}&${sortedParams}`)
    .digest('hex');

  // Create URL-encoded parameter string
  const encodedParams = Object.keys(params)
    .sort()
    .map(key => {
      const value = encodeURIComponent(params[key]);
      return `${key}=${value}`;
    })
    .join('&');

  // Construct the final URL
  const requestUrl = `${apiUrl}?${encodedParams}&signature=${signature}`;

  try {
    const response = await axios.get(requestUrl);
    console.log("response",response)
    // Parse XML response
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    console.log("certificate",result)
    
    // Check if the certificate request was successful
    if (result.restvalueresponse.state[0] === 'ready') {
      return {
        status: 'success',
        message: 'Certificate has been sent to your email address'
      };
    } else {
      throw new Error('Certificate request failed');
    }
  } catch (error) {
    console.error("Error requesting certificate:", error.response?.data || error.message);
    throw error;
  }
};

