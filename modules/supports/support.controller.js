require("dotenv").config();
const nodemailer = require("nodemailer")
const SupportRequest = require("./support.model");



exports.create = async (req, res) => {
    const { name, email, issue } = req.body;

    if (!name || !email || !issue) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Save the request to the database
        const supportRequest = new SupportRequest({ name, email, issue });
        await supportRequest.save();

        const transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port: 587,
                  secure: false,
                  auth: {
                    user: process.env.node_mailer_user,
                    pass: process.env.NODE_MAILER_PASSWORD,
                  },
                });

        // Send email to support team
        await transporter.sendMail({
            from: `"Support" <${email}>`,
            to: `${process.env.node_mailer_user}`, // Replace with your support team's email
            subject: 'New Support Request',
            text: `Name: ${name}\nEmail: ${email}\nIssue: ${issue}`,
        });

        res.status(200).json({ message: 'Support request submitted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit support request.' });
    }
}


exports.getAllSupportRequests = async (req, res) => {
    try {
        // Fetch all support requests from the database
        const supportRequests = await SupportRequest.find().sort({ createdAt: -1 }); // Sorted by latest first

        // Send the data as a JSON response
       return  res.status(200).json(supportRequests);
    } catch (error) {
        console.error('Error fetching support requests:', error);
       return  res.status(500).json({ message: 'Failed to fetch support requests.' });
    }
};