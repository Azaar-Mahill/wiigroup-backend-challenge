const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { maskEmail, maskPhone } = require('../utils/maskData');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }

  const { name, email, phone, business_type } = req.body;
  const id = `provider_${uuidv4().replace(/-/g, '').substring(0, 8)}`;

  // Extract document data from memory buffer (stored in PostgreSQL)
  const documentData = req.file ? req.file.buffer : null;
  const documentName = req.file ? req.file.originalname : null;
  const documentMimeType = req.file ? req.file.mimetype : null;

  try {
    // Prevent duplicate email
    const existing = await pool.query(
      'SELECT id FROM providers WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A provider with this email already exists'
      });
    }

    await pool.query(
      `INSERT INTO providers (id, name, email, phone, business_type, document_data, document_name, document_mime_type, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_verification', NOW(), NOW())`,
      [id, name, email, phone, business_type, documentData, documentName, documentMimeType]
    );

    res.status(201).json({
      id,
      status: 'pending_verification',
      message: 'Registration successful. Awaiting verification.'
    });
  } catch (err) {
    console.error('[Provider] Registration error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register provider. Please try again.'
    });
  }
};

const getById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, business_type, status, verified_at, verified_by, created_at
       FROM providers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Provider not found'
      });
    }

    const provider = result.rows[0];

    res.json({
      id: provider.id,
      name: provider.name,
      email: maskEmail(provider.email),
      phone: maskPhone(provider.phone),
      business_type: provider.business_type,
      status: provider.status,
      verified_at: provider.verified_at,
      verified_by: provider.verified_by,
      created_at: provider.created_at
    });
  } catch (err) {
    console.error('[Provider] Fetch error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch provider details.'
    });
  }
};

const verify = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }

  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id, status FROM providers WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Provider not found'
      });
    }

    if (existing.rows[0].status !== 'pending_verification') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Provider is already ${existing.rows[0].status}. Cannot re-verify.`
      });
    }

    const verifiedAt = new Date().toISOString();
    const verifiedBy = req.admin.username;

    await pool.query(
      `UPDATE providers
       SET status = $1, verified_at = $2, verified_by = $3, notes = $4, updated_at = NOW()
       WHERE id = $5`,
      [status, verifiedAt, verifiedBy, notes || null, id]
    );

    res.json({
      id,
      status,
      verified_at: verifiedAt,
      verified_by: verifiedBy
    });
  } catch (err) {
    console.error('[Provider] Verify error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify provider.'
    });
  }
};

const getDocument = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT document_data, document_name, document_mime_type FROM providers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Provider not found'
      });
    }

    const { document_data, document_name, document_mime_type } = result.rows[0];

    if (!document_data) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No document found for this provider'
      });
    }

    res.setHeader('Content-Type', document_mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document_name}"`);
    res.send(document_data);
  } catch (err) {
    console.error('[Provider] Document fetch error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch document.'
    });
  }
};

module.exports = { register, getById, verify, getDocument };
