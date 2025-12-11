-- Produk dari gambar Anda dengan UUID valid - Copy-paste di Supabase SQL Editor

DELETE FROM products;

INSERT INTO products (id, name, slug, description, price, category, subcategory, sizes, colors, images, material, stock, is_sale, occasion, style, tags, is_active, created_at) VALUES
-- Produk Pria
('550e8400-e29b-41d4-a716-446655440001', 'Kemeja Hitam', 'kemeja-hitam', 'Kemeja formal elegan untuk acara resmi', 299000, 'Kemeja', 'Formal', '{S,M,L,XL}', '{Hitam}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Kemeja%20Hitam.jpg}', 'Cotton', 50, false, '{kerja,kantor,meeting}', 'Formal', '{kemeja,formal,kerja}', true, NOW()),

('550e8400-e29b-41d4-a716-446655440002', 'Kaos Putih', 'kaos-putih', 'T-shirt basic nyaman untuk sehari-hari', 149000, 'T-Shirt', 'Basic', '{S,M,L,XL}', '{Putih}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Kaos%20Putih.jpg}', 'Cotton', 100, false, '{nongkrong,kasual,sehari-hari}', 'Casual', '{tshirt,basic,casual}', true, NOW()),

('550e8400-e29b-41d4-a716-446655440003', 'Jeans Pria Biru', 'jeans-pria-biru', 'Jeans denim slim fit untuk gaya casual', 399000, 'Pants', 'Jeans', '{28,30,32,34}', '{Biru}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Jeans%20Pria%20Biru%20.jpg}', 'Denim', 40, false, '{nongkrong,kasual,sehari-hari}', 'Casual', '{jeans,pants,denim}', true, NOW()),

('550e8400-e29b-41d4-a716-446655440004', 'Denim Biru', 'denim-biru', 'Celana denim classic untuk gaya casual', 349000, 'Pants', 'Jeans', '{28,30,32,34}', '{Biru Denim}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Denim%20Biru.jpg}', 'Denim', 35, false, '{nongkrong,kasual,sehari-hari}', 'Casual', '{jeans,denim,pants}', true, NOW()),

('550e8400-e29b-41d4-a716-446655440005', 'Blazer Biru', 'blazer-biru', 'Blazer modern untuk acara semi-formal', 599000, 'Blazer', 'Formal', '{S,M,L,XL}', '{Biru}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Blazer%20Biru.jpg}', 'Wool Blend', 30, false, '{kerja,kantor,date}', 'Formal', '{blazer,formal,keren}', true, NOW()),

('550e8400-e29b-41d4-a716-446655440006', 'Casual Sneakers', 'casual-sneakers', 'Sneakers nyaman untuk jalan-jalan', 599000, 'Sepatu cowo', 'Sneakers', '{39,40,41,42,43}', '{Putih,Hitam}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Cassual%20Sneakers.jpg}', 'Canvas', 60, true, '{nongkrong,casual,olahraga}', 'Sporty', '{sepatu,sneakers,casual}', true, NOW()),

-- Produk Wanita
('550e8400-e29b-41d4-a716-446655440007', 'Dress Party', 'dress-party', 'Dress elegan untuk acara pesta', 499000, 'Dress', 'Party', '{S,M,L,XL}', '{Hitam,Merah}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Dress%20Party%20.jpg}', 'Silk', 25, true, '{party,pesta,malam}', 'Elegant', '{dress,party,pesta}', true, NOW()),

('550e8400-e29b-41d4-a716-446655440008', 'Heels Party', 'heels-party', 'High heels elegan untuk acara formal', 399000, 'Sepatu cewe', 'Heels', '{36,37,38,39,40}', '{Hitam,Emas}', '{https://failamyvdduolfpueahx.supabase.co/storage/v1/object/public/product-images/Heels%20party.jpg}', 'Leather', 20, false, '{party,pesta,formal}', 'Elegant', '{heels,sepatu,party}', true, NOW());

SELECT id, name, category, price FROM products ORDER BY category, name;
