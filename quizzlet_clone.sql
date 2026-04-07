CREATE DATABASE IF NOT EXISTS quizzlet_clone;
USE quizzlet_clone;

-- drop database quizzlet_clone
-- ================= USERS =================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================= EMAIL OTP =================
CREATE TABLE email_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    type ENUM('REGISTER','FORGOT_PASSWORD') NOT NULL,
    status ENUM('PENDING','USED','EXPIRED') DEFAULT 'PENDING',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ================= REFRESH TOKEN =================
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= STUDY SET =================
CREATE TABLE study_sets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= FLASHCARDS =================
CREATE TABLE flashcards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_set_id BIGINT NOT NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    image_url TEXT,
    audio_url TEXT,
    position INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (study_set_id) REFERENCES study_sets(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= FAVORITES =================
CREATE TABLE favorites (
    user_id BIGINT NOT NULL,
    study_set_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, study_set_id),

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (study_set_id) REFERENCES study_sets(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= FOLDERS =================
CREATE TABLE folders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= FOLDER - STUDY SET =================
CREATE TABLE folder_study_sets (
    folder_id BIGINT NOT NULL,
    study_set_id BIGINT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (folder_id, study_set_id),

    FOREIGN KEY (folder_id) REFERENCES folders(id)
    ON DELETE CASCADE,

    FOREIGN KEY (study_set_id) REFERENCES study_sets(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= CLASSES =================
CREATE TABLE classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id BIGINT,

    FOREIGN KEY (owner_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

ALTER TABLE classes ADD invite_code VARCHAR(20) UNIQUE;
ALTER TABLE classes ADD created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE classes ADD updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ================= CLASS MEMBERS =================
CREATE TABLE class_members (
    class_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) DEFAULT 'STUDENT',

    PRIMARY KEY (class_id, user_id),

    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE class_members ADD joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE class_members ADD is_creator BOOLEAN DEFAULT FALSE;


-- ================= STUDY SET - CLASS =================
CREATE TABLE study_set_classes (
    study_set_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,

    PRIMARY KEY (study_set_id, class_id),

    FOREIGN KEY (study_set_id) REFERENCES study_sets(id)
    ON DELETE CASCADE,

    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= STUDY PROGRESS =================
CREATE TABLE study_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    flashcard_id BIGINT NOT NULL,

    status VARCHAR(20) DEFAULT 'NEW',
    memory_level INT DEFAULT 0,
    interval_days INT DEFAULT 1,

    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,

    last_review_at TIMESTAMP NULL,
    next_review_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
    ON DELETE CASCADE,

    UNIQUE (user_id, flashcard_id)
) ENGINE=InnoDB;

-- ================= STUDY SESSION =================
CREATE TABLE study_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    study_set_id BIGINT NOT NULL,
    mode VARCHAR(20) NOT NULL,

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,

    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (study_set_id) REFERENCES study_sets(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= STUDY SESSION DETAILS =================
CREATE TABLE study_session_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    flashcard_id BIGINT NOT NULL,

    question_type VARCHAR(20) NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,

    answered_at TIMESTAMP NULL,

    FOREIGN KEY (session_id) REFERENCES study_sessions(id)
    ON DELETE CASCADE,

    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= QUESTION OPTIONS =================
CREATE TABLE question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_detail_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (session_detail_id)
    REFERENCES study_session_details(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ================= ASSIGNMENTS =================
CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT NOT NULL,
    study_set_id BIGINT NOT NULL,
    assigned_by BIGINT,
    title VARCHAR(255),
    description TEXT,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (class_id) REFERENCES classes(id)
    ON DELETE CASCADE,

    FOREIGN KEY (study_set_id) REFERENCES study_sets(id)
    ON DELETE CASCADE,

    FOREIGN KEY (assigned_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- ================= ASSIGNMENT SUBMISSIONS =================
CREATE TABLE assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    status VARCHAR(20) DEFAULT 'NOT_STARTED',
    score INT,
    completed_at TIMESTAMP NULL,

    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    ON DELETE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

    UNIQUE (assignment_id, user_id)
) ENGINE=InnoDB;
-- ================= NOTIFICATIONS  =================
    CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,              -- người nhận thông báo

    title VARCHAR(255) NOT NULL,          -- tiêu đề
    content TEXT,                         -- nội dung

    type VARCHAR(50) NOT NULL,            -- loại thông báo
    is_read BOOLEAN DEFAULT FALSE,        -- đã đọc hay chưa

    reference_id BIGINT,                  -- id liên quan (class, assignment,...)
    reference_type VARCHAR(50),           -- CLASS / ASSIGNMENT / SYSTEM

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

