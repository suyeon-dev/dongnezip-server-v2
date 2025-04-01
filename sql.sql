select * from item;
select * from user;

INSERT INTO map (id, latitude, longitude, address, road_address, createdAt, updatedAt)
VALUES
(1, 37.5665, 126.9780, '서울특별시 중구 세종대로 110', '서울특별시 중구 세종대로 110', NOW(), NOW()),
(2, 37.541, 127.058, '서울특별시 강남구 테헤란로 152', '서울특별시 강남구 테헤란로 152', NOW(), NOW()),
(3, 37.484, 126.896, '서울특별시 구로구 구로동 97', '서울특별시 구로구 구로동 97', NOW(), NOW()),
(4, 37.503, 127.024, '서울특별시 서초구 서초대로 77길 55', '서울특별시 서초구 서초대로 77길 55', NOW(), NOW()),
(5, 37.394, 127.110, '경기도 성남시 분당구 정자동 178-1', '경기도 성남시 분당구 정자동 178-1', NOW(), NOW());


INSERT INTO user (email, provider, password, name, nickname, profile_img, createdAt, updatedAt) VALUES
('test1@example.com', 'local', '$2b$10$abc', '홍길동', '닉네임1', 'profile1.jpg', NOW(), NOW()),
('test2@example.com', 'kakao', NULL, '김영희', '닉네임2', 'profile2.jpg', NOW(), NOW()),;

;

/*초기화 1번부터 저장*/
ALTER TABLE category AUTO_INCREMENT = 1;
ALTER TABLE favorite AUTO_INCREMENT = 1;
ALTER TABLE item AUTO_INCREMENT = 1;
ALTER TABLE itemImage AUTO_INCREMENT = 1;
ALTER TABLE map AUTO_INCREMENT = 1;
ALTER TABLE message AUTO_INCREMENT = 1;
ALTER TABLE region AUTO_INCREMENT = 1;
ALTER TABLE room AUTO_INCREMENT = 1;
ALTER TABLE transaction AUTO_INCREMENT = 1;
ALTER TABLE user AUTO_INCREMENT = 1;


INSERT INTO category (id, category, createdAt, updatedAt) VALUES
(1, '의류/미용', NOW(), NOW()),
(2, '생활/주방', NOW(), NOW()),
(3, '디지털', NOW(), NOW()),
(4, '도서', NOW(), NOW()),
(5, '취미', NOW(), NOW()),
(6, '식품', NOW(), NOW()),
(7, '삽니다', NOW(), NOW()),
(8, '나눔', NOW(), NOW());


INSERT INTO Region (province, district, createdAt, updatedAt) VALUES
('서울', '강남구', NOW(), NOW()),
('서울', '강동구', NOW(), NOW()),
('서울', '강북구', NOW(), NOW()),
('서울', '강서구', NOW(), NOW()),
('서울', '관악구', NOW(), NOW()),
('서울', '광진구', NOW(), NOW()),
('서울', '구로구', NOW(), NOW()),
('서울', '금천구', NOW(), NOW()),
('서울', '노원구', NOW(), NOW()),
('서울', '도봉구', NOW(), NOW()),
('서울', '동대문구', NOW(), NOW()),
('서울', '동작구', NOW(), NOW()),
('서울', '마포구', NOW(), NOW()),
('서울', '서대문구', NOW(), NOW()),
('서울', '서초구', NOW(), NOW()),
('서울', '성동구', NOW(), NOW()),
('서울', '성북구', NOW(), NOW()),
('서울', '송파구', NOW(), NOW()),
('서울', '양천구', NOW(), NOW()),
('서울', '영등포구', NOW(), NOW()),
('서울', '용산구', NOW(), NOW()),
('서울', '은평구', NOW(), NOW()),
('서울', '종로구', NOW(), NOW()),
('서울', '중구', NOW(), NOW()),
('서울', '중랑구', NOW(), NOW());


INSERT INTO item (
  user_id, 
  category_id, 
  region_id, 
  map_id, 
  title, 
  price, 
  detail, 
  item_status, 
  createdAt, 
  updatedAt
)
VALUES
  (1, 1, 1, 1, '새상품 아이템', 10000, '미개봉 새상품입니다.', '새상품', NOW(), NOW()),
  (2, 2, 1, 2, '최상급 아이템', 20000, '사용감 거의 없는 최상급 상품.', '최상', NOW(), NOW()),
  (3, 1, 2, 3, '상급 아이템', 15000, '사용감은 조금 있으나 상태 양호.', '상', NOW(), NOW()),
  (4, 3, 2, 4, '중고 아이템', 5000, '사용감이 꽤 있는 중고 상품.', '중', NOW(), NOW()),
  (5, 5, 1, 5, '하급 아이템', 1000, '기스 많음, 저렴하게 팝니다.', '하', NOW(), NOW());


INSERT INTO Transaction (item_id, seller_id, buyer_id, createdAt, updatedAt)
VALUES 
    (1, 1, 2, NOW(), NOW()),  -- 거래 완료 (buyer_id 존재)
    (2, 3, NULL, NOW(), NOW()),  -- 거래 가능 (buyer_id 없음)
    (3, 4, 5, NOW(), NOW()),  -- 거래 완료 (buyer_id 존재)
    (4, 5, NULL, NOW(), NOW()),  -- 거래 가능 (buyer_id 없음)
    (5, 1, 3, NOW(), NOW());


INSERT INTO user (email, provider, password, name, nickname, profile_img, createdAt, updatedAt) VALUES
('user1@example.com', 'local', '$2b$10$abc123', '홍길동', '길동이', 'profile1.jpg', NOW(), NOW()),
('user2@example.com', 'kakao', NULL, '이영희', '영희짱', 'profile2.jpg', NOW(), NOW()),
('user4@example.com', 'local', '$2b$10$xyz456', '최민수', '민수쿤', NULL, NOW(), NOW()),
('user5@example.com', 'local', '$2b$10$qwe789', '장보람', '보람찡', 'profile5.jpg', NOW(), NOW());


-- 50개 샘플 데이터 삽입 (user_id: 1~5, category_id: 1~8, region_id: 1~25, map_id: 1~5)
INSERT INTO item (user_id, category_id, region_id, map_id, title, price, detail, item_status, createdAt, updatedAt)
SELECT 
    FLOOR(RAND() * 5) + 1,  -- 랜덤 user_id (1~5)
    FLOOR(RAND() * 8) + 1,  -- 랜덤 category_id (1~8)
    FLOOR(RAND() * 25) + 1,  -- 랜덤 region_id (1~25)
    FLOOR(RAND() * 5) + 1,  -- 랜덤 map_id (1~5)
    CONCAT(
        CASE FLOOR(RAND() * 8) + 1
            WHEN 1 THEN '중고 노트북 '
            WHEN 2 THEN '아이폰 '
            WHEN 3 THEN '커피 머신 '
            WHEN 4 THEN '책 '
            WHEN 5 THEN '스포츠 용품 '
            WHEN 6 THEN '냉장고 '
            WHEN 7 THEN '의류 '
            ELSE '기타 상품 '
        END, 
        FLOOR(RAND() * 50) + 1
    ),  -- 랜덤 상품명
    FLOOR(RAND() * 900000) + 10000, -- 랜덤 가격 (1만원 ~ 90만원)
    '이 상품은 테스트용으로 생성된 더미 데이터입니다.',  -- 상품 상세 설명
    CASE FLOOR(RAND() * 5)
        WHEN 0 THEN '최상'
        WHEN 1 THEN '상'
        WHEN 2 THEN '중'
        WHEN 3 THEN '하'
        ELSE '새상품'
    END,  -- 랜덤 상품 상태 ('최상', '상', '중', '하', '새상품')
    NOW(),
    NOW()
FROM (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
     (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t2
LIMIT 50;