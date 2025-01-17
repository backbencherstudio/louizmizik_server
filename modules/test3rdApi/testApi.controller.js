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

    //console.log("Generated Signature:", signature);

    const apiUrl = `http://arena.safecreative.org/v2/`;
    const finalUrl = `${apiUrl}?${sortedParams}&signature=${signature}`;

    console.log("Final API URL:", finalUrl);

    // Step 6: Make the API request
    try {
      const response = await axios.get(finalUrl);
      console.log("API Response:", response.data);

      //  ---------------------------------------------------------------------------------------------
      // Parse the XML response
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      // Extract authkey and privatekey
      const authkey = result.authkeycreate.authkey[0];
      const privatekey = result.authkeycreate.privatekey[0];

      // Store the keys in an object
      const credentials = { authkey, privatekey };
      console.log("Parsed Credentials:", credentials);
      const apiUrl2 = "http://arena.safecreative.org/api-ui/authkey.edit";
      const level = "GET";

      const authorizationUrl = await getAuthorizationUrl(apiUrl2, sharedKey, level, authkey , privatekey);
      console.log("Authorization URL:", authorizationUrl);
      // -----------------------------end-------------------------------------------------

      return authorizationUrl;
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
  async function getAuthorizationUrl(apiUrl, sharedKey, level = "GET", authkey, privatekey) {
    try {
      // Step 1: Request to create an authkey
      //const response = await axios.post(apiUrl);
      //const parser = new xml2js.Parser();
      //const result = await parser.parseStringPromise(response.data);
  
      // Step 2: Extract authkey and privatekey
      //const authkey = result.authkeycreate.authkey[0];
      //const privatekey = result.authkeycreate.privatekey[0];
  
      // Save the credentials securely for future use
      //const credentials = { authkey, privatekey };
      //console.log("Parsed Credentials:", credentials);
  
      // Step 3: Generate ztime and signature
      const ztime = Date.now().toString();
      const stringToSign = `authkey=${authkey}&level=${level}&sharedkey=${sharedKey}&ztime=${ztime}`;
      const signature = crypto
        .createHmac("sha1", privatekey)
        .update(stringToSign)
        .digest("hex");
  
      // Step 4: Construct the redirect URL
      const redirectUrl = `${apiUrl}?authkey=${authkey}&level=${level}&sharedkey=${sharedKey}&ztime=${ztime}&signature=${signature}`;
  
      return redirectUrl;
    } catch (error) {
      console.error("Error generating authorization URL:", error.message);
      throw error;
    }
  }













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
