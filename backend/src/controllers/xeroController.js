const { XeroClient } = require('xero-node');
const { Settings, Invoice } = require('../models');
const jwtDecode = require('jwt-decode');

const client_id = process.env.XERO_CLIENT_ID;
const client_secret = process.env.XERO_CLIENT_SECRET;
const redirectUrl = process.env.XERO_REDIRECT_URI || 'http://localhost:5173/xero/callback'; // Frontend handles callback and calls API
const scopes = 'openid profile email accounting.transactions accounting.contacts offline_access';

const xero = new XeroClient({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUris: [redirectUrl],
  scopes: scopes.split(' '),
});

// Helper: Get Setting
const getSetting = async (key) => {
  const setting = await Settings.findOne({ where: { parameter: key } });
  return setting ? setting.value : null;
};

// Helper: Set Setting
const setSetting = async (key, value) => {
  const [setting] = await Settings.findOrCreate({
    where: { parameter: key },
    defaults: { value: '' }
  });
  setting.value = value;
  await setting.save();
};

exports.connect = async (req, res) => {
  try {
    const consentUrl = await xero.buildConsentUrl();
    res.json({ url: consentUrl });
  } catch (error) {
    console.error('Xero Connect Error:', error);
    res.status(500).json({ error: 'Failed to generate Xero auth URL' });
  }
};

exports.callback = async (req, res) => {
  try {
    const { url } = req.body; // Expecting the full callback URL from frontend
    const tokenSet = await xero.apiCallback(url);
    
    await xero.updateTenants(false);
    const activeTenant = xero.tenants[0];

    if (!activeTenant) throw new Error('No active Xero tenant found');

    // Save tokens to DB (Simple Key-Value Store)
    await setSetting('xeroAccessToken', tokenSet.access_token);
    await setSetting('xeroRefreshToken', tokenSet.refresh_token);
    await setSetting('xeroTenantId', activeTenant.tenantId);

    res.json({ success: true, tenant: activeTenant.tenantName });
  } catch (error) {
    console.error('Xero Callback Error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Xero' });
  }
};

exports.syncInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Restore Token
    const accessToken = await getSetting('xeroAccessToken');
    const refreshToken = await getSetting('xeroRefreshToken');
    const tenantId = await getSetting('xeroTenantId');

    if (!accessToken || !refreshToken) return res.status(401).json({ error: 'Xero not connected' });

    xero.setTokenSet({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    // Refresh if needed (basic check, xero-node handles some auto-refresh but explicit is safer)
    try {
        const tokenSet = await xero.refreshWithRefreshToken(client_id, client_secret, refreshToken);
        await setSetting('xeroAccessToken', tokenSet.access_token);
        await setSetting('xeroRefreshToken', tokenSet.refresh_token);
        xero.setTokenSet(tokenSet);
    } catch (e) {
        console.log('Token refresh failed or not needed:', e.message);
    }

    // Map DB Invoice to Xero Invoice
    const xeroInvoice = {
      type: 'ACCREC',
      contact: { 
        name: invoice.clientName || 'Unknown Client' 
      },
      date: invoice.createdAt.toISOString().split('T')[0],
      dueDate: invoice.dueDate,
      lineItems: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitAmount: item.rate,
        accountCode: '200', // Default Sales code, should be configurable
      })),
      status: 'DRAFT'
    };

    const response = await xero.accountingApi.createInvoices(tenantId, { invoices: [xeroInvoice] });
    
    res.json({ success: true, xeroInvoice: response.body.invoices[0] });

  } catch (error) {
    console.error('Xero Sync Error:', error);
    res.status(500).json({ error: error.response?.body || error.message });
  }
};
