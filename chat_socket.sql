USE socket_chat;

CREATE TABLE user (
	id INT NOT NULL AUTO_INCREMENT,
    nickname NVARCHAR(60) UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    user_key VARCHAR(250) NOT NULL UNIQUE,
    avatar VARCHAR(250),
    created_at DATETIME,
    updated_at DATETIME,
    
    PRIMARY KEY (id)
);

CREATE TABLE room (
	id INT NOT NULL AUTO_INCREMENT,
    room_key VARCHAR(250) NOT NULL UNIQUE,
    creator INT NOT NULL UNIQUE,
    thumbnail VARCHAR(250),
    created_at DATETIME,
    updated_at DATETIME,
    
    PRIMARY KEY (id)
);

CREATE TABLE message (
	id INT NOT NULL AUTO_INCREMENT,
    message TEXT NOT NULL,
    deleted BOOLEAN DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    
    PRIMARY KEY (id)
);

CREATE TABLE message_room (
	id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    message_id INT NOT NULL UNIQUE,
    
    PRIMARY KEY (id)
);

CREATE TABLE message_user (
	id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
	message_id INT NOT NULL UNIQUE,
	
    PRIMARY KEY (id)
);

CREATE TABLE room_user (
	id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    room_id INT NOT NULL UNIQUE,
	
    PRIMARY KEY (id)
);

