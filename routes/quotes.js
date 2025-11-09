const express = require('express')
const router = express.Router()

let savedQuotes = []

router.get('/', (req, res) => {
  res.json({ data: savedQuotes })
})

router.post('/', (req, res) => {
  const { name, marginPct, projectId, nodes, staff, equipment } = req.body
  const quote = { id: Date.now(), name, marginPct, projectId, nodes, staff, equipment }
  savedQuotes.push(quote)
  res.json(quote)
})

module.exports = router