INSERT INTO player (username, password, email, total_chips) VALUES ('john_doe', 'password123', 'john@example.com', 5000);
INSERT INTO player (username, password, email, total_chips) VALUES ('jane_smith', 'janespassword', 'jane@example.com', 7500);
INSERT INTO player (username, password, email, total_chips) VALUES ('poker_king', 'king123', 'king@example.com', 10000);
INSERT INTO player (username, password, email, total_chips) VALUES ('all_in_gamer', 'allin123', 'allin@example.com', 2500);
INSERT INTO player (username, password, email, total_chips) VALUES ('bluff_master', 'bluff456', 'bluff@example.com', 8000);


INSERT INTO session (player_id, start_time, end_time) VALUES (1, '2023-07-26 12:00:00', '2023-07-26 14:30:00');
INSERT INTO session (player_id, start_time, end_time) VALUES (2, '2023-07-25 20:00:00', '2023-07-25 23:15:00');
INSERT INTO session (player_id, start_time, end_time) VALUES (3, '2023-07-24 15:30:00', '2023-07-24 17:00:00');
INSERT INTO session (player_id, start_time, end_time) VALUES (4, '2023-07-23 18:45:00', '2023-07-23 21:00:00');
INSERT INTO session (player_id, start_time, end_time) VALUES (5, '2023-07-22 11:00:00', '2023-07-22 13:45:00');


INSERT INTO hand (session_id, player_id, bet_amount, is_winner) VALUES (1, 1, 500, 1);
INSERT INTO hand (session_id, player_id, bet_amount, is_winner) VALUES (2, 2, 750, 0);
INSERT INTO hand (session_id, player_id, bet_amount, is_winner) VALUES (3, 3, 1000, 1);
INSERT INTO hand (session_id, player_id, bet_amount, is_winner) VALUES (4, 4, 200, 0);
INSERT INTO hand (session_id, player_id, bet_amount, is_winner) VALUES (5, 5, 300, 1);


INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', 'A', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', 'K', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', '2', 1);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', '3', 1);

INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', 'A', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', 'K', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'C', 'A', 1);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'C', 'K', 1);

INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'D', 'A', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'D', 'K', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', '2', 1);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', '3', 1);

INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'S', 'A', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'S', 'K', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', 'A', 1);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'H', 'K', 1);

INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'S', 'A', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'C', 'K', 0);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'C', '2', 1);
INSERT INTO card (hand_id, suit, rank, dealer_hand) VALUES (1, 'S', '3', 1);


