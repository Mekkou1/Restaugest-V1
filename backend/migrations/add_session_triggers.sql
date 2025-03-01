-- Trigger to update etat to 'Connecté' on login
CREATE TRIGGER after_session_insert
AFTER INSERT ON sessions
FOR EACH ROW
BEGIN
    UPDATE utilisateurs
    SET etat = 'Connecté'
    WHERE id = NEW.userId;
END;

-- Trigger to update etat to 'Déconnecté' on logout
CREATE TRIGGER after_session_delete
AFTER DELETE ON sessions
FOR EACH ROW
BEGIN
    UPDATE utilisateurs
    SET etat = 'Déconnecté'
    WHERE id = OLD.userId;
END;

-- Trigger to handle session expiration
CREATE TRIGGER before_session_update
BEFORE UPDATE ON sessions
FOR EACH ROW
BEGIN
    IF NEW.expiresAt < NOW() THEN
        UPDATE utilisateurs
        SET etat = 'Déconnecté'
        WHERE id = NEW.userId;
    END IF;
END;
