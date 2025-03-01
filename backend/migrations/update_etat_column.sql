-- Modify the 'etat' column to be an ENUM with both options
ALTER TABLE utilisateurs
MODIFY COLUMN etat ENUM('Connecté', 'Déconnecté') NOT NULL DEFAULT 'Déconnecté';

-- Update existing rows to use the new ENUM values
UPDATE utilisateurs
SET etat = 'Déconnecté'
WHERE etat IS NULL OR etat NOT IN ('Connecté', 'Déconnecté');
