const crypto = require('crypto');
const axios = require('axios');
require("dotenv").config();

exports.testApi = async (req, res) => {
  const hitTheApi = async () => {
    // Parameters
    const privateKey = process.env.PRIVATE_KEY; 
    const sharedKey = process.env.SHAREDKEY; 
    const component = "authkey.create";
    console.log(privateKey, sharedKey)

    // Step 1: Get the current UTC time in milliseconds
    const ztime = Date.now();  // This will give time in milliseconds since the Unix epoch (January 1, 1970)
    console.log("Generated ztime (milliseconds since 1970-01-01 00:00:00 GMT):", ztime);

    // Step 2: Sort parameters by key
    const params = {
      component: component,
      sharedkey: sharedKey,
      ztime: ztime,
    };
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    // Step 3: Create data stream with private key
    const dataStream = `${privateKey}&${sortedParams}`;

    // Step 4: Generate SHA-1 hash of the data stream
    const signature = crypto
      .createHash("sha1")
      .update(dataStream, "utf8")
      .digest("hex");



//       http://api.safecreative.org/v2/
// ?ztime=20081106141840
// &sharedkey=fDsm8YO9SaupC5TChOsB6w
// &component=authkey.create
    // Step 5: Construct final request URL
    const apiUrl = `http://api.safecreative.org/v2/`;
    const finalUrl = `${apiUrl}?${sortedParams}&signature=${signature}`;

    console.log("Final URL:", finalUrl);

    // Step 6: Make the API request with await
    try {
      const response = await axios.get(finalUrl);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      throw error.response ? error.response.data : error.message;
    }
  };

  try {
    // Get the API response
    const value = await hitTheApi();
    res.status(200).json({ value });
  } catch (error) {
    // Handle error response
    res.status(500).json({ error: "API call failed", message: error });
  }
};
