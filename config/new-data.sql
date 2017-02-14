-- Language=PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

CREATE TYPE image_type AS ENUM ('LOGO', 'PHOTO');
CREATE TYPE locations_state AS ENUM ('DRAFT', 'ACTIVE', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED');
CREATE TYPE transaction_types AS ENUM ('SUBSCRIPTION','PICK_UP');

-- Roles
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

-- Users
CREATE TABLE users (
  id             UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  email          citext                          NOT NULL CONSTRAINT users_email_idx UNIQUE,
  email_verified BOOLEAN                         NOT NULL DEFAULT FALSE,
  password       VARCHAR(100)                    NOT NULL,
  role_id        uuid                            NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW()       NOT NULL
);

ALTER TABLE users OWNER TO postgres;

CREATE UNIQUE INDEX user_id_uindex ON users USING btree (id);

ALTER TABLE ONLY users
  ADD CONSTRAINT users_roles_id_fk FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

-- Images
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

-- Clients
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

ALTER TABLE clients OWNER TO postgres;

CREATE UNIQUE INDEX user_id_uindex ON clients USING btree (id);

ALTER TABLE ONLY clients
  ADD CONSTRAINT clients_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE ONLY clients
  ADD CONSTRAINT clients_users_id_fk  FOREIGN KEY (logo_id) REFERENCES images(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

-- Banks
CREATE TABLE banks (
  id          UUID          NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        REAL          NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE banks OWNER TO postgres;

CREATE UNIQUE INDEX user_id_uindex ON banks USING btree (id);

-- Bids
CREATE TABLE bids (
  id          UUID          NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  bank_id     UUID          NOT NULL ,
  client_id   UUID          NOT NULL,
  bid         REAL          NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE bids OWNER TO postgres;

ALTER TABLE ONLY bids
  ADD CONSTRAINT bids_banks_id_fk FOREIGN KEY (bank_id) REFERENCES banks(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE ONLY bids
  ADD CONSTRAINT bids_client_id_fk FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

-- Payments
CREATE TABLE payments (
  id                  UUID              NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id           UUID              NOT NULL,
  bank_id             UUID              NOT NULL,
  type                transaction_types NOT NULL,
  amount              NUMERIC(10, 2)    NOT NULL,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT now()
);

ALTER TABLE payments OWNER TO postgres;

ALTER TABLE payments
  ADD CONSTRAINT payment_client_id_fk FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE NO ACTION ON DELETE RESTRICT;

ALTER TABLE payments
  ADD CONSTRAINT payment_bank_id_fk FOREIGN KEY (bank_id) REFERENCES banks(id) ON UPDATE NO ACTION ON DELETE RESTRICT;


-- Transactions
CREATE TABLE transactions (
  id                  UUID              NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_id         UUID              NOT NULL,
  payment_provider    VARCHAR(20)       NOT NULL,
  payment_provider_id VARCHAR(100)      NOT NULL,
  type                transaction_types NOT NULL,
  amount              NUMERIC(10, 2)    NOT NULL,
  fee                 NUMERIC(10, 2)    NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT now()
);
