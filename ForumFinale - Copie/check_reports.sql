-- Sélectionner tous les rapports
SELECT * FROM reports;

-- Sélectionner tous les posts
SELECT * FROM posts;

-- Sélectionner les rapports avec les informations des posts associés
SELECT r.id, r.reason, r.status, r.user_id, r.created_at, p.id as post_id, p.content
FROM reports r
JOIN posts p ON r.post_id = p.id;
