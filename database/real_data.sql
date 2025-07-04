-- Insert real ingredients
INSERT INTO ingredients (name, price, amount, unit) VALUES
('Chicken Breast', 8.99, 1, 'kg'),
('Olive Oil', 12.99, 1, 'liter'),
('Salt', 2.99, 1, 'kg'),
('Black Pepper', 4.99, 100, 'g'),
('Garlic', 3.99, 100, 'g'),
('Onion', 1.99, 1, 'kg'),
('Tomato', 3.99, 1, 'kg'),
('Basil', 2.99, 50, 'g'),
('Pasta', 2.49, 500, 'g'),
('Parmesan Cheese', 15.99, 200, 'g'),
('Butter', 4.99, 250, 'g'),
('Flour', 2.99, 1, 'kg'),
('Eggs', 4.99, 12, 'pieces'),
('Milk', 3.99, 1, 'liter'),
('Sugar', 2.49, 1, 'kg'),
('Rice', 3.99, 1, 'kg'),
('Carrot', 1.99, 1, 'kg'),
('Potato', 2.99, 1, 'kg'),
('Bell Pepper', 3.99, 1, 'kg'),
('Cucumber', 1.99, 1, 'kg');

-- Insert real foods with prices
INSERT INTO foods (name, price) VALUES
('Chicken Pasta Alfredo', 15.99),
('Margherita Pizza', 12.99),
('Caesar Salad', 8.99),
('Beef Stir Fry', 14.99),
('Vegetable Soup', 6.99),
('Grilled Salmon', 18.99),
('Chicken Curry', 13.99),
('Greek Salad', 9.99),
('Beef Burger', 11.99),
('Vegetable Lasagna', 12.99);

-- Create food-ingredient relationships
INSERT INTO food_ingredient (food_id, ingredient_id, quantity) VALUES
-- Chicken Pasta Alfredo
(1, 1, 0.3), -- Chicken Breast
(1, 9, 0.2), -- Pasta
(1, 10, 0.05), -- Parmesan Cheese
(1, 11, 0.05), -- Butter
(1, 12, 0.02), -- Flour
(1, 14, 0.2), -- Milk
(1, 3, 0.01), -- Salt
(1, 4, 0.01), -- Black Pepper

-- Margherita Pizza
(2, 7, 0.2), -- Tomato
(2, 8, 0.02), -- Basil
(2, 10, 0.1), -- Parmesan Cheese
(2, 12, 0.3), -- Flour
(2, 3, 0.01), -- Salt
(2, 2, 0.02), -- Olive Oil

-- Caesar Salad
(3, 1, 0.2), -- Chicken Breast
(3, 10, 0.05), -- Parmesan Cheese
(3, 2, 0.02), -- Olive Oil
(3, 3, 0.01), -- Salt
(3, 4, 0.01), -- Black Pepper

-- Beef Stir Fry
(4, 6, 0.2), -- Onion
(4, 7, 0.2), -- Tomato
(4, 17, 0.2), -- Carrot
(4, 19, 0.2), -- Bell Pepper
(4, 2, 0.03), -- Olive Oil
(4, 3, 0.01), -- Salt
(4, 4, 0.01), -- Black Pepper

-- Vegetable Soup
(5, 6, 0.2), -- Onion
(5, 7, 0.3), -- Tomato
(5, 17, 0.2), -- Carrot
(5, 18, 0.3), -- Potato
(5, 3, 0.01), -- Salt
(5, 4, 0.01), -- Black Pepper
(5, 8, 0.02); -- Basil

-- Insert sales data for 90% of foods (9 out of 10 foods)
-- Each food has 2-4 sales records with quantities between 1-3
-- Sales are distributed over the last two weeks
INSERT INTO sales (food_id, quantity, sold_at) VALUES
-- Chicken Pasta Alfredo (ID: 1)
(1, 2, datetime('now', '-2 days')),
(1, 1, datetime('now', '-5 days')),
(1, 3, datetime('now', '-8 days')),

-- Margherita Pizza (ID: 2)
(2, 3, datetime('now', '-1 day')),
(2, 2, datetime('now', '-4 days')),
(2, 1, datetime('now', '-10 days')),

-- Caesar Salad (ID: 3)
(3, 1, datetime('now', '-3 days')),
(3, 2, datetime('now', '-7 days')),
(3, 2, datetime('now', '-12 days')),

-- Beef Stir Fry (ID: 4)
(4, 3, datetime('now', '-2 days')),
(4, 2, datetime('now', '-6 days')),
(4, 1, datetime('now', '-9 days')),

-- Vegetable Soup (ID: 5)
(5, 1, datetime('now', '-4 days')),
(5, 2, datetime('now', '-8 days')),
(5, 3, datetime('now', '-11 days')),

-- Grilled Salmon (ID: 6)
(6, 2, datetime('now', '-3 days')),
(6, 1, datetime('now', '-7 days')),
(6, 2, datetime('now', '-13 days')),

-- Chicken Curry (ID: 7)
(7, 3, datetime('now', '-1 day')),
(7, 2, datetime('now', '-5 days')),
(7, 1, datetime('now', '-10 days')),

-- Greek Salad (ID: 8)
(8, 1, datetime('now', '-2 days')),
(8, 2, datetime('now', '-6 days')),
(8, 3, datetime('now', '-9 days')),

-- Beef Burger (ID: 9)
(9, 2, datetime('now', '-4 days')),
(9, 3, datetime('now', '-8 days')),
(9, 1, datetime('now', '-12 days')); 