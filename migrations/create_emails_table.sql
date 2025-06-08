CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'sent'
);

-- Création d'un index sur recipient_email pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_emails_recipient_email ON emails(recipient_email);

-- Création d'un index sur sent_date pour optimiser les requêtes de tri par date
CREATE INDEX IF NOT EXISTS idx_emails_sent_date ON emails(sent_date); 