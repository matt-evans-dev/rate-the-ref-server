CREATE TABLE sports (
  id int PRIMARY KEY,
  sport_name varchar(100) NOT NULL UNIQUE,
  sport_logo varchar(1000) NOT NULL,
  sport_espn_slug varchar(100) NOT NULL UNIQUE
);

CREATE TABLE leagues (
  id int PRIMARY KEY,
  sport_id int REFERENCES sports(id) NOT NULL,
  league_name varchar(100) NOT NULL UNIQUE,
  league_abbreviation varchar(100) NOT NULL UNIQUE,
  league_logo varchar(1000) NOT NULL,
  league_espn_slug varchar(100) NOT NULL UNIQUE
);

CREATE TABLE conferences (
  id varchar(100) PRIMARY KEY,
  sport_id int REFERENCES sports(id) NOT NULL,
  league_id int REFERENCES leagues(id) NOT NULL,
  conference_name varchar(100) NOT NULL,
  conference_abbreviation varchar(100),
  conference_logo varchar(1000)
);

CREATE TABLE referee_roles (
  id int PRIMARY KEY,
  referee_role_name varchar(100) NOT NULL
);

CREATE TABLE teams (
  id varchar(100) PRIMARY KEY,
  espn_id int NOT NULL,
  sport_id int REFERENCES sports(id) NOT NULL,
  league_id int REFERENCES leagues(id) NOT NULL,
  conference_id varchar(100) REFERENCES conferences(id) NOT NULL,
  team_name varchar(100) NOT NULL,
  team_display_name varchar(100) NOT NULL,
  team_logo varchar(1000) NOT NULL,
  city varchar(100),
  state varchar(100),
  city_nickname varchar(100),
  team_espn_slug varchar(100) NOT NULL
);

// Add venue_id, tournament_id, and conference_ref_id?
//Storing referee info?
CREATE TABLE schedule (
  id varchar(100) PRIMARY KEY,
  sport_id int REFERENCES sports(id) NOT NULL,
  league_id int REFERENCES leagues(id) NOT NULL,
  home_team_conference_id varchar(100) REFERENCES conferences(id) NOT NULL,
  opponent_conference_id varchar(100) REFERENCES conferences(id) NOT NULL,
  home_team_id int REFERENCES teams(id) NOT NULL,
  opponent_id int REFERENCES teams(id) NOT NULL,
  referees jsonb[],
  start_time timestamptz NOT NULL
);

CREATE TABLE users (
  id varchar(100) PRIMARY KEY,
  first_name varchar(100),
  last_name varchar(100),
  email varchar(100) NOT NULL UNIQUE,
  display_name varchar(100) NOT NULL UNIQUE,
  profile_picture varchar(1000),
  state varchar(100),
  zip_code varchar(100),
  created_on timestamp NOT NULL,
  modified_on timestamp
);

CREATE TABLE users_favorite_teams (
  id varchar(100) PRIMARY KEY,
  user_id varchar(100) REFERENCES users(id) NOT NULL,
  team_id int REFERENCES teams(id) NOT NULL
);

CREATE TABLE users_favorite_schedule (
  id varchar(100) PRIMARY KEY,
  user_id varchar(100) REFERENCES users(id) NOT NULL,
  schedule_id varchar(100) REFERENCES schedule(id) NOT NULL
);

CREATE TABLE users_favorite_leagues (
  id varchar(100) PRIMARY KEY,
  user_id varchar(100) REFERENCES users(id) NOT NULL,
  league_id int REFERENCES leagues(id) NOT NULL
);

// Venue table?
// Tournament table?

CREATE TABLE venue  (
  id varchar(100) PRIMARY KEY,
  venue_name varchar(100) UNIQUE,
  venue_city varchar(100),
  venue_state varchar(100)
)

CREATE TABLE referees (
  id int PRIMARY KEY,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL
);

// Add tournament_id?
// Character limit on answers?
CREATE TABLE ratings (
  id varchar(100) PRIMARY KEY,
  schedule_id varchar(100) REFERENCES schedule(id) NOT NULL,
  sport_id int REFERENCES sports(id) NOT NULL,
  league_id int REFERENCES leagues(id) NOT NULL,
  conference_id varchar(100) REFERENCES conferences(id) NOT NULL,
  user_id varchar(100) REFERENCES users(id) NOT NULL,
  home_team_id int REFERENCES teams(id) NOT NULL,
  opponent_id int REFERENCES teams(id) NOT NULL,
  overall_performance int NOT NULL,
  answer_1 varchar(1000),
  answer_2 varchar(1000),
  answer_3 varchar(1000),
  timestamp timestamptz NOT NULL,
);

ALTER TABLE teams
ADD color varchar(256);

ALTER TABLE teams
ADD alternate_color varchar(256);

ALTER TABLE teams
	ADD COLUMN venue_id varchar(100) REFERENCES venue(id)

ALTER TABLE teams
  ADD CONSTRAINT uq_espn_id_league UNIQUE(espn_id, league_id);

ALTER TABLE referees
  ADD CONSTRAINT uq_f_name_l_name UNIQUE(first_name, last_name);

ALTER TABLE schedule ALTER COLUMN referees TYPE jsonb USING referees[0]::jsonb;
