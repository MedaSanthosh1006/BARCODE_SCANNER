import React, { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // [READ] Fetch item listing immediately on component start
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error loading inventory data:', err);
    }
  };

  // [CREATE] Submit scanned code and details to backend database
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!barcodeInput || !nameInput) return alert('Please provide both barcode and name');

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: barcodeInput, productName: nameInput, quantity: 1 })
      });
      const newEntry = await response.json();
      setProducts([...products, newEntry]);
      
      // Clear Input Form Fields
      setBarcodeInput('');
      setNameInput('');
    } catch (err) {
      console.error('Error saving barcode record:', err);
    }
  };

  // [UPDATE] Adjust item count directly up or down
  const updateQuantity = async (id, currentQty, adjustment) => {
    const newQty = currentQty + adjustment;
    if (newQty < 1) return; // Disallow negative inventory counts

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      const updatedItem = await response.json();
      setProducts(products.map(item => item._id === id ? updatedItem : item));
    } catch (err) {
      console.error('Error modifying database item:', err);
    }
  };

  // [DELETE] Remove entry completely from MongoDB
  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error eliminating barcode entry:', err);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', fontFamily: 'Segoe UI, sans-serif', padding: '0 20px' }}>
      <h2 style={{ color: '#2c3e50', textAlign: 'center' }}>⚙️ MERN Barcode Inventory Controller</h2>
      
      {/* Simulation/Manual Scanned entry console */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px dashed #bdc3c7' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Scan / Log New Barcode</h4>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Scan/Type Barcode (e.g. 8801068)" 
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="text" 
            placeholder="Product Identifier Label" 
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log Scan
          </button>
        </form>
      </div>

      {/* Render Product List Table */}
      <h3 style={{ marginTop: '30px' }}>Scanned Inventory Store</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#ecf0f1', borderBottom: '2px solid #bdc3c7' }}>
              <th style={{ padding: '12px' }}>Barcode ID</th>
              <th style={{ padding: '12px' }}>Product Title</th>
              <th style={{ padding: '12px' }}>Count</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace', color: '#7f8c8d' }}>{item.barcode}</td>
                <td style={{ padding: '12px', fontWeight: '500' }}>{item.productName}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => updateQuantity(item._id, item.quantity, -1)} style={{ padding: '2px 6px', margin: '0 5px' }}>-</button>
                  <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity, 1)} style={{ padding: '2px 6px', margin: '0 5px' }}>+</button>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#95a5a6' }}>No active barcode entries logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;