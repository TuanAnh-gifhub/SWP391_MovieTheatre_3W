SET NOCOUNT ON;

DECLARE @CityId INT;
DECLARE @CinemaId INT;

-- 1) Ensure city
SELECT @CityId = cityid FROM city WHERE name = N'Ho Chi Minh';
IF @CityId IS NULL
BEGIN
    INSERT INTO city(name) VALUES (N'Ho Chi Minh');
    SET @CityId = SCOPE_IDENTITY();
END

-- 2) Ensure cinema
SELECT @CinemaId = cinemaid FROM cinemas WHERE name = N'SIX Cinema Demo - District 1';
IF @CinemaId IS NULL
BEGIN
    INSERT INTO cinemas(address, name, city_id)
    VALUES (N'123 Nguyen Hue, District 1', N'SIX Cinema Demo - District 1', @CityId);
    SET @CinemaId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    UPDATE cinemas SET city_id = COALESCE(city_id, @CityId) WHERE cinemaid = @CinemaId;
END

-- 3) Ensure 3 active cinema rooms
IF NOT EXISTS (SELECT 1 FROM cinema_rooms WHERE cinema_id = @CinemaId AND room_name = 'Room 1')
    INSERT INTO cinema_rooms(active, room_name, seat_quantity, cinema_id) VALUES (1, 'Room 1', 40, @CinemaId);
IF NOT EXISTS (SELECT 1 FROM cinema_rooms WHERE cinema_id = @CinemaId AND room_name = 'Room 2')
    INSERT INTO cinema_rooms(active, room_name, seat_quantity, cinema_id) VALUES (1, 'Room 2', 40, @CinemaId);
IF NOT EXISTS (SELECT 1 FROM cinema_rooms WHERE cinema_id = @CinemaId AND room_name = 'Room 3')
    INSERT INTO cinema_rooms(active, room_name, seat_quantity, cinema_id) VALUES (1, 'Room 3', 40, @CinemaId);

-- 4) Ensure seats for each room (A1..E8 = 40 seats/room)
;WITH RoomSet AS (
    SELECT cinema_roomid FROM cinema_rooms WHERE cinema_id = @CinemaId
), RowsCTE AS (
    SELECT * FROM (VALUES ('A'),('B'),('C'),('D'),('E')) v(r)
), ColsCTE AS (
    SELECT * FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8)) v(c)
)
INSERT INTO seats(seat_column, is_available, price, [row], seat_name, seat_type, status, cinema_roomid)
SELECT
    c.c,
    1,
    CASE WHEN c.c IN (1,8) THEN 90000 ELSE 75000 END,
    r.r,
    CONCAT(r.r, c.c),
    CASE WHEN r.r = 'E' THEN 'VIP' ELSE 'Standard' END,
    'Blank',
    rm.cinema_roomid
FROM RoomSet rm
CROSS JOIN RowsCTE r
CROSS JOIN ColsCTE c
WHERE NOT EXISTS (
    SELECT 1 FROM seats s WHERE s.cinema_roomid = rm.cinema_roomid
);

-- 5) Normalize seat_quantity to actual seats
UPDATE cr
SET seat_quantity = x.cnt
FROM cinema_rooms cr
CROSS APPLY (
    SELECT COUNT(*) AS cnt FROM seats s WHERE s.cinema_roomid = cr.cinema_roomid
) x
WHERE cr.cinema_id = @CinemaId;

-- 6) Ensure VNPay payment method exists
IF NOT EXISTS (SELECT 1 FROM payment_methods WHERE type = 'VNPay')
BEGIN
    INSERT INTO payment_methods(logo, type)
    VALUES ('https://sandbox.vnpayment.vn/paymentv2/images/icons/logo-icon/logo-primary.svg', 'VNPay');
END

-- 7) Ensure at least one active showtime for each movie (idempotent per movie)
DECLARE @RoomCount INT = (SELECT COUNT(*) FROM cinema_rooms WHERE cinema_id = @CinemaId);
DECLARE @TimeCount INT = 4; -- 09:00, 12:00, 15:00, 18:00
DECLARE @DayCount INT = 7;  -- spread across next 7 days

;WITH RoomOrder AS (
    SELECT cinema_roomid, ROW_NUMBER() OVER (ORDER BY cinema_roomid) - 1 AS room_idx
    FROM cinema_rooms
    WHERE cinema_id = @CinemaId
),
MovieOrder AS (
    SELECT movieid, ROW_NUMBER() OVER (ORDER BY movieid) - 1 AS rn
    FROM movies
),
Calc AS (
    SELECT
        m.movieid,
        m.rn,
        (m.rn % @RoomCount) AS room_idx,
        ((m.rn / @RoomCount) % @TimeCount) AS time_idx,
        ((m.rn / (@RoomCount * @TimeCount)) % @DayCount) AS day_idx
    FROM MovieOrder m
)
INSERT INTO showtimes(active, [date], [time], version, cinema_roomid, movieid)
SELECT
    1,
    DATEADD(day, c.day_idx + 1, CAST(GETDATE() AS date)),
    CASE c.time_idx
        WHEN 0 THEN CAST('09:00:00' AS time)
        WHEN 1 THEN CAST('12:00:00' AS time)
        WHEN 2 THEN CAST('15:00:00' AS time)
        ELSE CAST('18:00:00' AS time)
    END,
    '2D',
    r.cinema_roomid,
    c.movieid
FROM Calc c
JOIN RoomOrder r ON r.room_idx = c.room_idx
WHERE NOT EXISTS (
    SELECT 1 FROM showtimes s WHERE s.movieid = c.movieid
);

-- 8) Summary
SELECT 'city' table_name, COUNT(*) total FROM city
UNION ALL SELECT 'cinemas', COUNT(*) FROM cinemas
UNION ALL SELECT 'cinema_rooms', COUNT(*) FROM cinema_rooms
UNION ALL SELECT 'seats', COUNT(*) FROM seats
UNION ALL SELECT 'payment_methods', COUNT(*) FROM payment_methods
UNION ALL SELECT 'showtimes', COUNT(*) FROM showtimes;
