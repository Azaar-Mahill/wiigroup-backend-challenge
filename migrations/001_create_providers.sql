CREATE TABLE IF NOT EXISTS providers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  business_type VARCHAR(255) NOT NULL,
  document_path VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
  verified_at TIMESTAMP,
  verified_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
