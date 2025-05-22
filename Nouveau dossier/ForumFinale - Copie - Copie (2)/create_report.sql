-- Insérer un rapport pour un post existant
-- Remplacez 5 par l'ID d'un post existant dans votre base de données
-- Remplacez 1 par l'ID d'un utilisateur existant dans votre base de données
INSERT INTO reports (post_id, user_id, reason, status, created_at)
VALUES (5, 1, 'Contenu inapproprié - Test', 'PENDING', NOW());

-- Mettre à jour le compteur de rapports du post
UPDATE posts SET reports = reports + 1 WHERE id = 5;
