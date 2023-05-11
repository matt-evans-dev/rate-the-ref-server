// SPORTS // 
INSERT INTO sports
VALUES (
  '8yxxrsg1hqc4yhd',
  'Basketball',
  'https://thumbs.dreamstime.com/b/basketball-new-isolated-white-background-88170592.jpg'
);

INSERT INTO sports
VALUES (
  '15jx544dy6n9lwn',
  'Soccer',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuRK4GJLQOuZ8dVlV7PSn13Ue_GjdvhnbgOPR2jMSIdFDe8pROxg&s'
);

INSERT INTO sports
VALUES (
  'inrzhcpxs5qyq9y',
  'Football',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVTRn6jLwF7RkkFGKwT_IqMP-e4SfbpcQYpCR59mlc4FKwDXxL&s'
);

// LEAGUES // 
INSERT INTO leagues
VALUES (
  'bcztfmef5jx9x1l',
  '8yxxrsg1hqc4yhd',
  'NBA',
  'https://tinyurl.com/ugyh473'
);

INSERT INTO leagues
VALUES (
  '06k6vxb4j8jotk8',
  '15jx544dy6n9lwn',
  'MLS',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTupwqo4GbdKtqYR0Dbq4qS4B8QVcyi69aaoBTSf7skz7dlDNGj1w&s'
);

INSERT INTO leagues
VALUES (
  'kp2git0orzkjfz0',
  'inrzhcpxs5qyq9y',
  'NFL',
  'https://files.grizly.com/storage/Quiz/4136/Screen-Shot-2018-01-16-at-1.39.14-PM.jpg'
);


// CONFERENCES // 
INSERT INTO conferences
VALUES (
  'm0b15c0qajylsrk',
  '8yxxrsg1hqc4yhd',
  'bcztfmef5jx9x1l',
  'Western Conference',
  'https://lh3.googleusercontent.com/-sCGayWk7h-WTGY9BzuvBvLby-US6EUgd3GiFX1mo9O1VdF_A0zESecN4YmYDPWK90LqRQ=s85'
);

INSERT INTO conferences
VALUES (
  's3nvvvnsmpsx7t3',
  '8yxxrsg1hqc4yhd',
  'bcztfmef5jx9x1l',
  'Eastern Conference',
  'https://lh3.googleusercontent.com/Izdlam_E8-u6vkYEavP1CnVOEo2wfqID5sBpebwzwp1Be_3ZLzCP_T0QuqRk-Vgt1ZJuew=s85'
);


INSERT INTO conferences
VALUES (
  '8kkseirqgmwn2i6',
  '15jx544dy6n9lwn',
  '06k6vxb4j8jotk8',
  'Western Conference',
  'https://lh3.googleusercontent.com/1PF1JVPzx3u-YQuF0IbwzUbgTjYDdFCRyqDiztUdUYJ7cez3U8ktUa6G0uopqhbUU94PCA=s104'
);


INSERT INTO conferences
VALUES (
  'qh93nu7aenicuro',
  '15jx544dy6n9lwn',
  '06k6vxb4j8jotk8',
  'Eastern Conference',
  'https://lh3.googleusercontent.com/YxJ_qgaA-y7Q9kBHFmNKY8vKDNRiD7c2C4yeR6eqZ0yGCHc2Af-WPHqaT_Q8Oti5Js41ZyA=s85'
);

INSERT INTO conferences
VALUES (
  'p997j9d2m6en9k8',
  'inrzhcpxs5qyq9y',
  'kp2git0orzkjfz0',
  'American Football Conference',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/American_Football_Conference_logo.svg/1200px-American_Football_Conference_logo.svg.png'
);

INSERT INTO conferences
VALUES (
  'huxlqhye9c9n96s',
  'inrzhcpxs5qyq9y',
  'kp2git0orzkjfz0',
  'National Football Conference',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/National_Football_Conference_logo.svg/1200px-National_Football_Conference_logo.svg.png'
);


// TEAMS // 
INSERT INTO teams
VALUES (
  'le67tj5rp74cr1q',
  '8yxxrsg1hqc4yhd',
  'bcztfmef5jx9x1l',
  'm0b15c0qajylsrk',
  'Lakers',
  'https://lh3.googleusercontent.com/uNFEhOcpLE7r6iHfK-XYn0eUl3Gh9WEnUNdI-_pJUG0KrgvhWF026tpneu9pO7hO7wnOxDo=s85',
  'Los Angeles',
  'CA',
  'LA'
);

INSERT INTO teams
VALUES (
  'wtrzhuy5z3j9clh',
  '8yxxrsg1hqc4yhd',
  'bcztfmef5jx9x1l',
  'm0b15c0qajylsrk',
  'Thunder',
  'https://lh3.googleusercontent.com/2-1Q2vJLcR0cQeRIYxZ-6z7yqJ5fq-9SgfUfyeYYKfx35TAhNGMV8HufdpuyyD_oseyR=s85',
  'Oklahoma City',
  'OK',
  'OKC'
);

INSERT INTO teams
VALUES (
  'ee8nimuc5zp5pf5',
  '15jx544dy6n9lwn',
  '06k6vxb4j8jotk8',
  '8kkseirqgmwn2i6',
  'Los Angeles Football Club',
  'https://lh3.googleusercontent.com/6dEiavCnt9lqruxalr1GdRnvzjaTV5z8hCm_9_vnD11prEg-5KxWc_UZFNwzSSrP_Fzvsw=s85',
  'Los Angeles',
  'CA',
  'LA'
);

// GAMES // 
INSERT INTO games
VALUES (
  'x9m018q3fbbiwel',
  '8yxxrsg1hqc4yhd',
  'bcztfmef5jx9x1l',
  'm0b15c0qajylsrk',
  'm0b15c0qajylsrk',
  'le67tj5rp74cr1q',
  'wtrzhuy5z3j9clh',
  '{"1", "2"}',
  // get date object
);
