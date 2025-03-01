-- Hacher un nouveau mot de passe avec bcrypt (remplacez 'Admin123!' par votre mot de passe)
SET @new_password = 'Admin123!';
SET @salt = SUBSTRING(SHA2(RAND(), 256), 1, 16);
SET @hashed_password = CONCAT('$2b$10$', @salt, SHA2(CONCAT(@salt, @new_password), 256));

-- Mettre à jour le mot de passe de l'utilisateur admin1
UPDATE utilisateurs 
SET mot_de_passe = @hashed_password
WHERE pseudo = 'admin1';

-- Vérifier la mise à jour
SELECT pseudo, mot_de_passe 
FROM utilisateurs 
WHERE pseudo = 'admin1';
