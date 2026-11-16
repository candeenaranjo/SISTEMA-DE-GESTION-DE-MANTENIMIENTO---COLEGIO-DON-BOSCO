--
-- PostgreSQL database dump
--

\restrict XTje05CTclsubZw3oVt9Qg1rshPOUqKTd2QrZg7Zu6GbZYuWDUqkZQunhubV6Uf

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-16 00:33:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 17301)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 243 (class 1255 OID 18461)
-- Name: requerimientos_copiar_nombres(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.requerimientos_copiar_nombres() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  SELECT nombre INTO NEW.categoria_nombre FROM categorias WHERE id_categoria = NEW.id_categoria;
  SELECT nombre INTO NEW.sector_nombre FROM sectores WHERE id_sector = NEW.id_sector;
  RETURN NEW;
END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 18326)
-- Name: cargos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cargos (
    id_cargo integer NOT NULL,
    nombre character varying(60) NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 18325)
-- Name: cargos_id_cargo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cargos ALTER COLUMN id_cargo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cargos_id_cargo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 18316)
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    id_categoria integer NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 18315)
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categorias ALTER COLUMN id_categoria ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categorias_id_categoria_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 18541)
-- Name: compras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compras (
    id_compra integer NOT NULL,
    id_tarea integer NOT NULL,
    monto numeric(10,2) NOT NULL,
    detalle character varying(255) NOT NULL,
    categoria character varying(20) DEFAULT 'materiales'::character varying NOT NULL,
    fecha timestamp with time zone DEFAULT now() NOT NULL,
    factura text,
    fuente_financiamiento character varying(10) DEFAULT 'colegio'::character varying NOT NULL,
    CONSTRAINT compras_categoria_check CHECK (((categoria)::text = ANY ((ARRAY['materiales'::character varying, 'servicios'::character varying, 'otros'::character varying])::text[]))),
    CONSTRAINT compras_fuente_financiamiento_check CHECK (((fuente_financiamiento)::text = ANY ((ARRAY['jefe'::character varying, 'colegio'::character varying])::text[]))),
    CONSTRAINT compras_monto_check CHECK ((monto > (0)::numeric))
);


--
-- TOC entry 239 (class 1259 OID 18540)
-- Name: compras_id_compra_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.compras ALTER COLUMN id_compra ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.compras_id_compra_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 228 (class 1259 OID 18346)
-- Name: especialidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.especialidades (
    id_especialidad integer NOT NULL,
    nombre character varying(80) NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 18345)
-- Name: especialidades_id_especialidad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.especialidades ALTER COLUMN id_especialidad ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.especialidades_id_especialidad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 238 (class 1259 OID 18516)
-- Name: historial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historial (
    id_historial integer NOT NULL,
    id_tarea integer NOT NULL,
    estado character varying(20) NOT NULL,
    motivo character varying(500),
    id_usuario integer,
    fecha_hora timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 18515)
-- Name: historial_id_historial_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.historial ALTER COLUMN id_historial ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.historial_id_historial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 242 (class 1259 OID 18565)
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones (
    id_notificacion integer NOT NULL,
    id_usuario integer NOT NULL,
    id_requerimiento integer,
    id_tarea integer,
    tipo character varying(30) NOT NULL,
    titulo character varying(100) NOT NULL,
    mensaje character varying(200) NOT NULL,
    leida boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notificaciones_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['requerimiento'::character varying, 'tarea-aprobada'::character varying, 'tarea-rechazada'::character varying, 'tarea-finalizada'::character varying, 'tarea-cancelada'::character varying])::text[])))
);


--
-- TOC entry 241 (class 1259 OID 18564)
-- Name: notificaciones_id_notificacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notificaciones ALTER COLUMN id_notificacion ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notificaciones_id_notificacion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 18395)
-- Name: personal_externo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_externo (
    id_personal integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    dni character varying(10),
    email character varying(100),
    telefono character varying(25) NOT NULL,
    id_especialidad integer NOT NULL,
    matricula character varying(50),
    genero character varying(20),
    observaciones text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT personal_dni_numerico CHECK (((dni IS NULL) OR ((dni)::text ~ '^[0-9]+$'::text)))
);


--
-- TOC entry 231 (class 1259 OID 18394)
-- Name: personal_externo_id_personal_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.personal_externo ALTER COLUMN id_personal ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.personal_externo_id_personal_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 18422)
-- Name: requerimientos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requerimientos (
    id_requerimiento integer NOT NULL,
    id_categoria integer,
    categoria_nombre character varying(100) NOT NULL,
    descripcion text NOT NULL,
    id_sector integer,
    sector_nombre character varying(100) NOT NULL,
    imagen text,
    id_usuario integer NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_emision timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT requerimientos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'asignado'::character varying, 'resuelto'::character varying])::text[])))
);


--
-- TOC entry 233 (class 1259 OID 18421)
-- Name: requerimientos_id_requerimiento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.requerimientos ALTER COLUMN id_requerimiento ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.requerimientos_id_requerimiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 18305)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre character varying(30) NOT NULL,
    CONSTRAINT roles_nombre_check CHECK (((nombre)::text = ANY ((ARRAY['ordenanza'::character varying, 'jefeMantenimiento'::character varying, 'directivo'::character varying])::text[])))
);


--
-- TOC entry 219 (class 1259 OID 18304)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.roles ALTER COLUMN id_rol ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 18336)
-- Name: sectores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sectores (
    id_sector integer NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 18335)
-- Name: sectores_id_sector_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sectores ALTER COLUMN id_sector ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sectores_id_sector_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 18464)
-- Name: tareas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tareas (
    id_tarea integer NOT NULL,
    id_requerimiento integer NOT NULL,
    prioridad character varying(10) NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_inicio timestamp with time zone,
    fecha_fin timestamp with time zone,
    observaciones text,
    id_directivo integer,
    id_responsable integer,
    id_personal_externo integer,
    id_tarea_origen integer,
    costo_personal_externo numeric(10,2),
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT tareas_costo_personal_externo_check CHECK (((costo_personal_externo IS NULL) OR (costo_personal_externo >= (0)::numeric))),
    CONSTRAINT tareas_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'en-proceso'::character varying, 'demorada'::character varying, 'cancelada'::character varying, 'finalizada'::character varying, 'aprobada'::character varying])::text[]))),
    CONSTRAINT tareas_fechas_coherentes CHECK (((fecha_inicio IS NULL) OR (fecha_fin IS NULL) OR (fecha_fin >= fecha_inicio))),
    CONSTRAINT tareas_origen_distinto CHECK (((id_tarea_origen IS NULL) OR (id_tarea_origen <> id_tarea))),
    CONSTRAINT tareas_prioridad_check CHECK (((prioridad)::text = ANY ((ARRAY['baja'::character varying, 'media'::character varying, 'alta'::character varying])::text[]))),
    CONSTRAINT tareas_un_solo_responsable CHECK ((NOT ((id_responsable IS NOT NULL) AND (id_personal_externo IS NOT NULL))))
);


--
-- TOC entry 235 (class 1259 OID 18463)
-- Name: tareas_id_tarea_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tareas ALTER COLUMN id_tarea ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tareas_id_tarea_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 18356)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    nombre character varying(60) NOT NULL,
    apellido character varying(60) NOT NULL,
    dni character varying(10),
    email character varying(100) NOT NULL,
    password_hash character varying(100) NOT NULL,
    id_rol integer NOT NULL,
    telefono character varying(25),
    id_cargo integer,
    avatar text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT usuarios_dni_numerico CHECK (((dni IS NULL) OR ((dni)::text ~ '^[0-9]+$'::text)))
);


--
-- TOC entry 229 (class 1259 OID 18355)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.usuarios ALTER COLUMN id_usuario ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuarios_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5077 (class 0 OID 18326)
-- Dependencies: 224
-- Data for Name: cargos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cargos OVERRIDING SYSTEM VALUE VALUES (1, 'Rector');
INSERT INTO public.cargos OVERRIDING SYSTEM VALUE VALUES (2, 'Vicerrector');
INSERT INTO public.cargos OVERRIDING SYSTEM VALUE VALUES (3, 'Secretaria');
INSERT INTO public.cargos OVERRIDING SYSTEM VALUE VALUES (4, 'Director de Estudios');
INSERT INTO public.cargos OVERRIDING SYSTEM VALUE VALUES (5, 'Administrador');
INSERT INTO public.cargos OVERRIDING SYSTEM VALUE VALUES (6, 'Secretario');
INSERT INTO public.cargos OVERRIDING SYSTEM VALUE VALUES (7, 'Coordinador de Pastoral');


--
-- TOC entry 5075 (class 0 OID 18316)
-- Dependencies: 222
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (1, 'Plomería');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (2, 'Electricidad');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (3, 'Pintura');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (4, 'Carpintería');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (5, 'Albañilería');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (6, 'Climatización');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (7, 'Limpieza');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (8, 'Gas');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (9, 'Cerrajería');
INSERT INTO public.categorias OVERRIDING SYSTEM VALUE VALUES (10, 'Otros');


--
-- TOC entry 5093 (class 0 OID 18541)
-- Dependencies: 240
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.compras OVERRIDING SYSTEM VALUE VALUES (1, 126, 12450.00, 'Cerradura de embutir y juego de bisagras.', 'materiales', '2025-06-25 08:30:00-03', NULL, 'colegio');
INSERT INTO public.compras OVERRIDING SYSTEM VALUE VALUES (2, 127, 12500.00, 'Luminaria LED de emergencia 20W.', 'materiales', '2025-06-24 09:30:00-03', NULL, 'colegio');
INSERT INTO public.compras OVERRIDING SYSTEM VALUE VALUES (3, 124, 8900.00, 'Pintura exterior + rodillo.', 'materiales', '2025-06-24 12:00:00-03', NULL, 'colegio');
INSERT INTO public.compras OVERRIDING SYSTEM VALUE VALUES (4, 121, 4300.00, 'Toma Schuko + cable.', 'materiales', '2025-06-22 11:00:00-03', NULL, 'colegio');
INSERT INTO public.compras OVERRIDING SYSTEM VALUE VALUES (5, 125, 15000.00, 'Visita técnica de ClimaSur para diagnóstico.', 'servicios', '2025-06-25 10:00:00-03', NULL, 'colegio');
INSERT INTO public.compras OVERRIDING SYSTEM VALUE VALUES (7, 134, 6500.00, 'Bolsas de residuos y guantes.', 'materiales', '2025-06-25 17:10:00-03', NULL, 'colegio');
INSERT INTO public.compras OVERRIDING SYSTEM VALUE VALUES (6, 135, 25000.00, 'Sellador, látex y pinceles.', 'materiales', '2025-06-26 13:30:00-03', NULL, 'colegio');


--
-- TOC entry 5081 (class 0 OID 18346)
-- Dependencies: 228
-- Data for Name: especialidades; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (1, 'Electricista');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (2, 'Plomería');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (3, 'Albañilería');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (4, 'Pintura');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (5, 'Carpintería');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (6, 'Gasista');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (7, 'Herrería');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (8, 'Climatización');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (9, 'Mantenimiento general');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (10, 'Vidriería');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (11, 'Cerrajería');
INSERT INTO public.especialidades OVERRIDING SYSTEM VALUE VALUES (12, 'Jardinería');


--
-- TOC entry 5091 (class 0 OID 18516)
-- Dependencies: 238
-- Data for Name: historial; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (1, 128, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0342', 6, '2025-06-25 09:12:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (2, 128, 'en-proceso', 'El técnico Carlos Méndez inició la reparación.', 8, '2025-06-25 10:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (3, 127, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0341', 6, '2025-06-24 08:47:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (4, 127, 'en-proceso', 'Juan Carlos Gómez inició el cambio de luminaria.', 6, '2025-06-24 10:15:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (5, 127, 'finalizada', 'El personal externo completó el cambio de luminaria.', 6, '2025-06-24 14:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (6, 126, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0340', 6, '2025-06-24 16:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (7, 126, 'en-proceso', 'Se retiró la cerradura rota para su reemplazo.', 13, '2025-06-25 08:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (8, 125, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0339', 6, '2025-06-24 14:22:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (9, 125, 'en-proceso', 'ClimaSur S.A. se presentó para revisar el equipo.', 6, '2025-06-25 09:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (10, 124, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0338', 6, '2025-06-24 11:15:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (11, 124, 'en-proceso', 'Se inició la preparación de la superficie.', 7, '2025-06-24 13:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (12, 124, 'demorada', 'Se demora por lluvia. Se retomará cuando el clima mejore.', 7, '2025-06-25 08:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (13, 123, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0337', 6, '2025-06-23 17:40:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (14, 123, 'en-proceso', 'Pedro Ruiz comenzó la revisión de la caldera.', 10, '2025-06-24 09:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (15, 123, 'finalizada', 'Tarea finalizada. Pendiente de evaluación del Directivo.', 10, '2025-06-24 15:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (16, 121, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0335', 6, '2025-06-22 10:05:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (17, 121, 'en-proceso', 'Juan Torres inició el reemplazo de la toma.', 13, '2025-06-22 11:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (18, 121, 'finalizada', 'Tarea finalizada. Pendiente de evaluación del Directivo.', 13, '2025-06-22 16:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (19, 121, 'aprobada', 'El Directivo aprobó la tarea. Trabajo conforme.', 4, '2025-06-23 09:15:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (20, 131, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0345', 6, '2025-06-26 10:40:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (21, 131, 'en-proceso', 'Ana Torres inició el recambio de tubos.', 1, '2025-06-26 11:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (22, 133, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0347', 6, '2025-06-26 12:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (23, 133, 'en-proceso', 'Alejandro Ponce inició los trabajos de pintura.', 6, '2025-06-26 13:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (24, 134, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0348', 6, '2025-06-25 16:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (25, 134, 'en-proceso', 'Laura Fernández inició la limpieza.', 7, '2025-06-25 17:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (26, 134, 'finalizada', 'Limpieza completa.', 7, '2025-06-25 18:30:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (27, 134, 'aprobada', 'El Directivo aprobó la tarea.', 5, '2025-06-26 09:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (28, 133, 'cancelada', 'no vino el pintor', 6, '2026-11-15 18:17:31.106957-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (29, 135, 'pendiente', 'Tarea creada a partir del requerimiento REQ-0347', 6, '2025-06-26 12:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (30, 135, 'en-proceso', 'Alejandro Ponce inició los trabajos de pintura.', 6, '2025-06-26 13:00:00-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (31, 135, 'cancelada', 'no vino el pintor', 6, '2026-11-15 18:17:31.106957-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (32, 135, 'pendiente', 'Tarea generada automáticamente por la cancelación de T-0133.', 6, '2026-11-15 18:17:31.106957-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (33, 136, 'en-proceso', 'Tarea creada y asignada; se inició automáticamente.', 6, '2026-11-15 18:30:23.254008-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (34, 136, 'finalizada', 'Tarea finalizada. Pendiente de evaluación del Directivo.', 1, '2026-11-15 19:18:26.639321-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (35, 131, 'finalizada', 'Tarea finalizada. Pendiente de evaluación del Directivo.', 1, '2026-11-15 20:03:01.666651-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (36, 128, 'demorada', 'porque necesita aprobacion externa', 6, '2026-11-15 20:14:36.500133-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (37, 128, 'en-proceso', 'Se retomó la tarea.', 6, '2026-11-15 20:16:48.659117-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (38, 124, 'en-proceso', 'Se retomó la tarea.', 6, '2026-11-15 20:17:45.981527-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (39, 135, 'en-proceso', 'Se inició la tarea.', 6, '2026-11-15 20:18:10.6823-03');
INSERT INTO public.historial OVERRIDING SYSTEM VALUE VALUES (40, 135, 'demorada', 'Esperando aprobacion de Materiales', 6, '2026-11-15 20:18:46.96671-03');


--
-- TOC entry 5095 (class 0 OID 18565)
-- Dependencies: 242
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (1, 6, 342, NULL, 'requerimiento', 'Nuevo requerimiento', 'Se emitió el requerimiento REQ-0342: Filtración en techo - Pabellón B.', false, '2025-06-25 09:12:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (2, 6, 341, NULL, 'requerimiento', 'Nuevo requerimiento', 'Se emitió el requerimiento REQ-0341: Luz de emergencia sin funcionar.', true, '2025-06-24 08:47:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (3, 4, NULL, 123, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0123: Revisión de caldera pasó a finalizada y espera tu aprobación.', false, '2025-06-24 15:00:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (4, 6, NULL, 121, 'tarea-aprobada', 'Tarea aprobada', 'El Directivo aprobó la tarea T-0121: Reemplazo de toma eléctrica.', false, '2025-06-23 09:15:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (5, 5, NULL, 127, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0127: Cambio de luminaria pasó a finalizada.', false, '2025-06-24 14:00:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (6, 6, 335, NULL, 'requerimiento', 'Nuevo requerimiento', 'Se emitió el requerimiento REQ-0335: Toma eléctrica suelta.', true, '2025-06-22 10:05:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (7, 6, 343, NULL, 'requerimiento', 'Nuevo requerimiento', 'Se emitió el requerimiento REQ-0343: Grieta en aula 15.', false, '2025-06-26 08:10:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (8, 5, NULL, 134, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0134: Limpieza patio central pasó a finalizada.', true, '2025-06-25 18:30:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (9, 4, NULL, 134, 'tarea-aprobada', 'Tarea aprobada', 'El Directivo aprobó la tarea T-0134: Limpieza patio central.', false, '2025-06-26 09:00:00-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (10, 4, 343, 136, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0136: Albañilería pasó a finalizada y espera tu aprobación.', false, '2026-11-15 19:18:26.639321-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (11, 5, 343, 136, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0136: Albañilería pasó a finalizada y espera tu aprobación.', false, '2026-11-15 19:18:26.639321-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (12, 9, 343, 136, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0136: Albañilería pasó a finalizada y espera tu aprobación.', false, '2026-11-15 19:18:26.639321-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (13, 11, 343, 136, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0136: Albañilería pasó a finalizada y espera tu aprobación.', false, '2026-11-15 19:18:26.639321-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (14, 16, 343, 136, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0136: Albañilería pasó a finalizada y espera tu aprobación.', false, '2026-11-15 19:18:26.639321-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (15, 4, 345, 131, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0131: Electricidad pasó a finalizada y espera tu aprobación.', false, '2026-11-15 20:03:01.666651-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (16, 5, 345, 131, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0131: Electricidad pasó a finalizada y espera tu aprobación.', false, '2026-11-15 20:03:01.666651-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (17, 9, 345, 131, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0131: Electricidad pasó a finalizada y espera tu aprobación.', false, '2026-11-15 20:03:01.666651-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (18, 11, 345, 131, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0131: Electricidad pasó a finalizada y espera tu aprobación.', false, '2026-11-15 20:03:01.666651-03');
INSERT INTO public.notificaciones OVERRIDING SYSTEM VALUE VALUES (19, 16, 345, 131, 'tarea-finalizada', 'Tarea finalizada', 'La tarea T-0131: Electricidad pasó a finalizada y espera tu aprobación.', false, '2026-11-15 20:03:01.666651-03');


--
-- TOC entry 5085 (class 0 OID 18395)
-- Dependencies: 232
-- Data for Name: personal_externo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (1, 'Juan Carlos', 'Gómez', '40111222', 'jc.gomez@mail.com', '+54 9 2664 12-3456', 1, 'ELEC-001', 'M', NULL, true, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (2, 'María Laura', 'Torres', '40222333', 'ml.torres@mail.com', '+54 9 2664 22-3344', 2, 'PLOM-014', 'F', NULL, true, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (3, 'Ramiro', 'Sánchez', '40333444', NULL, '+54 9 2664 33-7788', 3, 'ALB-007', 'M', NULL, true, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (4, 'Fernando', 'Vega', '40444555', NULL, '+54 9 2664 44-5566', 4, NULL, 'M', NULL, true, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (5, 'Lucía', 'Rojas', '40555666', 'l.rojas@mail.com', '+54 9 2664 55-4433', 5, 'CARP-021', 'F', NULL, true, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (6, 'Pablo', 'Álvarez', '40666777', NULL, '+54 9 2664 66-2211', 9, NULL, 'M', NULL, true, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (7, 'Diego', 'Martínez', '40777888', NULL, '+54 9 2664 77-8899', 6, 'GAS-003', 'M', 'Baja por incumplimiento', false, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (8, 'Sofía', 'Gutiérrez', '40888999', NULL, '+54 9 2664 88-6677', 7, 'HERR-009', 'F', 'Baja por mudanza', false, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (9, 'ClimaSur', 'S.A.', '309999999', 'contacto@climasur.com', '+54 9 2664 98-7654', 8, 'CLIMA-002', NULL, 'Empresa de climatización', true, '2025-02-01 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (10, 'Alejandro', 'Ponce', '41111000', NULL, '+54 9 2664 11-2233', 10, 'VID-004', 'M', NULL, true, '2025-03-10 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (11, 'Gabriela', 'Núñez', '41222111', NULL, '+54 9 2664 21-3344', 11, 'CERR-005', 'F', NULL, true, '2025-03-10 09:00:00-03');
INSERT INTO public.personal_externo OVERRIDING SYSTEM VALUE VALUES (12, 'Sergio', 'Luna', '41333222', NULL, '+54 9 2664 31-4455', 12, 'JARD-001', 'M', NULL, true, '2025-03-10 09:00:00-03');


--
-- TOC entry 5087 (class 0 OID 18422)
-- Dependencies: 234
-- Data for Name: requerimientos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (341, 2, 'Electricidad', 'La luz de emergencia del pasillo principal no enciende. Se verificó que no es problema del tubo LED.', 9, 'Pasillo principal', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 8, 'asignado', true, '2025-06-24 08:47:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (340, 4, 'Carpintería', 'La puerta del aula 12 está dañada y no cierra correctamente. Se necesita revisar la cerradura y ajustar la bisagra.', 2, 'Aula 12', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 7, 'asignado', true, '2025-06-24 16:30:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (339, 6, 'Climatización', 'El aire acondicionado del laboratorio de informática no enfría. Hace ruido extraño al encender.', 7, 'Laboratorio de informática', NULL, 9, 'asignado', true, '2025-06-24 14:22:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (337, 6, 'Climatización', 'La calefacción del aula 8 no prende. Se verificó que el termostato está en buen estado.', 1, 'Aula 8', NULL, 10, 'asignado', true, '2025-06-23 17:40:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (335, 2, 'Electricidad', 'La toma del laboratorio 3 está suelta y hace mal contacto. Puede ser peligroso.', 6, 'Laboratorio 3', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800', 12, 'resuelto', true, '2025-06-22 10:05:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (346, 1, 'Plomería', 'Pérdida de agua en el baño del pabellón B. El inodoro no para de cargar.', 15, 'Pabellón B - Baño', NULL, 2, 'asignado', true, '2025-06-26 11:05:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (348, 7, 'Limpieza', 'Basura acumulada en el patio central luego del acto del 25 de mayo.', 5, 'Patio central', NULL, 7, 'resuelto', true, '2025-06-25 16:30:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (343, 5, 'Albañilería', 'Grieta en la pared del aula 15, lado ventana. Se agranda con el tiempo.', 3, 'Aula 15', NULL, 14, 'asignado', true, '2025-06-26 08:10:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (345, 2, 'Electricidad', 'Fluorescentes del salón de actos parpadean. Son 4 tubos.', 19, 'Salón de actos', NULL, 1, 'asignado', true, '2025-06-26 10:40:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (342, 1, 'Plomería', 'Se observa filtración de agua en el techo del pabellón B, principalmente en la zona del pasillo. En días de lluvia el agua se filtra hacia el interior y afecta las luminarias y el cielorraso.', 13, 'Pabellón B (Aula 12 - Pasillo)', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', 7, 'asignado', true, '2025-06-25 09:12:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (338, 3, 'Pintura', 'Se observa pintura descascarada en la pared del patio. Necesita lijado y repintado.', 5, 'Patio central', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800', 1, 'asignado', true, '2025-06-24 11:15:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (347, 3, 'Pintura', 'Repintar la capilla: humedad en la pared del altar.', 18, 'Capilla', NULL, 13, 'asignado', true, '2025-06-26 12:00:00-03');
INSERT INTO public.requerimientos OVERRIDING SYSTEM VALUE VALUES (336, 8, 'Gas', 'Se siente olor a gas en la cocina del pabellón C. Se recomienda revisar las conexiones de la cocina.', 14, 'Pabellón C - Cocina', 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800', 11, 'pendiente', false, '2025-06-23 12:18:00-03');


--
-- TOC entry 5073 (class 0 OID 18305)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles OVERRIDING SYSTEM VALUE VALUES (1, 'ordenanza');
INSERT INTO public.roles OVERRIDING SYSTEM VALUE VALUES (2, 'jefeMantenimiento');
INSERT INTO public.roles OVERRIDING SYSTEM VALUE VALUES (3, 'directivo');


--
-- TOC entry 5079 (class 0 OID 18336)
-- Dependencies: 226
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (1, 'Aula 8');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (2, 'Aula 12');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (3, 'Aula 15');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (4, 'Baño Pabellón B');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (5, 'Patio central');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (6, 'Laboratorio 3');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (7, 'Laboratorio de informática');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (8, 'Dirección');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (9, 'Pasillo principal');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (10, 'Biblioteca');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (11, 'Gimnasio');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (12, 'Cocina');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (13, 'Pabellón B (Aula 12 - Pasillo)');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (14, 'Pabellón C - Cocina');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (15, 'Pabellón B - Baño');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (16, 'Pabellón B');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (17, 'Pabellón C');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (18, 'Capilla');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (19, 'Salón de actos');
INSERT INTO public.sectores OVERRIDING SYSTEM VALUE VALUES (20, 'Otro');


--
-- TOC entry 5089 (class 0 OID 18464)
-- Dependencies: 236
-- Data for Name: tareas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (127, 341, 'media', 'finalizada', '2025-06-24 08:47:00-03', '2025-06-24 10:15:00-03', '2025-06-24 14:00:00-03', 'Cambio de luminaria completo.', NULL, NULL, 1, NULL, 40000.00, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (126, 340, 'alta', 'en-proceso', '2025-06-24 16:30:00-03', '2025-06-25 08:00:00-03', NULL, 'Se retiró la cerradura rota para su reemplazo.', NULL, 13, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (125, 339, 'media', 'en-proceso', '2025-06-24 14:22:00-03', '2025-06-25 09:00:00-03', NULL, 'ClimaSur diagnosticó y pidió repuesto.', NULL, NULL, 9, NULL, 35000.00, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (123, 337, 'alta', 'finalizada', '2025-06-23 17:40:00-03', '2025-06-24 09:00:00-03', '2025-06-24 15:00:00-03', 'Revisión de caldera completa.', NULL, 10, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (121, 335, 'media', 'aprobada', '2025-06-22 10:05:00-03', '2025-06-22 11:30:00-03', '2025-06-22 16:30:00-03', 'Trabajo conforme.', 4, 13, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (134, 348, 'baja', 'aprobada', '2025-06-25 16:30:00-03', '2025-06-25 17:00:00-03', '2025-06-25 18:30:00-03', 'Limpieza completa.', 5, 7, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (133, 347, 'baja', 'cancelada', '2025-06-26 12:00:00-03', '2025-06-26 13:00:00-03', '2026-11-15 18:17:31.11-03', 'Se lijó la pared y se aplicó sellador.', NULL, NULL, 10, NULL, 25000.00, false);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (136, 343, 'media', 'finalizada', '2026-11-15 18:30:23.254008-03', '2026-11-15 18:30:23.257-03', '2026-11-15 19:18:26.641-03', NULL, NULL, 1, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (131, 345, 'media', 'finalizada', '2025-06-26 10:40:00-03', '2025-06-26 11:30:00-03', '2026-11-15 20:03:01.67-03', 'Se están cambiando los tubos.', NULL, 1, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (128, 342, 'alta', 'en-proceso', '2025-06-25 09:12:00-03', '2025-06-25 10:30:00-03', NULL, 'Se necesita cerrar el paso de agua antes de reparar.', NULL, 8, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (124, 338, 'baja', 'en-proceso', '2025-06-24 11:15:00-03', '2025-06-24 13:00:00-03', NULL, 'Se demora por lluvia. Se retomará cuando el clima mejore.', NULL, 7, NULL, NULL, NULL, true);
INSERT INTO public.tareas OVERRIDING SYSTEM VALUE VALUES (135, 347, 'baja', 'demorada', '2026-11-15 18:17:31.106957-03', '2026-11-15 20:18:10.685-03', NULL, 'Se lijó la pared y se aplicó sellador.', NULL, 18, NULL, 133, NULL, true);


--
-- TOC entry 5083 (class 0 OID 18356)
-- Dependencies: 230
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (1, 'atorres', 'Ana', 'Torres', '30123456', 'atorres@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4551234', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (2, 'lfernandez', 'Luis', 'Fernández', '31234567', 'lfernandez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4552345', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (3, 'smartinez', 'Sofía', 'Martínez', '32345678', 'smartinez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4553456', NULL, NULL, false, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (7, 'laurafernandez', 'Laura', 'Fernández', '33456789', 'laurafernandez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4557890', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (8, 'cmendez', 'Carlos', 'Méndez', '34567890', 'cmendez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4558901', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (10, 'pruiz', 'Pedro', 'Ruiz', '35678901', 'pruiz@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4569012', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (12, 'msilva', 'Matías', 'Silva', '36789012', 'msilva@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4560123', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (13, 'jtorres', 'Juan', 'Torres', '37890123', 'jtorres@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4561234', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (14, 'mgonzalez', 'María', 'González', '38901234', 'mgonzalez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4562345', NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (15, 'rcastro', 'Romina', 'Castro', '39123456', 'rcastro@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4563456', NULL, NULL, true, '2025-02-15 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (4, 'cperez', 'Carlos', 'Pérez', '20123456', 'cperez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 1, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (5, 'mgomez', 'María', 'Gómez', '21234567', 'mgomez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 3, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (9, 'jvillar', 'Jorge', 'Villar', '23456789', 'jvillar@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 6, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (11, 'lgomez', 'Lucía', 'Gómez', '24567890', 'lgomez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 3, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (16, 'srodriguez', 'Silvia', 'Rodríguez', '25678901', 'srodriguez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 2, NULL, true, '2025-02-20 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (6, 'jrodriguez', 'Juan', 'Rodríguez', '22345678', 'jrodriguez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 2, NULL, NULL, NULL, true, '2025-01-10 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (17, 'mbenitez', 'Marcos', 'Benítez', '26789012', 'mbenitez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 2, NULL, NULL, NULL, true, '2025-03-01 08:00:00-03');
INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (18, 'cnaranjo', 'Candela', 'Naranjo', '45563392', 'candenaranjo05@gmail.com', '$2b$10$CbB.sGWEtRWZ0CR9ZzuR4Oz.rc2kU4VOfbO5gu45oHLlLX25BX0CS', 1, '02664863827', NULL, NULL, true, '2026-11-15 19:50:49.166033-03');


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 223
-- Name: cargos_id_cargo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cargos_id_cargo_seq', 7, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 221
-- Name: categorias_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categorias_id_categoria_seq', 10, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 239
-- Name: compras_id_compra_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.compras_id_compra_seq', 7, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 227
-- Name: especialidades_id_especialidad_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.especialidades_id_especialidad_seq', 12, true);


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 237
-- Name: historial_id_historial_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.historial_id_historial_seq', 40, true);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 241
-- Name: notificaciones_id_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notificaciones_id_notificacion_seq', 19, true);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 231
-- Name: personal_externo_id_personal_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_externo_id_personal_seq', 12, true);


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 233
-- Name: requerimientos_id_requerimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.requerimientos_id_requerimiento_seq', 348, true);


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 3, true);


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 225
-- Name: sectores_id_sector_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sectores_id_sector_seq', 20, true);


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 235
-- Name: tareas_id_tarea_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tareas_id_tarea_seq', 136, true);


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 229
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 18, true);


--
-- TOC entry 4850 (class 2606 OID 18334)
-- Name: cargos cargos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargos
    ADD CONSTRAINT cargos_nombre_key UNIQUE (nombre);


--
-- TOC entry 4852 (class 2606 OID 18332)
-- Name: cargos cargos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargos
    ADD CONSTRAINT cargos_pkey PRIMARY KEY (id_cargo);


--
-- TOC entry 4846 (class 2606 OID 18324)
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- TOC entry 4848 (class 2606 OID 18322)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 4897 (class 2606 OID 18557)
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id_compra);


--
-- TOC entry 4900 (class 2606 OID 18683)
-- Name: compras compras_una_por_tarea; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_una_por_tarea UNIQUE (id_tarea);


--
-- TOC entry 4858 (class 2606 OID 18354)
-- Name: especialidades especialidades_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_nombre_key UNIQUE (nombre);


--
-- TOC entry 4860 (class 2606 OID 18352)
-- Name: especialidades especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_pkey PRIMARY KEY (id_especialidad);


--
-- TOC entry 4893 (class 2606 OID 18527)
-- Name: historial historial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial
    ADD CONSTRAINT historial_pkey PRIMARY KEY (id_historial);


--
-- TOC entry 4903 (class 2606 OID 18579)
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id_notificacion);


--
-- TOC entry 4873 (class 2606 OID 18414)
-- Name: personal_externo personal_externo_dni_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_externo
    ADD CONSTRAINT personal_externo_dni_key UNIQUE (dni);


--
-- TOC entry 4876 (class 2606 OID 18412)
-- Name: personal_externo personal_externo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_externo
    ADD CONSTRAINT personal_externo_pkey PRIMARY KEY (id_personal);


--
-- TOC entry 4881 (class 2606 OID 18440)
-- Name: requerimientos requerimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requerimientos
    ADD CONSTRAINT requerimientos_pkey PRIMARY KEY (id_requerimiento);


--
-- TOC entry 4842 (class 2606 OID 18314)
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- TOC entry 4844 (class 2606 OID 18312)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 4854 (class 2606 OID 18344)
-- Name: sectores sectores_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_nombre_key UNIQUE (nombre);


--
-- TOC entry 4856 (class 2606 OID 18342)
-- Name: sectores sectores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_pkey PRIMARY KEY (id_sector);


--
-- TOC entry 4888 (class 2606 OID 18483)
-- Name: tareas tareas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_pkey PRIMARY KEY (id_tarea);


--
-- TOC entry 4862 (class 2606 OID 18378)
-- Name: usuarios usuarios_dni_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_dni_key UNIQUE (dni);


--
-- TOC entry 4864 (class 2606 OID 18380)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4867 (class 2606 OID 18376)
-- Name: usuarios usuarios_nombre_usuario_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);


--
-- TOC entry 4870 (class 2606 OID 18374)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4898 (class 1259 OID 18563)
-- Name: compras_tarea_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX compras_tarea_idx ON public.compras USING btree (id_tarea);


--
-- TOC entry 4894 (class 1259 OID 18538)
-- Name: historial_tarea_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX historial_tarea_idx ON public.historial USING btree (id_tarea);


--
-- TOC entry 4895 (class 1259 OID 18539)
-- Name: historial_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX historial_usuario_idx ON public.historial USING btree (id_usuario);


--
-- TOC entry 4901 (class 1259 OID 18596)
-- Name: notificaciones_leida_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_leida_idx ON public.notificaciones USING btree (leida);


--
-- TOC entry 4904 (class 1259 OID 18598)
-- Name: notificaciones_requerimiento_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_requerimiento_idx ON public.notificaciones USING btree (id_requerimiento);


--
-- TOC entry 4905 (class 1259 OID 18597)
-- Name: notificaciones_tarea_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_tarea_idx ON public.notificaciones USING btree (id_tarea);


--
-- TOC entry 4906 (class 1259 OID 18595)
-- Name: notificaciones_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_usuario_idx ON public.notificaciones USING btree (id_usuario);


--
-- TOC entry 4874 (class 1259 OID 18420)
-- Name: personal_externo_especialidad_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_externo_especialidad_idx ON public.personal_externo USING btree (id_especialidad);


--
-- TOC entry 4877 (class 1259 OID 18458)
-- Name: requerimientos_categoria_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requerimientos_categoria_idx ON public.requerimientos USING btree (id_categoria);


--
-- TOC entry 4878 (class 1259 OID 18459)
-- Name: requerimientos_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requerimientos_estado_idx ON public.requerimientos USING btree (estado);


--
-- TOC entry 4879 (class 1259 OID 18460)
-- Name: requerimientos_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requerimientos_fecha_idx ON public.requerimientos USING btree (fecha_emision);


--
-- TOC entry 4882 (class 1259 OID 18457)
-- Name: requerimientos_sector_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requerimientos_sector_idx ON public.requerimientos USING btree (id_sector);


--
-- TOC entry 4883 (class 1259 OID 18456)
-- Name: requerimientos_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX requerimientos_usuario_idx ON public.requerimientos USING btree (id_usuario);


--
-- TOC entry 4884 (class 1259 OID 18510)
-- Name: tareas_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tareas_estado_idx ON public.tareas USING btree (estado);


--
-- TOC entry 4885 (class 1259 OID 18513)
-- Name: tareas_fecha_creacion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tareas_fecha_creacion_idx ON public.tareas USING btree (fecha_creacion);


--
-- TOC entry 4886 (class 1259 OID 18512)
-- Name: tareas_personal_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tareas_personal_idx ON public.tareas USING btree (id_personal_externo);


--
-- TOC entry 4889 (class 1259 OID 18509)
-- Name: tareas_requerimiento_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tareas_requerimiento_idx ON public.tareas USING btree (id_requerimiento);


--
-- TOC entry 4890 (class 1259 OID 18511)
-- Name: tareas_responsable_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tareas_responsable_idx ON public.tareas USING btree (id_responsable);


--
-- TOC entry 4891 (class 1259 OID 18514)
-- Name: tareas_una_viva_por_requerimiento_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tareas_una_viva_por_requerimiento_idx ON public.tareas USING btree (id_requerimiento) WHERE ((estado)::text <> ALL ((ARRAY['cancelada'::character varying, 'aprobada'::character varying])::text[]));


--
-- TOC entry 4865 (class 1259 OID 18391)
-- Name: usuarios_email_lower_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_email_lower_idx ON public.usuarios USING btree (lower((email)::text));


--
-- TOC entry 4868 (class 1259 OID 18392)
-- Name: usuarios_nombre_usuario_lower_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX usuarios_nombre_usuario_lower_idx ON public.usuarios USING btree (lower((nombre_usuario)::text));


--
-- TOC entry 4871 (class 1259 OID 18393)
-- Name: usuarios_rol_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX usuarios_rol_idx ON public.usuarios USING btree (id_rol);


--
-- TOC entry 4924 (class 2620 OID 18462)
-- Name: requerimientos requerimientos_copiar_nombres_trg; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER requerimientos_copiar_nombres_trg BEFORE INSERT ON public.requerimientos FOR EACH ROW EXECUTE FUNCTION public.requerimientos_copiar_nombres();


--
-- TOC entry 4920 (class 2606 OID 18558)
-- Name: compras compras_id_tarea_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_id_tarea_fkey FOREIGN KEY (id_tarea) REFERENCES public.tareas(id_tarea) ON DELETE CASCADE;


--
-- TOC entry 4918 (class 2606 OID 18528)
-- Name: historial historial_id_tarea_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial
    ADD CONSTRAINT historial_id_tarea_fkey FOREIGN KEY (id_tarea) REFERENCES public.tareas(id_tarea) ON DELETE CASCADE;


--
-- TOC entry 4919 (class 2606 OID 18533)
-- Name: historial historial_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial
    ADD CONSTRAINT historial_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 4921 (class 2606 OID 18585)
-- Name: notificaciones notificaciones_id_requerimiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_id_requerimiento_fkey FOREIGN KEY (id_requerimiento) REFERENCES public.requerimientos(id_requerimiento) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 18590)
-- Name: notificaciones notificaciones_id_tarea_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_id_tarea_fkey FOREIGN KEY (id_tarea) REFERENCES public.tareas(id_tarea) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 18580)
-- Name: notificaciones notificaciones_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- TOC entry 4909 (class 2606 OID 18415)
-- Name: personal_externo personal_externo_id_especialidad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_externo
    ADD CONSTRAINT personal_externo_id_especialidad_fkey FOREIGN KEY (id_especialidad) REFERENCES public.especialidades(id_especialidad);


--
-- TOC entry 4910 (class 2606 OID 18441)
-- Name: requerimientos requerimientos_id_categoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requerimientos
    ADD CONSTRAINT requerimientos_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria) ON DELETE SET NULL;


--
-- TOC entry 4911 (class 2606 OID 18446)
-- Name: requerimientos requerimientos_id_sector_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requerimientos
    ADD CONSTRAINT requerimientos_id_sector_fkey FOREIGN KEY (id_sector) REFERENCES public.sectores(id_sector) ON DELETE SET NULL;


--
-- TOC entry 4912 (class 2606 OID 18451)
-- Name: requerimientos requerimientos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requerimientos
    ADD CONSTRAINT requerimientos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 4913 (class 2606 OID 18489)
-- Name: tareas tareas_id_directivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_id_directivo_fkey FOREIGN KEY (id_directivo) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 4914 (class 2606 OID 18499)
-- Name: tareas tareas_id_personal_externo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_id_personal_externo_fkey FOREIGN KEY (id_personal_externo) REFERENCES public.personal_externo(id_personal);


--
-- TOC entry 4915 (class 2606 OID 18484)
-- Name: tareas tareas_id_requerimiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_id_requerimiento_fkey FOREIGN KEY (id_requerimiento) REFERENCES public.requerimientos(id_requerimiento);


--
-- TOC entry 4916 (class 2606 OID 18494)
-- Name: tareas tareas_id_responsable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_id_responsable_fkey FOREIGN KEY (id_responsable) REFERENCES public.usuarios(id_usuario);


--
-- TOC entry 4917 (class 2606 OID 18504)
-- Name: tareas tareas_id_tarea_origen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_id_tarea_origen_fkey FOREIGN KEY (id_tarea_origen) REFERENCES public.tareas(id_tarea);


--
-- TOC entry 4907 (class 2606 OID 18386)
-- Name: usuarios usuarios_id_cargo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_cargo_fkey FOREIGN KEY (id_cargo) REFERENCES public.cargos(id_cargo);


--
-- TOC entry 4908 (class 2606 OID 18381)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-11-16 00:33:37

--
-- PostgreSQL database dump complete
--

\unrestrict XTje05CTclsubZw3oVt9Qg1rshPOUqKTd2QrZg7Zu6GbZYuWDUqkZQunhubV6Uf

