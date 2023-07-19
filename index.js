const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const formDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  selectedSectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }],
  agreeToTerms: { type: Boolean, required: true },
});

const FormDataModel = mongoose.model('FormData', formDataSchema);

const sectorSchema = new mongoose.Schema({
  label: { type: String, required: true },
});

const SectorModel = mongoose.model('Sector', sectorSchema);

// API route to get all sectors
app.get('/api/sectors', async (req, res) => {
  try {
    const sectors = await SectorModel.find({}, '_id label').exec();

    return res.status(200).json(sectors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to retrieve sectors.' });
  }
});

// API route to get all submitted forms
app.get('/api/formData', async (req, res) => {
  try {
    const formDataList = await FormDataModel.find().populate('selectedSectors').exec();
    return res.status(200).json(formDataList);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to retrieve sectors.' });
  }
});

// API route to store form data
app.post('/api/formData', async (req, res) => {
  const { name, selectedSectors, agreeToTerms } = req.body;

  if (!name || !selectedSectors || selectedSectors.length === 0 || agreeToTerms === undefined) {
    return res.status(400).json({ message: 'All fields are mandatory.' });
  }

  try {
    // Create a new form data document
    const formData = new FormDataModel({
      name,
      selectedSectors: selectedSectors.map((a) => a.value),
      agreeToTerms,
    });

    // Save the document to MongoDB
    await formData.save();

    return res.status(200).json({ message: 'Form data saved successfully.', formData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to save form data.' });
  }
});

// API route to delete form data
app.delete('/api/formData/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFormData = await FormDataModel.findByIdAndRemove(id).exec();
    if (!deletedFormData) {
      return res.status(404).json({ message: 'Form data not found.' });
    }
    return res.status(200).json({ message: 'Form data deleted successfully.', deletedFormData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete form data.' });
  }
});

// API route to update form data
app.put('/api/formData', async (req, res) => {
  try {
    const { name, selectedSectors, agreeToTerms, _id } = req.body;

    if (!name || !selectedSectors || selectedSectors.length === 0 || agreeToTerms === undefined) {
      return res.status(400).json({ message: 'All fields are mandatory.' });
    }

    const existingFormData = await FormDataModel.findById(_id);

    if (!existingFormData) {
      return res.status(404).json({ message: 'No form data found.' });
    }

    existingFormData.name = name;
    existingFormData.selectedSectors = selectedSectors.map((a) => a.value);
    existingFormData.agreeToTerms = agreeToTerms;

    await existingFormData.save();

    return res.status(200).json({ message: 'Form data updated successfully.', formData: existingFormData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update form data.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
