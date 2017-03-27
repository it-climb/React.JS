-- Language=PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

CREATE TYPE image_type AS ENUM ('LOGO', 'PHOTO');

CREATE TABLE images (
  id         UUID          NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  type       image_type    NOT NULL,
  path       VARCHAR(1024) NOT NULL,
  alt        VARCHAR(1024)          DEFAULT '',
  name       VARCHAR(256)  NOT NULL,
  size       INTEGER       NOT NULL DEFAULT 0,
  mime_type  VARCHAR(40),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id             UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  email          citext                          NOT NULL CONSTRAINT users_email_idx UNIQUE,
  email_verified BOOLEAN                         NOT NULL DEFAULT FALSE,
  password       VARCHAR(100)                    NOT NULL,
  role_id        uuid                            NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);

CREATE UNIQUE INDEX user_id_uindex ON users USING btree (id);

ALTER TABLE users OWNER TO postgres;

CREATE TABLE roles (
  id             uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  name           character varying(50) NOT NULL,
  title          character varying(100),
  description    text,
  created_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);

ALTER TABLE roles OWNER TO postgres;

CREATE UNIQUE INDEX roles_id_uindex ON roles USING btree (id);

ALTER TABLE ONLY users
  ADD CONSTRAINT users_roles_id_fk FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE TABLE clients (
  id             UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id        UUID                            NOT NULL UNIQUE,
  logo_id        UUID,
  first_name     VARCHAR(50)                     NOT NULL DEFAULT '',
  last_name      VARCHAR(50)                     NOT NULL DEFAULT '',
  business_name  VARCHAR(50)                     NOT NULL DEFAULT '',
  phone          VARCHAR(20),
  location       JSONB                           NOT NULL DEFAULT '{}' :: JSONB,
  billing_data   JSONB                           NOT NULL DEFAULT '{}' :: JSONB,
  has_billing    BOOLEAN                         NOT NULL DEFAULT FALSE,
  settings       JSONB                           NOT NULL DEFAULT '{}' :: JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);

CREATE UNIQUE INDEX clients_id_uindex ON users USING btree (id);

ALTER TABLE ONLY clients
  ADD CONSTRAINT clients_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE ONLY clients
  ADD CONSTRAINT clients_images_id_fk FOREIGN KEY (logo_id) REFERENCES images(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE TABLE banks (
  id             UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id        UUID                            NOT NULL UNIQUE,
  logo_id        UUID,
  first_name     VARCHAR(50)                     NOT NULL DEFAULT '',
  last_name      VARCHAR(50)                     NOT NULL DEFAULT '',
  business_name  VARCHAR(50)                     NOT NULL DEFAULT '',
  phone          VARCHAR(20),
  billing_data   JSONB                           NOT NULL DEFAULT '{}' :: JSONB,
  location       JSONB                           NOT NULL DEFAULT '{}' :: JSONB,
  has_billing    BOOLEAN                         NOT NULL DEFAULT FALSE,
  settings       JSONB                           NOT NULL DEFAULT '{}' :: JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);

CREATE UNIQUE INDEX banks_id_uindex ON users USING btree (id);

ALTER TABLE ONLY banks
  ADD CONSTRAINT banks_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE ONLY banks
  ADD CONSTRAINT banks_images_id_fk FOREIGN KEY (logo_id) REFERENCES images(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE TABLE schedules (
  id             UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  sunday         BOOLEAN DEFAULT FALSE NOT NULL,
  monday         BOOLEAN DEFAULT FALSE NOT NULL,
  tuesday        BOOLEAN DEFAULT FALSE NOT NULL,
  wednesday      BOOLEAN DEFAULT FALSE NOT NULL,
  thursday       BOOLEAN DEFAULT FALSE NOT NULL,
  friday         BOOLEAN DEFAULT FALSE NOT NULL,
  saturday       BOOLEAN DEFAULT FALSE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX schedules_id_uindex ON schedules USING btree (id);

CREATE TABLE bank_ratings (
  id          UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  bank_id   UUID                            NOT NULL,
  client_id UUID                            NOT NULL,
  rating      JSONB                           NOT NULL DEFAULT '[]' :: JSONB,
  comment     TEXT                            NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()       NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);

ALTER TABLE bank_ratings
  ADD CONSTRAINT bank_ratings_bank_id_fk FOREIGN KEY (bank_id) REFERENCES banks (id) ON UPDATE NO ACTION ON DELETE CASCADE,
  ADD CONSTRAINT bank_ratings_client_id_fk FOREIGN KEY (client_id) REFERENCES clients (id) ON UPDATE NO ACTION ON DELETE CASCADE;

CREATE TABLE attachments (
  id          UUID          NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  type        image_type    NOT NULL,
  path        VARCHAR(1024) NOT NULL,
  alt         VARCHAR(1024) DEFAULT '',
  name        VARCHAR(256)  NOT NULL,
  size        INTEGER       NOT NULL DEFAULT 0,
  mime_type   VARCHAR(40),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX attachments_id_uindex ON attachments USING btree (id);

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;