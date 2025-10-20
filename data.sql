--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

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
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: tcp
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'TEMPORARY',
    'SUBMITTED',
    'UNDER_REVIEW',
    'PENDING_DOCUMENTS',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApplicationStatus" OWNER TO tcp;

--
-- Name: DCCLevel; Type: TYPE; Schema: public; Owner: tcp
--

CREATE TYPE public."DCCLevel" AS ENUM (
    'LEVEL_A',
    'LEVEL_B',
    'LEVEL_C'
);


ALTER TYPE public."DCCLevel" OWNER TO tcp;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: tcp
--

CREATE TYPE public."UserRole" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'DCC',
    'EMPLOYER',
    'CONSUMER'
);


ALTER TYPE public."UserRole" OWNER TO tcp;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO tcp;

--
-- Name: application_evaluations; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.application_evaluations (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "evaluatorId" text NOT NULL,
    questions jsonb NOT NULL,
    "overallScore" double precision NOT NULL,
    "overallComment" text,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.application_evaluations OWNER TO tcp;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.applications (
    id text NOT NULL,
    "userId" text,
    phone text NOT NULL,
    email text NOT NULL,
    status public."ApplicationStatus" DEFAULT 'SUBMITTED'::public."ApplicationStatus" NOT NULL,
    "formData" jsonb NOT NULL,
    "currentStep" integer DEFAULT 1 NOT NULL,
    notes text,
    "dccCreated" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.applications OWNER TO tcp;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.courses (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    instructor text NOT NULL,
    duration text NOT NULL,
    level text NOT NULL,
    category text NOT NULL,
    price double precision,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.courses OWNER TO tcp;

--
-- Name: dcc_profiles; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.dcc_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "applicationId" text NOT NULL,
    level public."DCCLevel" DEFAULT 'LEVEL_C'::public."DCCLevel" NOT NULL,
    rating double precision DEFAULT 5.0 NOT NULL,
    "totalSales" text DEFAULT 'RWF 0'::text NOT NULL,
    "monthlySales" text DEFAULT 'RWF 0'::text NOT NULL,
    "productsAvailable" integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    location text NOT NULL,
    specialties text[],
    performance jsonb NOT NULL,
    "recentActivity" jsonb NOT NULL,
    "approvedBy" text,
    "approvedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dcc_profiles OWNER TO tcp;

--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.email_logs (
    id text NOT NULL,
    "to" text NOT NULL,
    subject text NOT NULL,
    template text NOT NULL,
    status text NOT NULL,
    error text,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_logs OWNER TO tcp;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.jobs (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    company text NOT NULL,
    location text NOT NULL,
    salary text,
    type text NOT NULL,
    category text NOT NULL,
    requirements jsonb NOT NULL,
    benefits jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    "postedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.jobs OWNER TO tcp;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.password_resets (
    id text NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    used boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_resets OWNER TO tcp;

--
-- Name: products; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    category text NOT NULL,
    images text[],
    stock integer DEFAULT 0 NOT NULL,
    "sellerId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO tcp;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO tcp;

--
-- Name: sms_logs; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.sms_logs (
    id text NOT NULL,
    "to" text NOT NULL,
    message text NOT NULL,
    status text NOT NULL,
    error text,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sms_logs OWNER TO tcp;

--
-- Name: users; Type: TABLE; Schema: public; Owner: tcp
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    phone text,
    name text NOT NULL,
    password text NOT NULL,
    avatar text,
    role public."UserRole" DEFAULT 'CONSUMER'::public."UserRole" NOT NULL,
    permissions text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO tcp;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: application_evaluations; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.application_evaluations (id, "applicationId", "evaluatorId", questions, "overallScore", "overallComment", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.applications (id, "userId", phone, email, status, "formData", "currentStep", notes, "dccCreated", "createdAt", "updatedAt") FROM stdin;
cmbr85qnu0004ddf9gsgtyq1o	cmbr0v58k0000dduicu50hv6e	+250788123458	dcc@Gemurai.rw	SUBMITTED	{"businessInfo": {"location": "Kigali, Gasabo", "businessName": "Sample DCC Business"}, "personalInfo": {"name": "John Mugisha", "email": "dcc@Gemurai.rw", "phone": "+250788123458"}}	5	\N	f	2025-06-11 00:41:47.322	2025-06-11 00:41:47.322
auto_1749636825766_5uz7pb7q6	\N	0780463691	abdoulnyabyenda@gmail.com	SUBMITTED	{"q1": "Abdoul", "q2": "Nyabyenda", "q3": "2009-02-02", "q4": "Male", "q5": "1199233945909322", "q6": "Married", "q7": "abdoulnyabyenda@gmail.com", "q8": "0780463691", "q10": "SMS", "q11": {"cell": "Muyira II", "sector": "Muyira", "village": "Village 701", "district": "Nyanza", "province": "Southern"}, "q17": "Highest Level Completed", "q18": "ICT", "q19": ["Computer Literacy", "Marketing", "Customer Service"], "q20": ["Kinyarwanda", "French"], "q21": "Yes", "q22": "Employed Full-time", "q23": "3-6", "q24": "I want to make money", "q25": "My goal is to buid a house", "q26": "Part-time (20-39 hours/week)", "q30": "Frame 15 (1).png", "q31": "Frame 15 (1).png", "cell": "Muyira II", "sector": "Muyira", "village": "Village 701", "district": "Nyanza", "province": "Southern", "q1749606303608-kwpeiih39": "KIMIHURURA", "q1749630681456-8daluyv3s": "Yes", "q1749630718985-p5lu0fzhw": "Yes"}	6	\N	f	2025-06-11 10:13:45.983	2025-06-11 10:16:32.313
auto_1749089863638_2tdwgul6o	cmbjhg0iw0002dd44j6oxaegv	0787283352	niyoeri6@gmail.com	APPROVED	{"q1": "Parfect", "q2": "Gift", "q3": "2003-01-28", "q4": "Female", "q5": "1199233945909322", "q6": "Divorced", "q7": "niyoeri6@gmail.com", "q8": "0787283352", "q9": "+250788616703", "q10": "SMS", "q17": "TVET Certificate", "q19": ["Sales"], "q20": ["English"], "q21": "Yes", "q22": "Employed Part-time", "q23": "If we list all the natural numbers below 10", "q24": "If we list all the natural numbers below 10", "q25": "If we list all the natural numbers below 10", "q26": "Part-time (20-39 hours/week)", "q27": "If we list all the natural numbers below 10", "q28": ["Health & Wellness"], "q29": "ICT CHAMBER Purchase Requisition Form[1](1).pdf", "q30": "ICT CHAMBER Purchase Requisition Form[1].docx", "q31": "ICT CHAMBER Purchase Requisition Form[1](1).pdf", "q32": "ICT CHAMBER Purchase Requisition Form[1](1).pdf", "cell": "Ngoma I", "sector": "Ngoma", "village": "Village 301", "district": "Huye", "province": "Southern"}	5	\N	f	2025-06-05 02:17:43.649	2025-06-10 05:34:21.608
auto_1749636825210_3jmsn0a9w	\N	0	abdoulnyabyenda@gmail.com	TEMPORARY	{"q1": "Abdoul", "q2": "Nyabyenda", "q3": "2009-02-02", "q4": "Male", "q5": "1199233945909322", "q6": "Married", "q7": "abdoulnyabyenda@gmail.com", "q8": "0", "q11": {"cell": "", "sector": "", "village": "", "district": "Nyanza", "province": "Southern"}, "cell": "", "sector": "", "village": "", "district": "Nyanza", "province": "Southern", "q1749630681456-8daluyv3s": "Yes", "q1749630718985-p5lu0fzhw": "Yes"}	2	\N	f	2025-06-11 10:13:45.983	2025-06-11 10:13:45.983
auto_1749536490637_1xkxp8l6m	\N	0787283351	niyoeri6@gmail.com	TEMPORARY	{"q1": "Eric", "q2": "Niyonkuru", "q3": "2009-12-28", "q4": "Male", "q5": "1199233945909322", "q7": "niyoeri6@gmail.com", "q8": "0787283351", "q10": "SMS", "q11": {"cell": "Masaka II", "sector": "Masaka", "village": "Village PP", "district": "Kicukiro", "province": "Kigali"}, "cell": "Masaka II", "sector": "Masaka", "village": "Village PP", "district": "Kicukiro", "province": "Kigali"}	1	\N	f	2025-06-10 06:21:31.582	2025-06-10 06:21:57.838
auto_1749510235171_u7smjc1y7	\N	0787283351	niyoeri6@gmail.com	SUBMITTED	{"q1": "Emmanuel", "q2": "Akimana", "q3": "2006-01-31", "q4": "Male", "q5": "1199233945909322", "q7": "niyoeri6@gmail.com", "q8": "0787283351", "q10": "SMS", "q11": {"cell": "Mukura II", "sector": "Mukura", "village": "Village 431", "district": "Huye", "province": "Southern"}, "q17": "Secondary Education", "q18": "properties", "q19": ["Computer Literacy"], "q20": ["Kinyarwanda"], "q21": "Yes", "q22": "Unemployed", "q23": "Location fields: {province: '', district: 'Nyanza', sector: '', cell: '', village: 'Village OO'}", "q24": "Location fields: {province: '', district: 'Nyanza', sector: '', cell: '', village: 'Village OO'}", "q25": "Location fields: {province: '', district: 'Nyanza', sector: '', cell: '', village: 'Village OO'}", "q26": "Part-time (20-39 hours/week)", "q30": "next.svg", "q31": "file.svg", "cell": "Mukura II", "sector": "Mukura", "village": "Village 431", "district": "Huye", "province": "Southern"}	6	\N	f	2025-06-09 23:03:55.553	2025-06-10 00:02:02.925
auto_1749134902699_tsazflfal	\N	+250788616703	niyoeri6@gmail.com	UNDER_REVIEW	{"q1": "Sunny", "q2": "Fred", "q3": "2007-05-07", "q4": "Female", "q5": "1199233945909322", "q6": "Divorced", "q7": "niyoeri6@gmail.com", "q8": "+250788616703", "q9": "+250788616703", "q17": "TVET Certificate", "q18": "properties", "q19": ["Digital Marketing"], "q20": ["Swahili"], "q21": "No", "q22": "Employed Part-time", "q23": "Write a function that takes a string and returns the first character that is not repeated by the \\ncharacter right before or after it.\\nA character is considered repeating if it is the same as the one directly before or after it (not anywhere else in the string).\\nIf no such character exists, return null.\\n", "q24": "Write a function that takes a string and returns the first character that is not repeated by the \\ncharacter right before or after it.\\nA character is considered repeating if it is the same as the one directly before or after it (not anywhere else in the string).\\nIf no such character exists, return null.\\n", "q25": "Write a function that takes a string and returns the first character that is not repeated by the \\ncharacter right before or after it.\\nA character is considered repeating if it is the same as the one directly before or after it (not anywhere else in the string).\\nIf no such character exists, return null.\\n", "q27": "Write a function that takes a string and returns the first character that is not repeated by the \\ncharacter right before or after it.\\nA character is considered repeating if it is the same as the one directly before or after it (not anywhere else in the string).\\nIf no such character exists, return null.\\n", "q28": ["Health & Wellness", "Business & Entrepreneurship"], "q29": "ICT CHAMBER Purchase Requisition Form[1](1).pdf", "q30": "ICT CHAMBER Purchase Requisition Form[1].docx", "q31": "ICT CHAMBER Purchase Requisition Form[1].docx", "q32": "ICT CHAMBER Purchase Requisition Form[1].pdf", "cell": "Mukura I", "sector": "Mukura", "village": "Village 411", "district": "Huye", "province": "Southern"}	7	\N	f	2025-06-05 14:48:22.708	2025-06-10 05:10:48.575
auto_1749636825625_qo8dgctrp	\N	07	abdoulnyabyenda@gmail.com	TEMPORARY	{"q1": "Abdoul", "q2": "Nyabyenda", "q3": "2009-02-02", "q4": "Male", "q5": "1199233945909322", "q6": "Married", "q7": "abdoulnyabyenda@gmail.com", "q8": "07", "q11": {"cell": "", "sector": "", "village": "", "district": "Nyanza", "province": "Southern"}, "cell": "", "sector": "", "village": "", "district": "Nyanza", "province": "Southern", "q1749630681456-8daluyv3s": "Yes", "q1749630718985-p5lu0fzhw": "Yes"}	2	\N	f	2025-06-11 10:13:45.983	2025-06-11 10:13:45.983
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.courses (id, title, description, instructor, duration, level, category, price, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dcc_profiles; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.dcc_profiles (id, "userId", "applicationId", level, rating, "totalSales", "monthlySales", "productsAvailable", status, location, specialties, performance, "recentActivity", "approvedBy", "approvedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.email_logs (id, "to", subject, template, status, error, "sentAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.jobs (id, title, description, company, location, salary, type, category, requirements, benefits, "isActive", "postedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.password_resets (id, email, token, used, "expiresAt", "createdAt") FROM stdin;
cmbkafvpu0000dddvrajw9v92	niyoeri6@gmail.com	a7aec634-6bc5-4860-8f91-af12dd6f040c	f	2025-06-06 05:11:16.432	2025-06-06 04:11:16.432
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.products (id, name, description, price, category, images, stock, "sellerId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.sessions (id, "sessionToken", "userId", expires, "createdAt") FROM stdin;
\.


--
-- Data for Name: sms_logs; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.sms_logs (id, "to", message, status, error, "sentAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tcp
--

COPY public.users (id, email, phone, name, password, avatar, role, permissions, "isActive", "createdAt", "updatedAt") FROM stdin;
cmbjgyjsy0000ddt50mjzf8qc	niyo1eric@gmail.com	0787283351	Eric Niyonkuru	$2b$10$6H0xplW40tj6lH3uSgPHaeIpn5rdcuckcX5cTKlPEEx9NKk6wD4xi	\N	CONSUMER	{dashboard.view,products.view,products.purchase,orders.view,orders.create,learning.view,learning.enroll,jobs.view,jobs.apply,profile.view,profile.edit}	t	2025-06-05 14:25:58.978	2025-06-05 14:25:58.978
cmbjhg0iw0002dd44j6oxaegv	niyoeri6@gmail.com	0787283352	Eric Niyonkuru	$2b$12$WUSWOyTfQ/CqQSo3cJzSJuMldGv7Fs4BaxdnD9TRrk1kB79NHGn4.	\N	CONSUMER	{dashboard.view,products.view,products.purchase,orders.view,orders.create,learning.view,learning.enroll,jobs.view,jobs.apply,profile.view,profile.edit}	t	2025-06-05 14:39:33.801	2025-06-05 15:18:24.307
cmbr0v58k0000dduicu50hv6e	dcc@Gemurai.rw	+250788123458	John Mugisha	$2b$12$mG8/2QFPcMGULRfxnylbFOUVaPR/HbiND2.HkK14luD8nSD/O1gZq	\N	DCC	{}	t	2025-06-10 21:17:35.684	2025-06-10 21:42:02.977
cmbr1mvdr0000dduy8e1thqx5	consumer@Gemurai.rw	+250788123460	Mary Uwimana	$2b$12$42bc9ss8KYoz2fpx3Fe1G./ZtoVj7Er9GYbLxiI4xaGPUR4i1nUKe	\N	CONSUMER	{}	t	2025-06-10 21:39:09.28	2025-06-10 21:42:03.626
cmbk8oymn0000ddfyvndm5rlo	employer@Gemurai.rw	+250788123459	Tech Company Ltd	$2b$12$BoABZjXPTdE6gMlE/cY3cOcMhZKzL9BKbcjUHCuD6nlkQo0rDFRVC	\N	EMPLOYER	{dashboard.view,jobs.view,jobs.post,jobs.manage,applications.view,applications.review,applications.manage,users.view,products.view,products.create,products.edit,products.delete,products.manage,orders.view,orders.manage}	t	2025-06-06 03:22:20.878	2025-06-11 00:41:47.15
cmbk1r1100000dd6z8ps4bp25	admin@Gemurai.rw	+250788123456	Admin User	$2b$12$2sRbj.noBsg2I42G4ybBiujGXDsWC7d35dJSTHlvlIUASU2q10YKe	\N	ADMIN	{dashboard.view,dashboard.analytics,users.view,users.create,users.edit,products.view,products.create,products.edit,products.delete,products.manage,orders.view,orders.manage,learning.view,learning.manage,jobs.view,jobs.manage,finance.view,finance.manage,applications.view,applications.review,applications.manage,admin.users,admin.system,admin.reports,admin.forms}	t	2025-06-06 00:07:59.987	2025-06-11 01:02:11.313
cmbk71fm80000ddh6456di8yz	superadmin@Gemurai.rw	+250788123457	Super Administrator	$2b$12$zj4OQ1hEQYGqM93ZKxjxa.Ajgz0GqrsjtU4Um4yXEjesNG0Brmmi6	\N	SUPER_ADMIN	{dashboard.view,dashboard.analytics,users.view,users.create,users.edit,users.delete,products.view,products.create,products.edit,products.delete,products.manage,orders.view,orders.create,orders.edit,orders.delete,orders.manage,learning.view,learning.create,learning.edit,learning.delete,learning.manage,learning.enroll,jobs.view,jobs.create,jobs.edit,jobs.delete,jobs.apply,jobs.post,jobs.manage,finance.view,finance.request,finance.manage,applications.view,applications.review,applications.manage,admin.users,admin.system,admin.reports,admin.forms}	t	2025-06-06 02:36:03.535	2025-06-11 01:02:11.318
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: application_evaluations application_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.application_evaluations
    ADD CONSTRAINT application_evaluations_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: dcc_profiles dcc_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.dcc_profiles
    ADD CONSTRAINT dcc_profiles_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sms_logs sms_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.sms_logs
    ADD CONSTRAINT sms_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: dcc_profiles_applicationId_key; Type: INDEX; Schema: public; Owner: tcp
--

CREATE UNIQUE INDEX "dcc_profiles_applicationId_key" ON public.dcc_profiles USING btree ("applicationId");


--
-- Name: dcc_profiles_userId_key; Type: INDEX; Schema: public; Owner: tcp
--

CREATE UNIQUE INDEX "dcc_profiles_userId_key" ON public.dcc_profiles USING btree ("userId");


--
-- Name: password_resets_token_key; Type: INDEX; Schema: public; Owner: tcp
--

CREATE UNIQUE INDEX password_resets_token_key ON public.password_resets USING btree (token);


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: tcp
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: tcp
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: tcp
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: application_evaluations application_evaluations_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.application_evaluations
    ADD CONSTRAINT "application_evaluations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_evaluations application_evaluations_evaluatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.application_evaluations
    ADD CONSTRAINT "application_evaluations_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: applications applications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dcc_profiles dcc_profiles_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.dcc_profiles
    ADD CONSTRAINT "dcc_profiles_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dcc_profiles dcc_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tcp
--

ALTER TABLE ONLY public.dcc_profiles
    ADD CONSTRAINT "dcc_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

