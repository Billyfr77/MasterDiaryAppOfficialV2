const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  const materials = [
    { id: 1, name: 'Sand', category: 'Material', pricePerUnit: 50, unit: 'ton', type: 'material' },
    { id: 2, name: 'Cement', category: 'Material', pricePerUnit: 10, unit: 'bag', type: 'material' },
    { id: 3, name: 'Timber', category: 'Material', pricePerUnit: 200, unit: 'm3', type: 'material' },
    { id: 4, name: 'Hammer', category: 'Tool', pricePerUnit: 25, unit: 'each', type: 'material' },
    { id: 5, name: 'Hard Hat', category: 'Safety', pricePerUnit: 15, unit: 'each', type: 'material' }
  ]
  res.json({ data: materials })
})

module.exports = router