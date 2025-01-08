SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."activities" ("id", "content", "user_id", "created_at") VALUES
	('7cc5cefa-2836-4c5a-abac-9bf644c02a2b', 'さわ', 'c5f80cde-1187-4798-b9fd-15cc8835059e', '2025-01-08 21:26:53.54894+09');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "nickname", "created_at", "updated_at") VALUES
	('c5f80cde-1187-4798-b9fd-15cc8835059e', 'sawayamasawayama@gmail.com', '2025-01-08 21:26:06.330011+09', '2025-01-08 21:26:06.330011+09');


--
-- PostgreSQL database dump complete
--

RESET ALL;
