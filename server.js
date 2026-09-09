const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const MONGO_URI = 'mongodb://localhost:27017/barcodedb'; 
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('Database connection error:', err));


const ProductSchema = new mongoose.Schema({
  barcode: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, default: 1 }
});
const Product = mongoose.model('Product', ProductSchema);


app.post('/api/products', async (req, res) => {
  try {
    const { barcode, productName, quantity } = req.body;
    const newProduct = new Product({ barcode, productName, quantity });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Backend server active on port ${PORT}`));