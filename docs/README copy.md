# CursoHub — Plataforma de Cursos Online

> Plataforma distribuïda de formació online amb arquitectura de microserveis, processament multimèdia asíncron, cerca amb IA i integració de pagaments.


## Taula de continguts

1. [Introducció](#1-introducció)
2. [Anàlisi dels requeriments](#2-anàlisi-dels-requeriments)
3. [Arquitectura i tecnologies](#3-arquitectura-i-tecnologies)
4. [Implementació](#4-implementació)
5. [Millores futures](#5-millores-futures)
6. [Conclusions](#6-conclusions)
7. [Referències bibliogràfiques](#7-referències-bibliogràfiques)

---

## 1. Introducció

### 1.1. Idea de negoci

CursoHub és una plataforma digital on creadors puguen publicar cursos i estudiants puguen adquirir-los, consumir contingut multimèdia i fer seguiment del seu aprenentatge.

Punts clau:
- Monetització mitjançant compra de cursos i codis de regal.
- Escalabilitat amb serveis separats per funcionalitat (microserveis).
- Experiència d'usuari orientada a l'aprenentatge continu.
- Analítiques sobre el comportament dels usuaris per als creadors de cursos.

### 1.2. Objectius

**Generals:**
- Desenvolupar una plataforma robusta i escalable de formació online.
- Facilitar la gestió de cursos per part dels creadors.
- Oferir una experiència fluida a l'hora de compra i consum de cursos.

**Específics:**
- Implementar autenticació i gestió de perfils amb sessions múltiples.
- Permetre cerca i filtrat avançat de cursos amb IA (consultes en llenguatge natural).
- Integrar passarel·la de pagament (Stripe) amb suport de codis de regal.
- Proporcionar analítica bàsica per a creadors.
- Processar contingut multimèdia de forma asíncrona (transcodificació, transcripció).

### 1.3. Anàlisi del mercat i segmentació. Competència. DAFO

**Segmentació:**
- Segment principal: estudiants i professionals que volen millorar habilitats digitals.
- Segment secundari: creadors de contingut educatiu.
- Necessitat detectada: formació flexible, assequible i actualitzada.

**Competència:**
- Plataformes globals de formació online (Udemy, Coursera).
- Academies especialitzades en nínxols concrets.

<img src="./assets/dafo_ca.png" alt="Anàlisi DAFO" style="max-width: 650px; width: 100%;">

### 1.4. Alineació amb objectius, valors, sostenibilitat i futur (ODS)

El projecte s'alinea amb:
- **ODS 4** — Educació de qualitat: accés a formació contínua.
- **ODS 8** — Treball decent i creixement econòmic: impuls de competències professionals.
- **ODS 10** — Reducció de desigualtats: facilitant accés remot al coneixement.

Valors del projecte: **Accessibilitat · Qualitat · Innovació · Millora contínua**

---

## 2. Anàlisi dels requeriments

### 2.1. Entitat Relació (PostgreSQL)

Relacions principals:
- Un usuari pot crear múltiples cursos i inscriure's en múltiples cursos.
- Un curs té múltiples seccions; una secció té múltiples lliçons.
- Una lliçó admet quatre tipus: document, vídeo, questionari i laboratori.
- Una lliçó pot tenir múltiples arxius suplementaris.
- Els usuaris poden afegir ressenyes, marcar cursos com a favorits i deixar comentaris per lliçó.

<img src="./assets/er_postgres.png" alt="Diagrama ER PostgreSQL" style="max-width: 700px; width: 100%;">

### 2.2. Casos d'ús principals

| Actor | Accions principals |
|---|---|
| **Estudiant** | Registrar-se, cercar cursos, comprar curs, consumir contingut, seguir progrés, comentar, ressenyar |
| **Creador** | Crear/editar curs, pujar vídeos, configurar questionaris, veure analítiques |
| **Sistema** | Processar pagament (Stripe), codificar vídeos (GStreamer), generar transcripcions (Whisper) |

### 2.3. Disseny

#### 2.3.1. Mockups

La plataforma suporta mode clar i fosc amb coherència visual i contrast adequat.

**Comparativa clar / fosc**

<div style="display: flex; gap: 20px; flex-wrap: wrap;">
  <img src="./assets/login-split.png" alt="Login split" style="height: 340px; width: auto; object-fit: contain; border-radius: 8px;">
  <img src="./assets/watch-split.png" alt="Watch split" style="height: 340px; width: auto; object-fit: contain; border-radius: 8px;">
</div>


#### 2.3.2. Paleta de colors

La plataforma utilitza una paleta basada en **Shadcn UI** amb colors en format OKLCH per a una millor percepció.

**Mode Clar (`:root`)**

| Mostra | Variable | Color (OKLCH) | Descripció |
| :---: | :--- | :--- | :--- |
| <div style="background-color: oklch(1 0 0); width: 20px; height: 20px; border-radius: 4px; border: 1px solid #ccc;"></div> | `--background` | `oklch(1 0 0)` | Fons de la pàgina |
| <div style="background-color: oklch(0.145 0 0); width: 20px; height: 20px; border-radius: 4px;"></div> | `--foreground` | `oklch(0.145 0 0)` | Text principal |
| <div style="background-color: oklch(0.59 0.14 242); width: 20px; height: 20px; border-radius: 4px;"></div> | `--primary` | `oklch(0.59 0.14 242)` | Color principal d'acció |
| <div style="background-color: oklch(0.967 0.001 286.375); width: 20px; height: 20px; border-radius: 4px;"></div> | `--secondary` | `oklch(0.967 0.001 286.375)` | Color secundari |
| <div style="background-color: oklch(0.97 0 0); width: 20px; height: 20px; border-radius: 4px;"></div> | `--accent` | `oklch(0.97 0 0)` | Color de ressaltat |
| <div style="background-color: oklch(0.58 0.22 27); width: 20px; height: 20px; border-radius: 4px;"></div> | `--destructive` | `oklch(0.58 0.22 27)` | Error o accions destructives |
| <div style="background-color: oklch(0.922 0 0); width: 20px; height: 20px; border-radius: 4px;"></div> | `--border` | `oklch(0.922 0 0)` | Vores dels elements |

**Mode Fosc (`.dark`)**

| Mostra | Variable | Color (OKLCH) | Descripció |
| :---: | :--- | :--- | :--- |
| <div style="background-color: oklch(0.145 0 0); width: 20px; height: 20px; border-radius: 4px;"></div> | `--background` | `oklch(0.145 0 0)` | Fons en mode fosc |
| <div style="background-color: oklch(0.985 0 0); width: 20px; height: 20px; border-radius: 4px;"></div> | `--foreground` | `oklch(0.985 0 0)` | Text principal en mode fosc |
| <div style="background-color: oklch(0.68 0.15 237); width: 20px; height: 20px; border-radius: 4px;"></div> | `--primary` | `oklch(0.68 0.15 237)` | Color principal d'acció |
| <div style="background-color: oklch(0.274 0.006 286.033); width: 20px; height: 20px; border-radius: 4px;"></div> | `--secondary` | `oklch(0.274 0.006 286.033)` | Color secundari |
| <div style="background-color: oklch(0.371 0 0); width: 20px; height: 20px; border-radius: 4px;"></div> | `--accent` | `oklch(0.371 0 0)` | Color de ressaltat |
| <div style="background-color: oklch(0.704 0.191 22.216); width: 20px; height: 20px; border-radius: 4px;"></div> | `--destructive` | `oklch(0.704 0.191 22.216)` | Error o accions destructives |
| <div style="background-color: oklch(1 0 0 / 10%); width: 20px; height: 20px; border-radius: 4px; border: 1px solid #555;"></div> | `--border` | `oklch(1 0 0 / 10%)` | Vores dels elements |

#### 2.3.3. Usabilitat

- Navegació fluida (SPA) i clara entre aprenentatge i gestió.
- Temps de càrrega reduïts mitjançant lazy loading i React Query.
- Disseny responsive per dispositius mòbils i escriptori.
- Feedback visual en totes les accions de l'usuari.

---

## 3. Arquitectura i tecnologies

### 3.1. Stack tecnològic

| Àrea | Servei | Tecnologies | Ports | Rol |
| --- | --- | --- | :---: | --- |
| **Desplegament** | Docker | Docker, Docker Compose | — | Orquestra serveis, BD i persistència |
| **Backend** | A Core service | Go 1.25, Fiber, GORM, Stripe | 3000 | Servei principal de negoci: cursos, compres, cerca, analítiques |
| **Backend** | B Identity service | Rust 1.89, Axum, Tokio, SeaORM | 3001 | Autenticació, sessions, gestió de perfil |
| **Backend** | C Media service | Rust 1.89, GStreamer, Whisper (CUDA) | — | Processament multimèdia asíncron |
| **Backend** | Gateway IA search | Node.js, TypeScript, Express | 3003 | Gateway IA amb fallback entre proveïdors NL |
| **Backend** | Migrations | TypeScript, migrate | — | Migracions PostgreSQL/ClickHouse i Typesense |
| **Frontend** | Web SPA | React 19, Vite, Tailwind, Shadcn UI | 5173 | Interfície d'usuari completa |
| **BD** | PostgreSQL | SQL relacional | 5432 | Dades transaccionals principals |
| **BD** | ClickHouse | OLAP columnar | 8123 | Analítica d'events i mètriques |
| **BD** | Redis | Key-value en memòria | 6379 | Cache, sessions i tokens |
| **Cerca** | Typesense | Motor de cerca | 8108 | Indexació i cerca avançada de cursos |
| **Missatgeria** | RabbitMQ | Broker AMQP | 5672 / 15672 | Comunicació asíncrona entre serveis |
| **Fitxers estàtics** | Nginx | Servidor web | 8080 | Fitxers multimèdia processats |


### 3.4. Serveis backend

#### A — Core Service (Go · Port 3000)

Servei principal de negoci. Gestiona la lògica de cursos, compres, pagaments, cerca i analítiques.

**Rutes `/api/` (creadors/admin):**

| Recurs | Operacions |
|---|---|
| `/courses` | CRUD de cursos |
| `/course-sections` | Gestió de seccions |
| `/course-tags` | Etiquetes de cursos |
| `/lectures` | CRUD de lliçons |
| `/lecture-assets` | Materials suplementaris |
| `/files`, `/files-video` | Pujada i gestió de fitxers |
| `/quizzes`, `/quizzes-questions` | Gestió de questionaris |
| `/analytics` | Events d'analítica |

**Rutes `/cli/` (estudiants/clients):**

| Recurs | Operacions |
|---|---|
| `/search` | Cerca NL i avançada (via Typesense + IA gateway) |
| `/courses` | Consultar cursos públics |
| `/course-purchases` | Compra de cursos |
| `/gift-codes` | Codi de regal |
| `/payment-methods` | Mètodes de pagament (Stripe) |
| `/payments` | Pagaments + webhook Stripe |
| `/orders` | Historial de comandes |
| `/shopping-cart` | Cistella de la compra |
| `/course-reviews` | Ressenyes de cursos |
| `/favorite-courses` | Cursos favorits |
| `/course-progress` | Progrés de les lliçons |
| `/lecture-comments` | Comentaris per lliçó |
| `/notifications` | Notificacions de l'usuari |
| `/quizzes` | Participació en questionaris |

> Documentació Swagger disponible a `http://localhost:3000/docs`

#### B — Identity Service (Rust · Port 3001)

Gestió d'identitat, autenticació i sessions d'usuari.

**Rutes `/api/`:**

| Ruta | Mètode | Descripció |
|---|:---:|---|
| `/auth/register` | POST | Registre d'usuari nou |
| `/auth/login` | POST | Inici de sessió (retorna JWT + refresh token) |
| `/auth/logout` | POST | Tancament de sessió |
| `/auth/refresh` | POST | Renovació del token d'accés |
| `/auth/user` | GET | Perfil de l'usuari autenticat |
| `/auth/sessions` | GET | Llista de sessions actives |
| `/user/prefix` | GET | Cerca d'usuaris per prefix (mencions) |

**Rutes `/internal/` (S2S):**

| Ruta | Descripció |
|---|---|
| `/auth/claims` | Verificació i extracció de claims JWT entre serveis |

**Característiques:**
- Rotació de refresh tokens amb família d'IDs (prevenció de reutilització).
- Geolocalització per IP i detecció de tipus de dispositiu (User-Agent).
- Hash de contrasenyes amb BCrypt.
- Cache de tokens a Redis.

> Documentació Swagger disponible a `http://localhost:3001/docs`

#### C — Media Service (Rust · Asíncron via RabbitMQ)

Worker asíncron sense HTTP. Consumeix cues de RabbitMQ i processa contingut multimèdia.

| Capacitat | Tecnologia |
|---|---|
| Transcodificació de vídeo | GStreamer |
| Processament d'imatges (WebP, redimensionat) | image-rs |
| Extracció d'àudio | GStreamer |
| Generació de miniatures | GStreamer |
| Transcripció de veu a text | Whisper-rs (CUDA) |

**Flux:**
1. A Core Service puja fitxer → publica missatge a RabbitMQ.
2. C Media Service consumeix el missatge.
3. Processa (transcodifica, genera thumbnail, transcriu...).
4. Publica missatge de finalització → A Core Service actualitza metadades.

#### Gateway IA Search (Node.js · Port 3003)

Gateway d'IA amb estratègia de fallback automàtic entre proveïdors de LLM.

**Proveïdors suportats (round-robin amb failover):**

| Proveïdor | Notes |
|---|---|
| Groq | Alta velocitat d'inferència |
| Cerebras | Velocitat extrema |
| OpenRouter | Accés multi-model |
| Google Gemini | Multimodal |
| Mistral | Models europeus |
| Cohere | Especialitzat en cerca |

**Ruta:** `POST /generate` — processa consultes en NL i retorna resultats de Typesense millorats.

### 3.5. Frontend (React 19 · SPA)

| Ruta | Protegida | Descripció |
|---|:---:|---|
| `/` | No | Pàgina principal i descobriment |
| `/search` | No | Cerca avançada de cursos |
| `/watch/:courseSlug` | No | Previsualització del curs |
| `/login` | Redirecció | Inici de sessió |
| `/register` | Redirecció | Registre d'usuari |
| `/profile` | Sí | Gestió de perfil |
| `/settings/sessions` | Sí | Sessions actives |
| `/settings/payment-methods` | Sí | Mètodes de pagament |
| `/settings/billing` | Sí | Historial de facturació |
| `/play/:courseSlug` | Sí | Reproductor de curs |
| `/play/:courseSlug/:lectureSlug` | Sí | Lliçó específica |
| `/fav-courses` | Sí | Cursos favorits |
| `/library` | Sí | Biblioteca de cursos comprats |
| `/checkout` | Sí | Cistella i pagament |
| `/dashboard/courses` | Sí | Llistat de cursos del creador |
| `/dashboard/courses/:courseId` | Sí | Editor de curs |
| `/dashboard/analytics/:courseId` | Sí | Analítiques del curs |
| `/dashboard/video/:fileId` | Sí | Editor de vídeo/lliçó |
| `/dashboard/quizzes/:courseId/:quizId` | Sí | Editor de questionaris |

**Llibreries destacades:**

| Categoria | Llibreria |
|---|---|
| UI Components | Shadcn UI, Tailwind CSS |
| Formularis | React Hook Form + Zod |
| Dades | React Query, Axios |
| Editor de text | Lexical |
| Gràfics | Recharts |
| Vídeo | HLS.js + subtítols VTT |
| Drag & Drop | dnd-kit |
| Pagament | Stripe JS |
| Temes | next-themes |

### 3.6. Flux de dades: exemples

**Compra d'un curs:**
```
Usuari → cistella → checkout → Stripe → webhook → ordre creada → accés concedit → event ClickHouse
```

**Pujada i processament de vídeo:**
```
Creador puja vídeo → A Core Service → RabbitMQ → C Media Service → thumbnail + transcodificació + whisper → metadades actualitzades
```

**Cerca amb IA:**
```
Usuari escriu consulta NL → A Core Service /cli/search → Gateway IA → Typesense → resultats enriquits
```

### 3.7. Planificació (Diagrama de Gantt)

Fases del projecte:
1. Anàlisi i definició de requeriments.
2. Disseny funcional i tècnic (ER, casos d'ús, mockups).
3. Implementació de la infraestructura Docker i migracions.
4. Implementació de serveis backend (A, B, C, Gateway).
5. Implementació del frontend (SPA, pàgines, components).
6. Integració de pagaments, cerca IA i analítiques.
7. Proves, desplegament i documentació.

---

## 4. Implementació

### 4.1. Desplegament amb Docker

L'orquestració es fa amb dos fitxers Docker Compose:

| Fitxer | Propòsit |
|---|---|
| `docker-compose.yaml` | Stack complet: serveis + bases de dades |
| `docker-compose-databases.yaml` | Només bases de dades (per a dev local) |

**Persistència de dades (volums locals):**

```
./dbs/
├── postgres_data/       # Dades PostgreSQL
├── redis_data/          # Dades Redis
├── clickhouse/          # Dades i logs ClickHouse
├── rmq_data/            # Dades RabbitMQ
└── typesense-data/      # Índex Typesense
```

**Iniciar el projecte:**
```bash
# Stack complet
docker compose up -d

# Només bases de dades (per a dev local)
docker compose -f docker-compose-databases.yaml up -d
```

### 4.2. Variables d'entorn

Cada servei disposa del seu fitxer `.env`:

| Fitxer | Servei |
|---|---|
| `backend/A_core_service/.env.docker` | Core service |
| `backend/B_identity_service/.env.docker` | Identity service |
| `backend/gateway_IA_search/.env.docker` | Gateway IA |
| `frontend/.env.development` | Frontend |

### 4.3. Funcionalitats implementades

**Gestió d'usuaris:**
- Registre i autenticació amb JWT (access + refresh tokens).
- Sessions múltiples amb geolocalització.
- Gestió de perfil i avatar.

**Cursos i contingut:**
- Creació de cursos amb seccions i lliçons.
- Suport per a vídeos (HLS), documents, questionaris i laboratoris.
- Editor de text ric (Lexical) per a descripcions.
- Materials suplementaris per lliçó.
- Sistema d'etiquetes i categories.

**Descobriment i cerca:**
- Cerca de text complet amb Typesense.
- Consultes en llenguatge natural via Gateway IA.
- Filtrat per categoria, preu, valoració.
- Recomanacions personalitzades.

**Pagaments i compres:**
- Integració completa amb Stripe.
- Cistella de la compra.
- Codis de regal.
- Historial de comandes i facturació.
- Gestió de mètodes de pagament.

**Consum de contingut:**
- Reproductor de vídeo amb HLS.js i subtítols.
- Seguiment de progrés per lliçó.
- Comentaris per lliçó.
- Ressenyes de cursos.
- Cursos favorits.

**Dashboard de creadors:**
- Gestió de cursos, seccions i lliçons.
- Pujada de vídeos amb processament asíncron.
- Editor de questionaris.
- Analítiques: visualitzacions, progrés d'estudiants.
- Notificacions.

**Processament multimèdia:**
- Transcodificació de vídeo (GStreamer).
- Generació automàtica de miniatures.
- Transcripció de veu a text (Whisper amb CUDA).
- Optimització d'imatges (WebP).

---

## 5. Millores futures

| Prioritat | Millora |
|---|---|
| Alta | Recomanacions personalitzades amb IA basades en historial |
| Alta | Internacionalització (i18n) — castellà, anglès |
| Mitjana | Aplicació mòbil nativa (React Native) |
| Mitjana | Més analítica per creadors (embut de conversió, heatmaps) |
| Baixa | Integració amb certificacions externes |
| Baixa | Sistema de cursos en directe (streaming) |
| Baixa | Fòrum comunitari per curs |

---

## 6. Conclusions

### 6.1. Personals

El projecte ha permès consolidar competències en planificació de sistemes distribuïts, comunicació tècnica, resolució de problemes complexos i treball orientat a producte. La implementació de múltiples tecnologies en paral·lel (Go, Rust, Node.js, React) ha reforçat la capacitat d'adaptar-se a entorns políglottes.

### 6.2. Tècniques

A nivell tècnic, s'ha validat una arquitectura modular capaç de créixer, amb separació clara de responsabilitats entre:
- Serveis de negoci (A Core).
- Serveis d'identitat (B Identity).
- Workers asíncrons (C Media).
- Gateways especialitzats (IA Search).

La combinació de PostgreSQL per a dades transaccionals, ClickHouse per a analítiques i Typesense per a cerca demostra que una arquitectura poliglota de bases de dades és viable i eficient per a plataformes d'aquest tipus.

---

## 7. Referències bibliogràfiques

- [Documentació oficial de React](https://react.dev)
- [Documentació oficial de Go (Fiber)](https://gofiber.io)
- [Documentació oficial de Rust (Axum)](https://docs.rs/axum)
- [Documentació oficial de Docker](https://docs.docker.com)
- [Documentació oficial de Typesense](https://typesense.org/docs)
- [Documentació oficial de ClickHouse](https://clickhouse.com/docs)
- [Documentació oficial de Stripe](https://stripe.com/docs)
- [Documentació de Shadcn UI](https://ui.shadcn.com)
- [Material sobre ODS — Nacions Unides](https://sdgs.un.org)
- [Nielsen Norman Group — Principis d'usabilitat](https://www.nngroup.com)
