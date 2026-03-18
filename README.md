# 🛋️ RoomVis

A web-based furniture room designer application developed as part of the PUSL3122 HCI, Computer Graphics and Visualisation module at Plymouth University Sri Lanka.

## 📌 Overview
RoomVis allows designers and customers to visualise how furniture items would look in a room. Users can create room layouts in 2D, convert them to a realistic 3D view, customise colours and shading, and save their designs for future use.

## 🔗 Project Links
- 🎨 Figma UI Design: https://www.figma.com/design/ebJiwM8lyOoqWNlUFTkVjc/RoomVis?node-id=0-1&p=f&t=dxCHzi8inwd80vOw-0
- 📄 Report: *To be added*
- 🎥 Video Presentation: *To be added*

## 👥 Group Members & Roles

| Name | Student ID | Role |
|------|------------|------|
| Bethmage Perera | 10952829 | Project Lead — HomePage, Login, Register (User Auth) |
| Dasanayaka Seneviratne | 10953043 | 2D Room Setup — EditorPage 2D Module |
| Konara Bandara | 10952449 | 3D Visualisation Expert — EditorPage 3D Module |
| Mudiyanselage Herath | 10952432 | Interaction Designer (HCI) — Property Panels, Undo/Redo |
| Thennakoon Thennakoon | 10953085 | Portfolio & Template Manager — MyDesignsPage |
| Jothikalananthan Janusha | 10952971 | Admin Inventory & Store — AdminPage, StorePage |

## 🛠️ Tech Stack

### 💻 Frontend
- **Framework:** React (v19) + Vite
- **3D Engine:** Three.js + React-Three-Fiber + React-Three-Drei
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Routing:** React Router (v7)
- **HTTP Client:** Axios

### ⚙️ Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Auth:** JWT + Bcryptjs
- **API:** RESTful

### 🗄️ Database
- **Database:** MongoDB (NoSQL)
- **ODM:** Mongoose

### 🛠️ Utilities
- **Image Processing:** html-to-image
- **3D Models:** GLTF/GLB loader

## 🚀 Features
- Secure user login and registration (JWT-based)
- Admin and regular user account types
- Room setup — define width, depth, and shape (Rectangle / L-Shape)
- 2D top-down floor plan layout
- 3D perspective visualisation with realistic lighting and shadows
- Furniture scaling, rotation, and colour customisation
- Undo/Redo (20-step history) with keyboard shortcuts
- Toast notifications and system feedback
- Save, rename, edit and delete designs
- Admin furniture inventory management
- Furniture catalog with product details and category filtering
- Template system (Admin official templates + user private designs)

## 📁 Project Structure
```
RoomVis/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/   # HomePage, LoginPage, RegisterPage, EditorPage, etc.
│   │   ├── components/
│   │   └── context/
├── server/          # Node.js + Express backend
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   └── middleware/
├── docs/            # Report, wireframes, design documents
└── README.md
```

## 📦 External Resources
*All external 3D models, assets, and libraries will be credited here as development progresses.*

## 📅 Submission Deadline
19th March 2026 — PUSL3122 Plymouth University Sri Lanka
