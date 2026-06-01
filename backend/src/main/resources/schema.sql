-- ============================================================
-- ZenTask - Team Collaboration & Project Management System
-- SQL Server Database Schema (FIXED MULTIPLE CASCADE PATHS)
-- ============================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ZenTaskDB')
BEGIN
    CREATE DATABASE ZenTaskDB;
END
GO

USE ZenTaskDB;
GO

-- 1. USERS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
CREATE TABLE Users (
                       id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                       email       NVARCHAR(255) NOT NULL,
                       password    NVARCHAR(255),
                       full_name   NVARCHAR(255) NOT NULL,
                       avatar      NVARCHAR(500),
                       provider    NVARCHAR(50)  DEFAULT 'local',
                       created_at  DATETIME2     DEFAULT GETDATE(),
                       updated_at  DATETIME2     DEFAULT GETDATE(),
                       CONSTRAINT UQ_Users_Email UNIQUE (email)
);
END
GO

-- 2. WORKSPACE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Workspace')
BEGIN
CREATE TABLE Workspace (
                           id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                           name        NVARCHAR(255) NOT NULL,
                           description NVARCHAR(MAX),
                           owner_id    BIGINT NOT NULL,
                           created_at  DATETIME2 DEFAULT GETDATE(),
                           updated_at  DATETIME2 DEFAULT GETDATE(),
                           CONSTRAINT FK_Workspace_Owner FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE
);
END
GO

-- 3. WORKSPACE_MEMBERS (FIXED: Changed User FK to ON DELETE NO ACTION)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Workspace_Members')
BEGIN
CREATE TABLE Workspace_Members (
                                   workspace_id BIGINT NOT NULL,
                                   user_id      BIGINT NOT NULL,
                                   role         NVARCHAR(20) NOT NULL DEFAULT 'MEMBER',
                                   joined_at    DATETIME2 DEFAULT GETDATE(),

                                   CONSTRAINT PK_Workspace_Members PRIMARY KEY (workspace_id, user_id),
                                   CONSTRAINT FK_WM_Workspace FOREIGN KEY (workspace_id) REFERENCES Workspace(id) ON DELETE CASCADE,
                                   CONSTRAINT FK_WM_User      FOREIGN KEY (user_id)      REFERENCES Users(id)      ON DELETE NO ACTION, -- Sửa tại đây
                                   CONSTRAINT CK_WM_Role CHECK (role IN ('ADMIN', 'MEMBER'))
);
END
GO

-- 4. BOARD
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Board')
BEGIN
CREATE TABLE Board (
                       id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                       workspace_id BIGINT NOT NULL,
                       title       NVARCHAR(255) NOT NULL,
                       created_at  DATETIME2 DEFAULT GETDATE(),
                       updated_at  DATETIME2 DEFAULT GETDATE(),
                       CONSTRAINT FK_Board_Workspace FOREIGN KEY (workspace_id) REFERENCES Workspace(id) ON DELETE CASCADE
);
END
GO

-- 5. TASK_COLUMN
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Task_Column')
BEGIN
CREATE TABLE Task_Column (
                             id             BIGINT IDENTITY(1,1) PRIMARY KEY,
                             board_id       BIGINT NOT NULL,
                             name           NVARCHAR(255) NOT NULL,
                             position_index INT NOT NULL DEFAULT 0,
                             created_at     DATETIME2 DEFAULT GETDATE(),
                             updated_at     DATETIME2 DEFAULT GETDATE(),
                             CONSTRAINT FK_TC_Board FOREIGN KEY (board_id) REFERENCES Board(id) ON DELETE CASCADE
);
END
GO

-- 6. TASK (FIXED: Changed Assignee FK to ON DELETE NO ACTION)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Task')
BEGIN
CREATE TABLE Task (
                      id             BIGINT IDENTITY(1,1) PRIMARY KEY,
                      column_id      BIGINT NOT NULL,
                      title          NVARCHAR(255) NOT NULL,
                      description    NVARCHAR(MAX),
                      priority       NVARCHAR(20)  DEFAULT 'MEDIUM',
                      deadline       DATETIME2,
                      assignee_id    BIGINT,
                      position_index INT NOT NULL DEFAULT 0,
                      created_at     DATETIME2 DEFAULT GETDATE(),
                      updated_at     DATETIME2 DEFAULT GETDATE(),

                      CONSTRAINT FK_Task_Column   FOREIGN KEY (column_id)   REFERENCES Task_Column(id) ON DELETE CASCADE,
                      CONSTRAINT FK_Task_Assignee FOREIGN KEY (assignee_id) REFERENCES Users(id)       ON DELETE NO ACTION, -- Sửa tại đây
                      CONSTRAINT CK_Task_Priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);
END
GO

-- 7. COMMENT
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Comment')
BEGIN
CREATE TABLE Comment (
                         id         BIGINT IDENTITY(1,1) PRIMARY KEY,
                         task_id    BIGINT NOT NULL,
                         user_id    BIGINT NOT NULL,
                         content    NVARCHAR(MAX) NOT NULL,
                         created_at DATETIME2 DEFAULT GETDATE(),

                         CONSTRAINT FK_Comment_Task FOREIGN KEY (task_id) REFERENCES Task(id) ON DELETE CASCADE,
                         CONSTRAINT FK_Comment_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION -- Sửa tại đây
);
END
GO

-- 8. ATTACHMENT
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Attachment')
BEGIN
CREATE TABLE Attachment (
                            id          BIGINT IDENTITY(1,1) PRIMARY KEY,
                            task_id     BIGINT NOT NULL,
                            file_url    NVARCHAR(MAX) NOT NULL,
                            file_name   NVARCHAR(255),
                            uploaded_by BIGINT NOT NULL,
                            created_at  DATETIME2 DEFAULT GETDATE(),

                            CONSTRAINT FK_Attachment_Task FOREIGN KEY (task_id)     REFERENCES Task(id) ON DELETE CASCADE,
                            CONSTRAINT FK_Attachment_User FOREIGN KEY (uploaded_by) REFERENCES Users(id) ON DELETE NO ACTION -- Sửa tại đây
);
END
GO

-- 9. ACTIVITY_LOG
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ActivityLog')
BEGIN
CREATE TABLE ActivityLog (
                             id            BIGINT IDENTITY(1,1) PRIMARY KEY,
                             workspace_id  BIGINT NOT NULL,
                             user_id       BIGINT NOT NULL,
                             action        NVARCHAR(255) NOT NULL,
                             target_entity NVARCHAR(255) NOT NULL,
                             target_id     BIGINT,
                             details       NVARCHAR(MAX),
                             created_at    DATETIME2 DEFAULT GETDATE(),

                             CONSTRAINT FK_AL_Workspace FOREIGN KEY (workspace_id) REFERENCES Workspace(id) ON DELETE CASCADE,
                             CONSTRAINT FK_AL_User      FOREIGN KEY (user_id)      REFERENCES Users(id)      ON DELETE NO ACTION -- Sửa tại đây
);
END
GO

-- ============================================================
-- INDEXES (Giữ nguyên tối ưu)
-- ============================================================
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Workspace_Owner ON Workspace(owner_id);
CREATE INDEX IX_WM_UserId ON Workspace_Members(user_id);
CREATE INDEX IX_Board_Workspace ON Board(workspace_id);
CREATE INDEX IX_TC_Board ON Task_Column(board_id);
CREATE INDEX IX_Task_Column     ON Task(column_id);
CREATE INDEX IX_Task_Assignee   ON Task(assignee_id);
CREATE INDEX IX_Task_Priority   ON Task(priority);
CREATE INDEX IX_Task_Deadline   ON Task(deadline);
CREATE INDEX IX_Comment_Task ON Comment(task_id);
CREATE INDEX IX_Comment_User ON Comment(user_id);
CREATE INDEX IX_Attachment_Task ON Attachment(task_id);
CREATE INDEX IX_AL_Workspace ON ActivityLog(workspace_id);
CREATE INDEX IX_AL_User      ON ActivityLog(user_id);
CREATE INDEX IX_AL_CreatedAt ON ActivityLog(created_at);
GO