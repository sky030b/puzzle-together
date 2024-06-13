CREATE TABLE players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT,
    nickname VARCHAR(255) NOT NULL UNIQUE,
    color_code VARCHAR(10) NOT NULL,
    -- current_title INT,   not yet
    is_room_public TINYINT(1) DEFAULT 0,
    games_played INT DEFAULT 0,
    games_completed INT DEFAULT 0,
    profile_description TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- FOREIGN KEY (current_title) REFERENCES titles(id)   not yet
);

CREATE TABLE games (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL UNIQUE,
    question_img_url VARCHAR(255) NOT NULL UNIQUE,
    owner_id VARCHAR(255) NOT NULL,
    img_width INT NOT NULL,
    img_height INT NOT NULL,
    scale DECIMAL(10, 3),
    row_qty INT NOT NULL,
    col_qty INT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy',
    is_public TINYINT(1) DEFAULT 0,
    is_open_when_owner_not_in TINYINT(1) DEFAULT 0,
    play_duration BIGINT DEFAULT 1,
    is_done TINYINT(1) DEFAULT 0,
    played_times INT NOT NULL DEFAULT 0,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES players(player_id)
);

CREATE TABLE player_game (
    player_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (player_id, game_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

CREATE TABLE puzzles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    puzzle_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    target_id INT NOT NULL,
    top_position DECIMAL(10, 3) NOT NULL,
    left_position DECIMAL(10, 3) NOT NULL,
    height DECIMAL(10, 3) NOT NULL,
    width DECIMAL(10, 3) NOT NULL,
    locked TINYINT(1) DEFAULT 0,
    locked_by VARCHAR(255) NULL,
    locked_at TIMESTAMP DEFAULT NULL,
    locked_color VARCHAR(7) DEFAULT NULL,
    z_index INT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

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
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (title_id) REFERENCES titles(id)
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(255) NOT NULL,
    media VARCHAR(255),
    content TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    content TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    puzzle_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    top_position DECIMAL(10, 3) NOT NULL,
    left_position DECIMAL(10, 3) NOT NULL,
    moved_by VARCHAR(255) NOT NULL,
    moved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(puzzle_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id),
    FOREIGN KEY (moved_by) REFERENCES players(player_id)
);

CREATE TABLE chat_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    game_id VARCHAR(255) NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    message TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);
