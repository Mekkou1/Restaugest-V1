-- Mettre à jour le mot de passe de l'admin avec un hash bcrypt valide
UPDATE utilisateurs 
SET mot_de_passe = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- Mot de passe : restaugest123
WHERE pseudo = 'admin';

-- Vérifier la modification
SELECT id, pseudo, mot_de_passe FROM utilisateurs WHERE pseudo = 'admin';
