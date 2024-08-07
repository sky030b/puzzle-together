CREATE TABLE players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT,
    nickname VARCHAR(255) NOT NULL UNIQUE,
    represent_color VARCHAR(10) NOT NULL,
    -- current_title INT,   not yet
    is_room_public TINYINT(1) DEFAULT 0 NOT NULL,
    profile TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    -- FOREIGN KEY (current_title) REFERENCES titles(id)   not yet
);

CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL UNIQUE,
    question_img_url VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    row_qty INT NOT NULL,
    col_qty INT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy',
    mode ENUM('cooperation', 'competition', 'relay') NOT NULL DEFAULT 'cooperation',
    is_public TINYINT(1) DEFAULT 0,
    is_open_when_owner_not_in TINYINT(1) DEFAULT 0 NOT NULL,
    -- last_start_time TIMESTAMP DEFAULT NULL,
    play_duration BIGINT DEFAULT 0 NOT NULL,
    is_completed TINYINT(1) DEFAULT 0 NOT NULL,
    completed_at TIMESTAMP DEFAULT NULL,
    -- completed_times INT NOT NULL DEFAULT 0,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE TABLE player_game (
    inviter_id VARCHAR(255) NOT NULL,
    invitee_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (invitee_id, game_id),
    FOREIGN KEY (inviter_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE puzzles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    puzzle_id VARCHAR(255) NOT NULL UNIQUE,
    game_id VARCHAR(255) NOT NULL,
    target_id INT NOT NULL,
    top_ratio DECIMAL(10, 3) NOT NULL,
    left_ratio DECIMAL(10, 3) NOT NULL,
    is_locked TINYINT(1) DEFAULT 0,
    locked_by VARCHAR(255) NULL,
    locked_color VARCHAR(7) DEFAULT NULL,
    locked_at TIMESTAMP DEFAULT NULL,
    z_index INT NOT NULL DEFAULT 3,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER before_puzzle_be_locked
BEFORE UPDATE ON puzzles
FOR EACH ROW
BEGIN
    IF NEW.is_locked != OLD.is_locked THEN
        SET NEW.locked_at = CURRENT_TIMESTAMP;
    END IF;
END;

//

DELIMITER ;

DELIMITER //

CREATE TRIGGER before_game_be_completed
BEFORE UPDATE ON games
FOR EACH ROW
BEGIN
    IF NEW.is_completed = 1 AND NEW.is_completed != OLD.is_completed THEN
        SET NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
END;

//

DELIMITER ;


CREATE TABLE anonymous_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal VARCHAR(255) NOT NULL
);


CREATE TABLE chat_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id VARCHAR(255) NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    message TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    content TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);


CREATE TABLE movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    puzzle_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    top_ratio DECIMAL(10, 3) NOT NULL,
    left_ratio DECIMAL(10, 3) NOT NULL,
    moved_color VARCHAR(7) DEFAULT NULL,
    moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(puzzle_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);


DROP TABLE movements;
DROP TABLE chat_logs;
DROP TABLE puzzles;
DROP TABLE player_game;
DROP TABLE games;
DROP TABLE players;


-- not yet

CREATE TABLE titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_name VARCHAR(255) NOT NULL,
    description TEXT
);


CREATE TABLE user_title (
    player_id VARCHAR(255) NOT NULL,
    title_id INT NOT NULL,
    PRIMARY KEY (player_id, title_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    content TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
