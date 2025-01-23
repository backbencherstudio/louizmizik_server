const express = require("express");

const router = express.Router();
const { testApi, AuthoRized, DownloadWork } = require("./testApi.controller");

router.get("/testApi", testApi);

router.get("/Authorized", AuthoRized)

router.get('/safecreative/callback', async (req, res) => {
    try {
      const {
        component,
        ztime,
        code,
        state,
        signature
      } = req.query;
  
      console.log('Received callback:', {
        component,
        ztime,
        code,
        state,
        signature
      });
      console.log("aaammmmmmmmmmmmmmmi caaaaaaaaaaaaaaalllllllllllbaaaccccccccccccck")
      // Verify this is a workstate callback
      if (component !== 'workstate') {
        throw new Error('Invalid callback component');
      }
  
      // Handle different states
      switch (state) {
        case 'REGISTERED':
          console.log(`Work ${code} is now fully registered`);
          console.log("aaammmmmmmmmmmmmmmi caaaaaaaaaaaaaaalllllllllllbaaaccccccccccccck fully registered")
          const workDownload = await DownloadWork(code);
          console.log("webhook routeee   workDownload",workDownload)
          // Add your logic here for fully registered works
          break;
        
        case 'PRE_REGISTERED':
          console.log(`Work ${code} is pre-registered`);
          console.log("aaammmmmmmmmmmmmmmi caaaaaaaaaaaaaaalllllllllllbaaaccccccccccccck pre-registered")
          // Add your logic here for pre-registered works
          break;
      }
  
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Callback error:', error);
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
