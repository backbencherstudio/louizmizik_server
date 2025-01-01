exports.createBeat = async (req, res) => {
    try {
      const { beatName, bpm, collaborators, containsSamples, fullName, genre, isOnlyProducer, percentage, producerName, releaseDate, youtubeUrl } = req.body;
  
      const audioFile = req.files.audio?.[0];
      const imageFile = req.files.image?.[0];
  
      const newBeat = await Beat.create({
        beatName,
        bpm,
        collaborators,
        containsSamples: containsSamples === 'yes',
        fullName,
        genre,
        isOnlyProducer: isOnlyProducer === 'yes',
        percentage,
        producerName,
        releaseDate,
        youtubeUrl,
        audioPath: audioFile ? audioFile.path : null,
        imagePath: imageFile ? imageFile.path : null,
      });
  
      res.status(201).json({ message: 'Beat created successfully', beat: newBeat });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating beat', error });
    }
  };