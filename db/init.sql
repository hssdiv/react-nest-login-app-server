-- Database: react_app

-- DROP DATABASE react_app;

/*CREATE DATABASE react_app
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1; */

CREATE TABLE dogs (
	dog_id SERIAL PRIMARY KEY,
	breed VARCHAR (256) NOT NULL,
	subbreed VARCHAR ( 256 ),
    imageurl VARCHAR ( 256 ),
	custom boolean NOT NULL DEFAULT false,
	"timestamp" timestamp without time zone DEFAULT now()
);

-- Table: public.tokenblacklist

-- DROP TABLE public.tokenblacklist;

CREATE TABLE public.tokenblacklist
(
    token text COLLATE pg_catalog."default" NOT NULL,
    expires integer,
    CONSTRAINT tokenblacklist_pkey PRIMARY KEY (token)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.tokenblacklist
    OWNER to postgres;


    -- Table: public.users

-- DROP TABLE public.users;

CREATE TABLE users (
	user_id SERIAL PRIMARY KEY,
	email VARCHAR ( 256 ) UNIQUE NOT NULL,
	password VARCHAR ( 256 ),
    roles text[] COLLATE pg_catalog."default" DEFAULT '{user}'::text[]
);