----
INSERT INTO roles (id, name, title, description)
VALUES
  (uuid_generate_v4(), 'admin', 'Admin', 'Admin'),
  (uuid_generate_v4(), 'bank', 'Bank', 'Bank'),
  (uuid_generate_v4(), 'client', 'Client', 'Client');


----
INSERT INTO
  users (id, role_id , /*first_name, last_name, */email, password)
  SELECT
    uuid_generate_v4(),
    roles.id,
    /*'admin',
    'admin',*/
    'admin@admin.com',
    '$2a$10$lOx7UNUWmZm96Ik5qxIU4e0TnEVxEX34JdrQJOPibe51aoSoazOnS' /* password = test */
  FROM
    roles  AS roles
  WHERE
    roles.name = 'admin';