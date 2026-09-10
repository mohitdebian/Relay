const express = require('express');
const app = express();
const port = process.env.PORT || 5002;

const orders = [
  { id: 1, userId: 1, product: 'Laptop', total: 999.99 },
  { id: 2, userId: 2, product: 'Phone', total: 699.99 },
  { id: 3, userId: 1, product: 'Headphones', total: 149.99 }
];

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'orders-service' }));
app.get('/orders', (req, res) => res.json(orders));
app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id, 10));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.listen(port, () => console.log(`Orders service listening on port ${port}`));
