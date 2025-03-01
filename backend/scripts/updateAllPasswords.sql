-- Mettre à jour les mots de passe de tous les utilisateurs
UPDATE utilisateurs 
SET mot_de_passe = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- Mot de passe : restaugest123
WHERE id IN (SELECT id FROM utilisateurs);

-- Vérifier les modifications
SELECT id, pseudo, mot_de_passe FROM utilisateurs;
