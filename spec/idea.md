arment Builder App – Deterministic Specification
1. Requirements

Web-based application (desktop-first, mobile-responsive).

User can:

Select garment type (shirt, saree, lehenga, kurti, blouse, dress).

Customize design via drag-and-drop toolbar (neck, sleeves, hem, fitting).

Add embellishments (lace, aari, zari, borders).

Upload fabric or select from fabric catalog.

Assign fabric to top/bottom parts.

Preview garment as:

2D AI-generated mockup (front and back view).

3D mannequin with fabric texture mapping (basic, not physics-based).

Save, export (PNG/PDF), and share designs.

Roles: Consumer, Designer, Fabric Retailer, Admin.

2. UI Components (React + Next.js + TailwindCSS)
Screens

Landing Page

Buttons: [Login] [Register] [Continue as Guest] [Start Garment Builder]

Garment Builder (Main Workspace)

Left Toolbar (Design Options)

Neckline (Round, V, Boat, Square, Collar, Keyhole)

Sleeves (Sleeveless, Half, Full, Bell, Puff)

Hem (Straight, Flared, Layered, Pleated)

Fit (Slim, Regular, Loose)

Embellishments: [Aari Work] [Zari] [Lace] [Sequins] [Borders]

Top Bar

Save | Preview (2D) | Preview (3D) | Export | Share

Canvas Area

Placeholder garment silhouette with drag-and-drop slots

Right Panel (Fabric Selection)

Upload Fabric (JPG/PNG max 5MB, 1024×1024)

Global Catalog (filters: Fabric Type, Pattern, Color)

Apply fabric to section (top, bottom, sleeves)

Preview Modal

Tabs: [2D Mockup] [3D Preview]

2D Mockup → AI-generated front & back

3D Preview → Interactive mannequin (rotate/zoom)

Profile & Saved Designs

List of designs with thumbnails, export/share buttons

3. Backend Services (FastAPI + PostgreSQL + Redis + S3)
Services

Auth Service

JWT authentication

Role-based access

Fabric Service

Upload fabric swatch (stored in S3)

Fetch catalog with filters

Garment Service

Save design (JSON + fabric IDs + embellishments)

Retrieve user designs

AI Service

Generate 2D mockup (Stable Diffusion + ControlNet)

Return image URL

3D Service

Apply fabric texture to mannequin UV map

Return rendered snapshot + interactive glTF

Job Queue Service

Celery + Redis for AI render jobs

4. Database Schema (PostgreSQL)
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(256),
    role VARCHAR(20) CHECK (role IN ('consumer','designer','retailer','admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fabrics
CREATE TABLE fabrics (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50), -- cotton, silk, etc.
    pattern_tags TEXT[], -- floral, stripes, plain
    image_url TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Garments
CREATE TABLE garments (
    id UUID PRIMARY KEY,
    type VARCHAR(50), -- saree, lehenga, shirt, etc.
    fit VARCHAR(20),
    design_json JSONB, -- neck, sleeve, hem config
    fabric_top_id UUID REFERENCES fabrics(id),
    fabric_bottom_id UUID REFERENCES fabrics(id),
    embellishments_json JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Jobs
CREATE TABLE ai_jobs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    garment_id UUID REFERENCES garments(id),
    job_type VARCHAR(20) CHECK (job_type IN ('2D_mockup','3D_texture')),
    status VARCHAR(20) CHECK (status IN ('queued','running','complete','failed')),
    result_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

5. APIs (FastAPI)
Auth

POST /auth/register {name, email, password}

POST /auth/login {email, password} → {token}

GET /auth/me

Fabric

POST /fabric/upload {file} → {fabric_id, url}

GET /fabric/catalog?type=silk&pattern=floral

GET /fabric/{id}

Garment

POST /garment/create {type, fit, design_json, fabric_top_id, fabric_bottom_id, embellishments_json}

GET /garment/{id}

GET /garment/user/{id}

AI Jobs

POST /ai/mockup {garment_id} → {job_id}

POST /ai/texture {garment_id} → {job_id}

GET /ai/job/{id} → {status, result_url}

6. AI Pipeline

Model: Stable Diffusion XL (or SD 1.5 with ControlNet)

Input Prompt: Auto-generated from garment JSON

Prompt Example:

A front view of a women's lehenga with a V-neck blouse, half sleeves, flared hem. The fabric is silk with floral patterns. Add golden zari border and aari work embroidery.


Conditioning:

Use ControlNet with garment silhouette as mask.

Use IP-Adapter for fabric texture injection.

Output: 1024×1024 PNG front/back mockups

7. 3D Preview Implementation

Framework: Three.js + React-Three-Fiber

Model: Pre-rigged female/male mannequin in .glTF format

Texture Mapping:

Apply fabric swatch as repeating UV texture

User can scale/rotate fabric pattern

Controls:

OrbitControls for rotate/zoom

Directional + ambient light

8. Deployment Environment

Infra: AWS

EC2 for backend

S3 for fabrics & renders

RDS PostgreSQL

ElastiCache Redis for Celery

Containerization: Docker + Kubernetes

CI/CD: GitHub Actions → deploy to AWS EKS

9. Sprint Breakdown (Jira-Style Tickets)
Sprint 1 – Foundations

Setup repo (frontend, backend, AI, 3D as separate services)

Setup PostgreSQL schema

Setup Auth (JWT)

Setup Fabric upload + catalog

Sprint 2 – Garment Builder UI

Build drag-and-drop design toolbar (neck, sleeves, hem)

Build fabric selection panel (upload + catalog)

Build canvas placeholder

Sprint 3 – AI Integration

Implement AI service (SDXL + ControlNet)

Build job queue with Celery + Redis

Connect frontend “Preview 2D” → AI API

Sprint 4 – 3D Viewer

Load mannequin glTF into Three.js

Implement texture mapping of fabric

Add rotate/zoom controls

Sprint 5 – Embellishments

Add drag-and-drop aari, zari, lace overlays (as SVG/texture layers)

Update AI prompts to include embellishments

Sprint 6 – Export & Share

Export PNG/PDF

Generate shareable design links

Save user design history

10. Non-Functional Requirements

Performance: 2D mockup render < 20 sec, 3D preview < 1 sec

Scalability: Horizontal scaling via Kubernetes

Security:

JWT auth

S3 signed URLs for private fabric storage

Logging/Monitoring: ELK stack (ElasticSearch, Logstash, Kibana)
