SET NOCOUNT ON;

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = 'Butter Popcorn')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, 'Butter popcorn size M', 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=600', 'Butter Popcorn', 55000, 'Food');

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = 'Caramel Popcorn')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, 'Sweet caramel popcorn size M', 'https://images.unsplash.com/photo-1617196038430-df4705e40923?w=600', 'Caramel Popcorn', 65000, 'Food');

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = 'Cheese Nachos')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, 'Nachos with cheese sauce', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600', 'Cheese Nachos', 70000, 'Food');

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = N'Hotdog')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, 'Hotdog sausage bun', 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=600', 'Hotdog', 50000, 'Food');

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = N'Coca Cola')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, 'Coca Cola soft drink size L', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600', 'Coca Cola', 35000, 'Drink');

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = N'Pepsi')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, 'Pepsi soft drink size L', 'https://images.unsplash.com/photo-1629203432180-71e9b8f34d74?w=600', 'Pepsi', 35000, 'Drink');

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = 'Peach Tea')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, 'Iced peach tea', 'https://images.unsplash.com/photo-1594631661960-56f8f9f8b694?w=600', 'Peach Tea', 39000, 'Drink');

IF NOT EXISTS (SELECT 1 FROM food_and_drink WHERE name = N'Combo Couple')
    INSERT INTO food_and_drink(active, description, image, name, price, type)
    VALUES (1, '1 large popcorn + 2 drinks', 'https://images.unsplash.com/photo-1542204637-e67bc7d41e48?w=600', 'Combo Couple', 129000, 'Combo');

SELECT COUNT(*) AS total_food FROM food_and_drink;
SELECT id, active, name, price, type FROM food_and_drink ORDER BY id;
