require("dotenv").config();
const Beat = require("./beat.model");
const User = require("../users/users.models");
const { sendBeatSucceslEmail, sendBeatFailEmail } = require("../../util/otpUtils");
var registerId = 0;

// exports.createBeat = async (req, res) => {
//   const {userId} = req.params;
//   const user = await User.findById(userId);
//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
// }
//   try {
//     const {
//       beatName,
//       bpm,
//       collaborators,
//       containsSamples,
//       fullName,
//       genre,
//       isOnlyProducer,
//       percentage,
//       producerName,
//       releaseDate,
//       youtubeUrl,
//     } = req.body;

//     const audioFile = req.files.audio?.[0];
//     const imageFile = req.files.image?.[0];
//     let register = false
//     console.log(audioFile, imageFile)
//      if(user.credit>0){
//     // beatRegister 3rd party api call here-------------------------------------------will be add ---------------------------------
//       const registerDone = await certification(audio)
//       if(registerDone){
//         register = true;
//       }
//      }

//     const newBeat = await Beat.create({
//       beatName,
//       bpm,
//       collaborators,
//       userId: req.userId,
//       containsSamples: containsSamples === "yes",
//       fullName,
//       genre,
//       isOnlyProducer: isOnlyProducer === "yes",
//       percentage,
//       producerName,
//       releaseDate,
//       youtubeUrl,
//       register,
//       audioPath: audioFile ? audioFile.path : null,
//       imagePath: imageFile ? imageFile.path : null,
//     });

//     res
//       .status(201)
//       .json({ message: "Beat created successfully", beat: newBeat });
//   } catch (error) {
//     console.error('Full Error:', error);
//     console.log(error)
//     res.status(500).json({ message: "Error creating beat", error });
//   }
// };

exports.createBeat = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log incoming data for debugging
    //console.log("Request Body:", req.body);
    //console.log("Uploaded Files:", req.files);

    // Destructure fields from the request body
    const {
      beatName,
      bpm,
      collaborators,
      containsSamples,
      fullName,
      genre,
      isOnlyProducer,
      percentage,
      producerName,
      releaseDate,
      youtubeUrl,
    } = req.body;

    // Get uploaded files
    const audioFile = req.files?.audio?.[0];
    const imageFile = req.files?.image?.[0];

    // Check if files are missing
    if (!audioFile || !imageFile) {
      return res
        .status(400)
        .json({ message: "Audio or image file is missing" });
    }

    // Initialize register flag
    let register = false;

    // Check user credits and perform certification (if applicable)
    if (user.credit > 0) {
      try {
        const registerDone = await certification(audioFile);
        if (registerDone) {
          register = true;
          user.credit -= 1;
          await user.save();

          // here wil be add mail service for user---------------------------------------------------

          sendBeatSucceslEmail(user.name, user.email);
      //     const transporter = nodemailer.createTransport({
      //       host: "smtp.gmail.com",
      //       port: 587,
      //       secure: false,
      //       auth: {
      //         user: process.env.node_mailer_user,
      //         pass: process.env.NODE_MAILER_PASSWORD,
      //       },
      //     });

      //     const mailOptions = {
      //       from: '"LuiZ Music" <LuizMusic-email@example.com>',
      //       to: user.email, // User's email
      //       subject: "Stay Updated with Key Event Notifications!",
      //       text: `Hi ${user.name},\n\nYou will now receive email notifications for key events, including successfully registering new beats. Stay informed and never miss an important update!\n\nThank you for using our service.\n\nBest regards,\nYour App Team`,
      //       html: `<p>Hi ${user.name},</p>
      //  <p>You will now receive <strong>email notifications</strong> for key events, including successfully registering new beats. Stay informed and never miss an important update!</p>
      //  <p>Thank you for using our service.</p>
      //  <p>Best regards,<br>Luiz Music</p>`,
      //     };

      //     transporter.sendMail(mailOptions, (error, info) => {
      //       if (error) {
      //         console.error("Error sending email:", error);
      //       } else {
      //         console.log("Email sent:", info.response);
      //       }
      //     });
        } else {
          // here also failer msg email service add for user---------------------------------
          sendBeatFailEmail(user.name, user.email);

      //     const transporter = nodemailer.createTransport({
      //       host: "smtp.gmail.com",
      //       port: 587,
      //       secure: false,
      //       auth: {
      //         user: process.env.node_mailer_user,
      //         pass: process.env.NODE_MAILER_PASSWORD,
      //       },
      //     });

      //     const mailOptions = {
      //       from: '"LuiZ Music" <LuizMusic-email@example.com>',
      //       to: user.email, // User's email
      //       subject: "Stay Updated with Key Event Notifications!",
      //       text: `Hi ${user.name},\n\nYou will now receive email notifications for key events, including faiiillleeedddd!!!! registering new beats. Stay informed and never miss an important update!\n\nThank you for using our service.\n\nBest regards,\nYour App Team`,
      //       html: `<p>Hi ${user.name},</p>
      //  <p>You will now receive <strong>email notifications</strong> for key events,including faiiillleeedddd!!!!  registering new beats. Stay informed and never miss an important update!</p>
      //  <p>Thank you for using our service.</p>
      //  <p>Best regards,<br>Your App Team</p>`,
      //     };

      //     transporter.sendMail(mailOptions, (error, info) => {
      //       if (error) {
      //         console.error("Error sending email:", error);
      //       } else {
      //         console.log("Email sent:", info.response);
      //       }
      //     });
        }
      } catch (certError) {
        console.error("Error during certification:", certError);
        return res.status(500).json({
          message: "Error during certification",
          error: certError.message,
        });
      }
    }

    // Create new beat
    registerId++;
    const newBeat = await Beat.create({
      beatName,
      bpm,
      collaborators,
      userId,
      containsSamples: containsSamples === "yes", // Convert string "yes" to boolean
      fullName,
      genre,
      isOnlyProducer: isOnlyProducer === "yes", // Convert string "yes" to boolean
      percentage,
      producerName,
      releaseDate,
      youtubeUrl,
      register,
      audioPath: audioFile.path,
      imagePath: imageFile.path,
      registrasionId : "REG" + registerId,
    });

    // Respond with the new beat
    return res
      .status(201)
      .json({ message: "Beat created successfully", beat: newBeat });
  } catch (error) {
    // Log full error details for debugging
    console.error("Error creating beat:", error);
    return res
      .status(500)
      .json({ message: "Error creating beat", error: error.message });
  }
};

exports.OneUsergetBeats = async (req, res) => {
  try {
    const beats = await Beat.find({ userId: req.params.userId });
    return res.status(200).json({ beats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching beats", error });
  }
};

const certification = async (audio) => {
  return false;
};

exports.deleteBeat = async(req, res) =>{
  const deletedBeat = await Beat.deleteOne({ _id: req.params.id });
if (deletedBeat.deletedCount > 0) {
   return res.status(200).json('Beat deleted successfully.');
} else {
  
  return res.status(500).json({ message: "No beat found with the specified ID.", error });
}

}
