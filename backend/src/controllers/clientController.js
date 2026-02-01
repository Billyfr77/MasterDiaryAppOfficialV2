const db = require('../models');
const Client = db.Client;
const Project = db.Project;
const Quote = db.Quote;
const Invoice = db.Invoice;
const Diary = db.Diary;

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const clients = await Client.findAll({
      where: { userId },
      order: [['name', 'ASC']]
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single client with overview stats
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const include = [
      { model: Project, where: { userId }, required: false, limit: 5 }
    ];

    if (Quote) {
      include.push({ model: Quote, where: { userId }, required: false, limit: 5 });
    }

    if (Invoice) {
      include.push({ model: Invoice, where: { userId }, required: false, limit: 5 });
    }

    const client = await Client.findOne({
      where: { id: req.params.id, userId },
      include
    });
    
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client not found or unauthorized' });
    }
  } catch (error) {
    console.error('Get Client Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, company, email, phone, address, notes, tags } = req.body;
    
    const client = await Client.create({
      name,
      company,
      email,
      phone,
      address,
      notes,
      userId,
      tags: tags || []
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, company, email, phone, address, notes, status, tags } = req.body;
    const client = await Client.findOne({ where: { id: req.params.id, userId } });

    if (client) {
      if (name) client.name = name;
      if (company) client.company = company;
      if (email) client.email = email;
      if (phone) client.phone = phone;
      if (address) client.address = address;
      if (notes) client.notes = notes;
      if (status) client.status = status;
      if (tags) client.tags = tags;

      await client.save();
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client not found or unauthorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const client = await Client.findOne({ where: { id: req.params.id, userId } });
    if (client) {
      await client.destroy();
      res.json({ message: 'Client removed' });
    } else {
      res.status(404).json({ message: 'Client not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search clients (for autocomplete)
// @route   GET /api/clients/search
// @access  Private
const searchClients = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { query } = req.query;
        const Op = db.Sequelize.Op;
        
        const clients = await Client.findAll({
            where: {
                userId,
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { company: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } }
                ]
            },
            limit: 10
        });
        
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients
};
