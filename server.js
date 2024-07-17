const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const PropertySchema = new mongoose.Schema({
  image: String,
  description: String,
  address: String,
  price: Number,
});

const Property = mongoose.model('Property', PropertySchema);

app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/properties', upload.single('image'), async (req, res) => {
  const property = new Property({
    image: `/uploads/${req.file.filename}`,
    description: req.body.description,
    address: req.body.address,
    price: req.body.price,
  });

  try {
    const newProperty = await property.save();
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/properties/:id', upload.single('image'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (property == null) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (req.body.description != null) {
      property.description = req.body.description;
    }
    if (req.body.address != null) {
      property.address = req.body.address;
    }
    if (req.body.price != null) {
      property.price = req.body.price;
    }
    if (req.file != null) {
      property.image = `/uploads/${req.file.filename}`;
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      await property.deleteOne(); // Correct instance method to delete
      res.json({ message: 'Property deleted' });
    } catch (error) {
      console.error(`Error deleting property with id ${req.params.id}:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));