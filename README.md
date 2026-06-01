# ZenTask - Full-Stack Kanban Project Management System

ZenTask is a professional, enterprise-grade project management application designed to streamline team collaboration through an intuitive Kanban board interface. The system features secure user authentication, multi-language support (English/Vietnamese), dynamic column configurations, real-time data synchronization, real-time file attachments, and data-driven workspace analytics.

---

## 🚀 Tech Stack

### Backend
* **Core Framework**: Java 17, Spring Boot 3.x
* **Security & Auth**: Spring Security, JSON Web Token (JWT)
* **Data Access**: Spring Data JPA, Hibernate
* **Database**: Microsoft SQL Server
* **API Documentation**: Springdoc OpenAPI (Swagger UI)

### Frontend
* **Core Framework**: React 18 (Vite + TypeScript)
* **Styling**: Tailwind CSS
* **Data Fetching & State**: Axios, TanStack React Query
* **Data Visualization**: Recharts (Interactive Donut & Bar Charts)

---

## ✨ Key Features

* **Dynamic Agile Kanban Board**: Full CRUD capabilities for boards, task cards, and columns, featuring a highly adaptable "Done Column" state management system.
* **Secure File Attachment Service**: Isolated file upload and stream download capabilities, fully protected behind JWT security layers, completely preventing Jackson circular reference errors.
* **Workspace Analytics**: Live-updating operational dashboards displaying key metrics like total tasks, completion percentage, member counts, and distribution charts based on column and priority.
* **Enterprise Security Architecture**: Strict stateless token-based authorization blocking unauthenticated API access, alongside customized cross-origin resource sharing (CORS) configurations.

---

## 📂 Project Structure

```text
ZenTask/
├── database/
│   └── zentask_database.sql    # Complete SQL Server schema and mock data script
├── backend/                    # Spring Boot 3 Java application
│   ├── src/main/java/          # Core source code (Controllers, Services, Entities)
│   ├── src/main/resources/     # Application configurations and properties
│   └── pom.xml                 # Maven dependencies descriptor
└── frontend/                   # React TypeScript application
    ├── src/                    # UI Components (KanbanBoard, TaskModal, Charts)
    ├── package.json            # Node.js dependencies descriptor
    └── vite.config.ts          # Vite configuration layout
