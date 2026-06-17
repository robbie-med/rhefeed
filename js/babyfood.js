// ─────────────────────────────────────────────────────────────────────────
// Baby food & infant formula catalog + feeding-amount calculator.
// Data from USDA FoodData Central SR Legacy (food_category_id=3).
// 344 foods with kcal, K, Mg, P per 100g.
// Source: fdc.nal.usda.gov
// ─────────────────────────────────────────────────────────────────────────

const BABY_FOODS = [
{"name":"Apple yogurt dessert, strained","kcal_100g":93.0,"k_mg_100g":70.0,"mg_mg_100g":15.0,"p_mg_100g":31.0,"isPowder":false,"tags":["dessert"]},
{"name":"Juice, pear","kcal_100g":43.0,"k_mg_100g":130.0,"mg_mg_100g":8.0,"p_mg_100g":12.0,"isPowder":false,"tags":["juice"]},
{"name":"Meat, beef with vegetables, toddler","kcal_100g":69.0,"k_mg_100g":168.0,"mg_mg_100g":11.0,"p_mg_100g":37.0,"isPowder":false,"tags":["vegetable","meat","toddler"]},
{"name":"Mixed fruit yogurt, strained","kcal_100g":75.0,"k_mg_100g":62.0,"mg_mg_100g":4.0,"p_mg_100g":22.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Rice and apples, dry","kcal_100g":396.0,"k_mg_100g":410.0,"mg_mg_100g":15.0,"p_mg_100g":423.0,"isPowder":false,"tags":[]},
{"name":"Juice, apple - cherry","kcal_100g":47.0,"k_mg_100g":110.0,"mg_mg_100g":3.0,"p_mg_100g":12.0,"isPowder":false,"tags":["juice"]},
{"name":"Cereal, rice with pears and apple, dry, instant fortified","kcal_100g":389.0,"k_mg_100g":414.0,"mg_mg_100g":37.0,"p_mg_100g":253.0,"isPowder":false,"tags":["cereal"]},
{"name":"Banana no tapioca, strained","kcal_100g":91.0,"k_mg_100g":290.0,"mg_mg_100g":26.0,"p_mg_100g":20.0,"isPowder":false,"tags":[]},
{"name":"Banana apple dessert, strained","kcal_100g":68.0,"k_mg_100g":71.0,"mg_mg_100g":8.0,"p_mg_100g":9.0,"isPowder":false,"tags":["dessert"]},
{"name":"Banana juice with low fat yogurt","kcal_100g":86.0,"k_mg_100g":160.0,"mg_mg_100g":10.0,"p_mg_100g":65.0,"isPowder":false,"tags":["juice","dessert"]},
{"name":"Mixed fruit juice with low fat yogurt","kcal_100g":74.0,"k_mg_100g":137.0,"mg_mg_100g":10.0,"p_mg_100g":60.0,"isPowder":false,"tags":["juice","fruit","dessert"]},
{"name":"Dinner, macaroni, beef and tomato sauce, toddler","kcal_100g":82.0,"k_mg_100g":148.0,"mg_mg_100g":15.0,"p_mg_100g":49.0,"isPowder":false,"tags":["meat","dinner","toddler"]},
{"name":"Dessert, peach yogurt","kcal_100g":77.0,"k_mg_100g":102.0,"mg_mg_100g":13.0,"p_mg_100g":27.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, blueberry yogurt, strained","kcal_100g":77.0,"k_mg_100g":62.0,"mg_mg_100g":13.0,"p_mg_100g":109.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, banana yogurt, strained","kcal_100g":78.0,"k_mg_100g":100.0,"mg_mg_100g":10.0,"p_mg_100g":28.0,"isPowder":false,"tags":["dessert"]},
{"name":"Fruit supreme dessert","kcal_100g":73.0,"k_mg_100g":129.0,"mg_mg_100g":7.0,"p_mg_100g":9.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Grape juice, no sugar, canned","kcal_100g":62.0,"k_mg_100g":90.0,"mg_mg_100g":10.0,"p_mg_100g":11.0,"isPowder":false,"tags":["juice"]},
{"name":"Enfamil, Newborn, with Ara and Dha, powder","kcal_100g":516.0,"k_mg_100g":550.0,"mg_mg_100g":41.0,"p_mg_100g":220.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Premium Lipil, Infant, powder","kcal_100g":510.0,"k_mg_100g":550.0,"mg_mg_100g":41.0,"p_mg_100g":220.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Premium Lipil, Infant, Liquid concentrate, not reconstituted","kcal_100g":129.0,"k_mg_100g":139.0,"mg_mg_100g":10.0,"p_mg_100g":56.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Premium, Infant, Liquid concentrate, not reconstituted","kcal_100g":129.0,"k_mg_100g":138.0,"mg_mg_100g":10.0,"p_mg_100g":55.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Enfagrow, Gentlease, Toddler transitions, with Ara and Dha, powder","kcal_100g":500.0,"k_mg_100g":650.0,"mg_mg_100g":40.0,"p_mg_100g":650.0,"isPowder":true,"tags":["formula","toddler"]},
{"name":"Similac, GO And Grow, powder, with Ara and Dha","kcal_100g":512.0,"k_mg_100g":768.0,"mg_mg_100g":46.0,"p_mg_100g":666.0,"isPowder":true,"tags":["formula"]},
{"name":"Gerber, Good Start 2 Soy, with iron, powder","kcal_100g":501.0,"k_mg_100g":581.0,"mg_mg_100g":55.0,"p_mg_100g":316.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Nutramigen, PurAmino, powder, not reconstituted","kcal_100g":512.0,"k_mg_100g":550.0,"mg_mg_100g":55.0,"p_mg_100g":260.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Premature, 20 calories ready-to-feed Low iron","kcal_100g":66.0,"k_mg_100g":64.0,"mg_mg_100g":6.0,"p_mg_100g":54.0,"isPowder":false,"tags":["formula"]},
{"name":"Rice cereal, dry, Earths Best Organic Whole Grain, fortified only with iron","kcal_100g":386.0,"k_mg_100g":184.0,"mg_mg_100g":112.0,"p_mg_100g":256.0,"isPowder":false,"tags":["cereal"]},
{"name":"Juice, apple-sweet potato","kcal_100g":47.0,"k_mg_100g":137.0,"mg_mg_100g":7.0,"p_mg_100g":14.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, orange-carrot","kcal_100g":43.0,"k_mg_100g":174.0,"mg_mg_100g":10.0,"p_mg_100g":19.0,"isPowder":false,"tags":["juice"]},
{"name":"Baked product, finger snacks cereal fortified","kcal_100g":421.0,"k_mg_100g":114.0,"mg_mg_100g":27.0,"p_mg_100g":709.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, brown rice, dry, instant","kcal_100g":406.0,"k_mg_100g":386.0,"mg_mg_100g":28.0,"p_mg_100g":272.0,"isPowder":false,"tags":["cereal"]},
{"name":"Green beans and turkey, strained","kcal_100g":51.0,"k_mg_100g":188.0,"mg_mg_100g":22.0,"p_mg_100g":56.0,"isPowder":false,"tags":["meat"]},
{"name":"Dinner, chicken and rice","kcal_100g":51.0,"k_mg_100g":60.0,"mg_mg_100g":8.0,"p_mg_100g":20.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Gerber, Good Start, Protect Plus, powder","kcal_100g":512.0,"k_mg_100g":553.0,"mg_mg_100g":36.0,"p_mg_100g":195.0,"isPowder":true,"tags":["formula"]},
{"name":"Gerber Good Start 2, Gentle Plus, powder","kcal_100g":492.0,"k_mg_100g":531.0,"mg_mg_100g":34.0,"p_mg_100g":522.0,"isPowder":true,"tags":["formula"]},
{"name":"Gerber, Good Start 2, Protect Plus, powder","kcal_100g":501.0,"k_mg_100g":553.0,"mg_mg_100g":36.0,"p_mg_100g":543.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Enfagrow, Soy, Toddler transitions, with Ara and Dha, powder","kcal_100g":476.0,"k_mg_100g":570.0,"mg_mg_100g":52.0,"p_mg_100g":620.0,"isPowder":true,"tags":["formula","toddler"]},
{"name":"Enfamil, Premature, 24 calories ready-to-feed Low iron","kcal_100g":67.0,"k_mg_100g":64.0,"mg_mg_100g":6.0,"p_mg_100g":54.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Premium, Infant, ready-to-feed","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":28.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Premium, Infant, powder","kcal_100g":510.0,"k_mg_100g":550.0,"mg_mg_100g":41.0,"p_mg_100g":220.0,"isPowder":true,"tags":["formula"]},
{"name":"Gerber, Banana with orange medley","kcal_100g":69.0,"k_mg_100g":265.0,"mg_mg_100g":18.0,"p_mg_100g":19.0,"isPowder":false,"tags":[]},
{"name":"Vegetable and brown rice, strained","kcal_100g":69.0,"k_mg_100g":135.0,"mg_mg_100g":15.0,"p_mg_100g":33.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Peas and brown rice","kcal_100g":64.0,"k_mg_100g":93.0,"mg_mg_100g":25.0,"p_mg_100g":52.0,"isPowder":false,"tags":[]},
{"name":"Carrots, toddler","kcal_100g":21.0,"k_mg_100g":129.0,"mg_mg_100g":6.0,"p_mg_100g":21.0,"isPowder":false,"tags":["toddler"]},
{"name":"Dessert, banana pudding, strained","kcal_100g":68.0,"k_mg_100g":90.0,"mg_mg_100g":5.0,"p_mg_100g":34.0,"isPowder":false,"tags":["dessert"]},
{"name":"Fruit, tutti frutti, strained","kcal_100g":66.0,"k_mg_100g":46.0,"mg_mg_100g":4.0,"p_mg_100g":17.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, tutti frutti, junior","kcal_100g":69.0,"k_mg_100g":47.0,"mg_mg_100g":4.0,"p_mg_100g":28.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fluid replacement, electrolyte solution (include Pedialyte)","kcal_100g":10.0,"k_mg_100g":77.0,"mg_mg_100g":1.0,"p_mg_100g":10.0,"isPowder":false,"tags":[]},
{"name":"Vegetables, peas, strained","kcal_100g":50.0,"k_mg_100g":106.0,"mg_mg_100g":17.0,"p_mg_100g":50.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Peas, dices, toddler","kcal_100g":64.0,"k_mg_100g":81.0,"mg_mg_100g":19.0,"p_mg_100g":67.0,"isPowder":false,"tags":["toddler"]},
{"name":"Vegetables, spinach, creamed, strained","kcal_100g":37.0,"k_mg_100g":191.0,"mg_mg_100g":55.0,"p_mg_100g":54.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Fruit, apricot with tapioca, junior","kcal_100g":63.0,"k_mg_100g":125.0,"mg_mg_100g":4.0,"p_mg_100g":10.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, pears, junior","kcal_100g":44.0,"k_mg_100g":115.0,"mg_mg_100g":9.0,"p_mg_100g":12.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, plums with tapioca, without ascorbic acid, strained","kcal_100g":71.0,"k_mg_100g":85.0,"mg_mg_100g":4.0,"p_mg_100g":6.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, plums with tapioca, without ascorbic acid, junior","kcal_100g":74.0,"k_mg_100g":83.0,"mg_mg_100g":4.0,"p_mg_100g":6.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, prunes with tapioca, without ascorbic acid, strained","kcal_100g":69.0,"k_mg_100g":177.0,"mg_mg_100g":10.0,"p_mg_100g":15.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, applesauce and apricots, strained","kcal_100g":44.0,"k_mg_100g":120.0,"mg_mg_100g":4.0,"p_mg_100g":9.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, applesauce and apricots, junior","kcal_100g":47.0,"k_mg_100g":109.0,"mg_mg_100g":4.0,"p_mg_100g":10.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, applesauce and cherries, strained","kcal_100g":51.0,"k_mg_100g":132.0,"mg_mg_100g":4.0,"p_mg_100g":8.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, applesauce and cherries, junior","kcal_100g":51.0,"k_mg_100g":132.0,"mg_mg_100g":4.0,"p_mg_100g":8.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, applesauce with banana, junior","kcal_100g":66.0,"k_mg_100g":131.0,"mg_mg_100g":9.0,"p_mg_100g":12.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit and vegetable, apple and sweet potato","kcal_100g":64.0,"k_mg_100g":149.0,"mg_mg_100g":6.0,"p_mg_100g":17.0,"isPowder":false,"tags":["fruit","vegetable"]},
{"name":"Fruit, bananas and pineapple with tapioca, junior","kcal_100g":68.0,"k_mg_100g":78.0,"mg_mg_100g":6.0,"p_mg_100g":5.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, bananas and pineapple with tapioca, strained","kcal_100g":65.0,"k_mg_100g":68.0,"mg_mg_100g":6.0,"p_mg_100g":5.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, pears and pineapple, strained","kcal_100g":41.0,"k_mg_100g":116.0,"mg_mg_100g":7.0,"p_mg_100g":9.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, bananas with apples and pears, strained","kcal_100g":83.0,"k_mg_100g":233.0,"mg_mg_100g":25.0,"p_mg_100g":19.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, apple and blueberry, strained","kcal_100g":61.0,"k_mg_100g":69.0,"mg_mg_100g":3.0,"p_mg_100g":8.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, apple and blueberry, junior","kcal_100g":62.0,"k_mg_100g":65.0,"mg_mg_100g":3.0,"p_mg_100g":7.0,"isPowder":false,"tags":["fruit"]},
{"name":"Juice, apple","kcal_100g":47.0,"k_mg_100g":91.0,"mg_mg_100g":3.0,"p_mg_100g":5.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, orange and apple and banana","kcal_100g":47.0,"k_mg_100g":134.0,"mg_mg_100g":6.0,"p_mg_100g":8.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, orange and apricot","kcal_100g":46.0,"k_mg_100g":199.0,"mg_mg_100g":7.0,"p_mg_100g":12.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, orange and banana","kcal_100g":50.0,"k_mg_100g":200.0,"mg_mg_100g":14.0,"p_mg_100g":13.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, orange and pineapple","kcal_100g":48.0,"k_mg_100g":141.0,"mg_mg_100g":9.0,"p_mg_100g":9.0,"isPowder":false,"tags":["juice"]},
{"name":"Cereal, mixed, dry fortified","kcal_100g":399.0,"k_mg_100g":467.0,"mg_mg_100g":100.0,"p_mg_100g":333.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, mixed, with bananas, dry","kcal_100g":391.0,"k_mg_100g":668.0,"mg_mg_100g":90.0,"p_mg_100g":367.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, mixed, with applesauce and bananas, strained","kcal_100g":82.0,"k_mg_100g":111.0,"mg_mg_100g":7.0,"p_mg_100g":29.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, mixed, with applesauce and bananas, junior, fortified","kcal_100g":84.0,"k_mg_100g":111.0,"mg_mg_100g":7.0,"p_mg_100g":29.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, with honey, dry","kcal_100g":391.0,"k_mg_100g":259.0,"mg_mg_100g":146.0,"p_mg_100g":733.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, rice, dry fortified","kcal_100g":390.0,"k_mg_100g":281.0,"mg_mg_100g":37.0,"p_mg_100g":273.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, rice, with applesauce and bananas, strained","kcal_100g":80.0,"k_mg_100g":28.0,"mg_mg_100g":3.0,"p_mg_100g":12.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, with egg yolks, strained","kcal_100g":51.0,"k_mg_100g":39.0,"mg_mg_100g":3.0,"p_mg_100g":40.0,"isPowder":false,"tags":["cereal"]},
{"name":"Crackers, vegetable","kcal_100g":477.0,"k_mg_100g":245.0,"mg_mg_100g":37.0,"p_mg_100g":198.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Cereal, high protein, with apple and orange, dry","kcal_100g":374.0,"k_mg_100g":1330.0,"mg_mg_100g":159.0,"p_mg_100g":539.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, rice, with bananas, dry","kcal_100g":404.0,"k_mg_100g":769.0,"mg_mg_100g":141.0,"p_mg_100g":410.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cookies","kcal_100g":433.0,"k_mg_100g":501.0,"mg_mg_100g":49.0,"p_mg_100g":179.0,"isPowder":false,"tags":[]},
{"name":"Dessert, dutch apple, strained","kcal_100g":75.0,"k_mg_100g":33.0,"mg_mg_100g":2.0,"p_mg_100g":3.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, dutch apple, junior","kcal_100g":79.0,"k_mg_100g":67.0,"mg_mg_100g":4.0,"p_mg_100g":7.0,"isPowder":false,"tags":["dessert"]},
{"name":"Cherry cobbler, junior","kcal_100g":78.0,"k_mg_100g":45.0,"mg_mg_100g":2.0,"p_mg_100g":6.0,"isPowder":false,"tags":[]},
{"name":"Dessert, cherry vanilla pudding, strained","kcal_100g":68.0,"k_mg_100g":34.0,"mg_mg_100g":2.0,"p_mg_100g":7.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, peach melba, strained","kcal_100g":60.0,"k_mg_100g":83.0,"mg_mg_100g":2.0,"p_mg_100g":5.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, peach melba, junior","kcal_100g":60.0,"k_mg_100g":93.0,"mg_mg_100g":2.0,"p_mg_100g":5.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, fruit pudding, pineapple, strained","kcal_100g":81.0,"k_mg_100g":81.0,"mg_mg_100g":9.0,"p_mg_100g":31.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Dessert, fruit dessert, without ascorbic acid, strained","kcal_100g":59.0,"k_mg_100g":94.0,"mg_mg_100g":5.0,"p_mg_100g":7.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Juice, fruit punch, with calcium","kcal_100g":52.0,"k_mg_100g":86.0,"mg_mg_100g":7.0,"p_mg_100g":11.0,"isPowder":false,"tags":["juice","fruit"]},
{"name":"Juice, apple, with calcium","kcal_100g":46.0,"k_mg_100g":92.0,"mg_mg_100g":6.0,"p_mg_100g":8.0,"isPowder":false,"tags":["juice"]},
{"name":"Enfamil, Enfacare, ready-to-feed, with Ara and Dha","kcal_100g":73.0,"k_mg_100g":76.0,"mg_mg_100g":6.0,"p_mg_100g":48.0,"isPowder":false,"tags":["formula"]},
{"name":"Yogurt, whole milk, with fruit, multigrain cereal and added Dha fortified","kcal_100g":98.0,"k_mg_100g":149.0,"mg_mg_100g":15.0,"p_mg_100g":95.0,"isPowder":false,"tags":["cereal","fruit","dessert"]},
{"name":"Alimentum Advance, with iron, powder, not reconstituted, with Dha and Ara","kcal_100g":517.0,"k_mg_100g":598.0,"mg_mg_100g":38.0,"p_mg_100g":382.0,"isPowder":true,"tags":[]},
{"name":"Mashed cheddar potatoes and broccoli, toddlers","kcal_100g":48.0,"k_mg_100g":118.0,"mg_mg_100g":8.0,"p_mg_100g":24.0,"isPowder":false,"tags":["toddler"]},
{"name":"Yogurt, whole milk, with fruit, multigrain cereal and added iron fortified","kcal_100g":92.0,"k_mg_100g":143.0,"mg_mg_100g":15.0,"p_mg_100g":86.0,"isPowder":false,"tags":["cereal","fruit","dessert"]},
{"name":"Good Start Soy, with Dha and Ara, liquid concentrate","kcal_100g":132.0,"k_mg_100g":154.0,"mg_mg_100g":15.0,"p_mg_100g":84.0,"isPowder":false,"tags":["formula"]},
{"name":"Toddler Enfagrow, Toddler Transitions, with Ara and Dha, powder","kcal_100g":505.0,"k_mg_100g":650.0,"mg_mg_100g":40.0,"p_mg_100g":650.0,"isPowder":true,"tags":["toddler"]},
{"name":"Toddler Enfagrow Premium (formerly Enfamil, Lipil, Next Step), ready-to-fee","kcal_100g":64.0,"k_mg_100g":89.0,"mg_mg_100g":5.0,"p_mg_100g":89.0,"isPowder":false,"tags":["formula","toddler"]},
{"name":"Enfamil, Newborn, with Dha and Ara, ready-to-feed","kcal_100g":68.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":28.0,"isPowder":false,"tags":["formula"]},
{"name":"Gerber, Good Start 2 Soy, with iron, ready-to-feed","kcal_100g":65.0,"k_mg_100g":76.0,"mg_mg_100g":7.0,"p_mg_100g":70.0,"isPowder":false,"tags":["formula"]},
{"name":"Gerber, Good Start, Protect Plus, ready-to-feed","kcal_100g":65.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":25.0,"isPowder":false,"tags":["formula"]},
{"name":"Gerber Good Start 2, Gentle Plus, ready-to-feed","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":null,"p_mg_100g":70.0,"isPowder":false,"tags":["formula"]},
{"name":"Fruit, banana and strawberry, junior","kcal_100g":109.0,"k_mg_100g":395.0,"mg_mg_100g":30.0,"p_mg_100g":24.0,"isPowder":false,"tags":["fruit"]},
{"name":"Banana with mixed berries, strained","kcal_100g":92.0,"k_mg_100g":283.0,"mg_mg_100g":23.0,"p_mg_100g":20.0,"isPowder":false,"tags":[]},
{"name":"Multigrain whole grain cereal, dry fortified","kcal_100g":407.0,"k_mg_100g":467.0,"mg_mg_100g":95.0,"p_mg_100g":333.0,"isPowder":false,"tags":["cereal"]},
{"name":"Baby Mum Mum Rice Biscuits","kcal_100g":391.0,"k_mg_100g":504.0,"mg_mg_100g":47.0,"p_mg_100g":127.0,"isPowder":false,"tags":[]},
{"name":"Vegetables, corn, creamed, junior","kcal_100g":65.0,"k_mg_100g":81.0,"mg_mg_100g":8.0,"p_mg_100g":33.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Fruit, bananas with tapioca, strained","kcal_100g":56.0,"k_mg_100g":88.0,"mg_mg_100g":10.0,"p_mg_100g":7.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, peaches, strained","kcal_100g":65.0,"k_mg_100g":195.0,"mg_mg_100g":7.0,"p_mg_100g":15.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, peaches, junior","kcal_100g":65.0,"k_mg_100g":195.0,"mg_mg_100g":7.0,"p_mg_100g":15.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, pears, strained","kcal_100g":42.0,"k_mg_100g":130.0,"mg_mg_100g":8.0,"p_mg_100g":12.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, prunes with tapioca, without ascorbic acid, junior","kcal_100g":70.0,"k_mg_100g":162.0,"mg_mg_100g":10.0,"p_mg_100g":15.0,"isPowder":false,"tags":["fruit"]},
{"name":"Prunes, without vitamin c, strained","kcal_100g":100.0,"k_mg_100g":306.0,"mg_mg_100g":17.0,"p_mg_100g":30.0,"isPowder":false,"tags":[]},
{"name":"Fruit dessert, mango with tapioca","kcal_100g":70.0,"k_mg_100g":66.0,"mg_mg_100g":6.0,"p_mg_100g":4.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Pears, dices, toddler","kcal_100g":57.0,"k_mg_100g":51.0,"mg_mg_100g":7.0,"p_mg_100g":13.0,"isPowder":false,"tags":["toddler"]},
{"name":"Fruit, applesauce and pineapple, strained","kcal_100g":37.0,"k_mg_100g":78.0,"mg_mg_100g":3.0,"p_mg_100g":6.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, applesauce and pineapple, junior","kcal_100g":39.0,"k_mg_100g":76.0,"mg_mg_100g":4.0,"p_mg_100g":6.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, apple and raspberry, strained","kcal_100g":58.0,"k_mg_100g":80.0,"mg_mg_100g":4.0,"p_mg_100g":8.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, apple and raspberry, junior","kcal_100g":58.0,"k_mg_100g":72.0,"mg_mg_100g":4.0,"p_mg_100g":8.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, pears and pineapple, junior","kcal_100g":44.0,"k_mg_100g":118.0,"mg_mg_100g":7.0,"p_mg_100g":10.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, guava and papaya with tapioca, strained","kcal_100g":63.0,"k_mg_100g":74.0,"mg_mg_100g":5.0,"p_mg_100g":6.0,"isPowder":false,"tags":["fruit"]},
{"name":"Peaches, dices, toddler","kcal_100g":51.0,"k_mg_100g":83.0,"mg_mg_100g":8.0,"p_mg_100g":17.0,"isPowder":false,"tags":["toddler"]},
{"name":"Fruit, papaya and applesauce with tapioca, strained","kcal_100g":70.0,"k_mg_100g":79.0,"mg_mg_100g":5.0,"p_mg_100g":5.0,"isPowder":false,"tags":["fruit"]},
{"name":"Apple-banana juice","kcal_100g":51.0,"k_mg_100g":123.0,"mg_mg_100g":6.0,"p_mg_100g":8.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, apple and peach","kcal_100g":43.0,"k_mg_100g":97.0,"mg_mg_100g":3.0,"p_mg_100g":4.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, apple and prune","kcal_100g":72.0,"k_mg_100g":148.0,"mg_mg_100g":7.0,"p_mg_100g":15.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, orange","kcal_100g":45.0,"k_mg_100g":184.0,"mg_mg_100g":9.0,"p_mg_100g":11.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, orange and apple","kcal_100g":43.0,"k_mg_100g":138.0,"mg_mg_100g":5.0,"p_mg_100g":7.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, prune and orange","kcal_100g":70.0,"k_mg_100g":181.0,"mg_mg_100g":8.0,"p_mg_100g":10.0,"isPowder":false,"tags":["juice"]},
{"name":"Juice, mixed fruit","kcal_100g":47.0,"k_mg_100g":101.0,"mg_mg_100g":5.0,"p_mg_100g":5.0,"isPowder":false,"tags":["juice","fruit"]},
{"name":"Cereal, barley, dry fortified","kcal_100g":376.0,"k_mg_100g":467.0,"mg_mg_100g":115.0,"p_mg_100g":333.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, whole wheat, with apples, dry fortified","kcal_100g":402.0,"k_mg_100g":500.0,"mg_mg_100g":140.0,"p_mg_100g":200.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, dry fortified","kcal_100g":394.0,"k_mg_100g":549.0,"mg_mg_100g":110.0,"p_mg_100g":506.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, with bananas, dry","kcal_100g":399.0,"k_mg_100g":600.0,"mg_mg_100g":118.0,"p_mg_100g":267.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, with applesauce and bananas, strained","kcal_100g":75.0,"k_mg_100g":97.0,"mg_mg_100g":11.0,"p_mg_100g":41.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, with applesauce and bananas, junior, fortified","kcal_100g":76.0,"k_mg_100g":97.0,"mg_mg_100g":11.0,"p_mg_100g":41.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, with egg yolks, junior","kcal_100g":52.0,"k_mg_100g":35.0,"mg_mg_100g":3.0,"p_mg_100g":40.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, with eggs, strained","kcal_100g":58.0,"k_mg_100g":44.0,"mg_mg_100g":3.0,"p_mg_100g":46.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, egg yolks and bacon, junior","kcal_100g":79.0,"k_mg_100g":35.0,"mg_mg_100g":5.0,"p_mg_100g":50.0,"isPowder":false,"tags":["cereal"]},
{"name":"Oatmeal cereal with fruit, dry, instant, toddler fortified","kcal_100g":402.0,"k_mg_100g":346.0,"mg_mg_100g":107.0,"p_mg_100g":429.0,"isPowder":false,"tags":["cereal","fruit","toddler"]},
{"name":"Cookie, baby, fruit","kcal_100g":435.0,"k_mg_100g":425.0,"mg_mg_100g":30.0,"p_mg_100g":189.0,"isPowder":false,"tags":["fruit"]},
{"name":"Cookies, arrowroot","kcal_100g":424.0,"k_mg_100g":156.0,"mg_mg_100g":22.0,"p_mg_100g":116.0,"isPowder":false,"tags":[]},
{"name":"Pretzels","kcal_100g":397.0,"k_mg_100g":137.0,"mg_mg_100g":28.0,"p_mg_100g":110.0,"isPowder":false,"tags":[]},
{"name":"Gerber, Graduates Lil Biscuits Vanilla Wheat","kcal_100g":407.0,"k_mg_100g":318.0,"mg_mg_100g":63.0,"p_mg_100g":186.0,"isPowder":false,"tags":[]},
{"name":"Zwieback","kcal_100g":426.0,"k_mg_100g":305.0,"mg_mg_100g":14.0,"p_mg_100g":55.0,"isPowder":false,"tags":[]},
{"name":"Dessert, cherry vanilla pudding, junior","kcal_100g":69.0,"k_mg_100g":33.0,"mg_mg_100g":2.0,"p_mg_100g":7.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, fruit pudding, orange, strained","kcal_100g":80.0,"k_mg_100g":86.0,"mg_mg_100g":5.0,"p_mg_100g":28.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Dessert, peach cobbler, strained","kcal_100g":65.0,"k_mg_100g":54.0,"mg_mg_100g":2.0,"p_mg_100g":5.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, peach cobbler, junior","kcal_100g":67.0,"k_mg_100g":56.0,"mg_mg_100g":2.0,"p_mg_100g":6.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, fruit dessert, without ascorbic acid, junior","kcal_100g":63.0,"k_mg_100g":95.0,"mg_mg_100g":5.0,"p_mg_100g":8.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Dessert, tropical fruit, junior","kcal_100g":60.0,"k_mg_100g":58.0,"mg_mg_100g":5.0,"p_mg_100g":8.0,"isPowder":false,"tags":["fruit","dessert"]},
{"name":"Dessert, custard pudding, vanilla, strained","kcal_100g":85.0,"k_mg_100g":66.0,"mg_mg_100g":5.0,"p_mg_100g":45.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dessert, custard pudding, vanilla, junior","kcal_100g":86.0,"k_mg_100g":68.0,"mg_mg_100g":5.0,"p_mg_100g":55.0,"isPowder":false,"tags":["dessert"]},
{"name":"Juice, apple and grape","kcal_100g":46.0,"k_mg_100g":90.0,"mg_mg_100g":6.0,"p_mg_100g":5.0,"isPowder":false,"tags":["juice"]},
{"name":"Similac, Isomil, Advance with iron, liquid concentrate","kcal_100g":128.0,"k_mg_100g":138.0,"mg_mg_100g":10.0,"p_mg_100g":96.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Isomil, Advance with iron, ready-to-feed","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":49.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Isomil, Advance with iron, powder, not reconstituted","kcal_100g":517.0,"k_mg_100g":555.0,"mg_mg_100g":39.0,"p_mg_100g":386.0,"isPowder":true,"tags":["formula"]},
{"name":"Good Start Supreme, with iron, Dha and Ara, ready-to-feed","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":24.0,"isPowder":false,"tags":["formula"]},
{"name":"Good Start Supreme, with iron, Dha and Ara, prepared from liquid concentrat","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":24.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil Gentlease, with iron, prepared from powder","kcal_100g":68.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":30.0,"isPowder":true,"tags":["formula"]},
{"name":"Fortified cereal bar, fruit filling","kcal_100g":344.0,"k_mg_100g":180.0,"mg_mg_100g":19.0,"p_mg_100g":247.0,"isPowder":false,"tags":["cereal","fruit"]},
{"name":"Enfamil, Gentlease, with Ara and Dha powder not reconstituted","kcal_100g":516.0,"k_mg_100g":550.0,"mg_mg_100g":41.0,"p_mg_100g":230.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Enfagrow, Soy, Toddler ready-to-feed","kcal_100g":65.0,"k_mg_100g":79.0,"mg_mg_100g":7.0,"p_mg_100g":85.0,"isPowder":false,"tags":["formula","toddler"]},
{"name":"Enfamil, Nutramigen AA, ready-to-feed","kcal_100g":66.0,"k_mg_100g":72.0,"mg_mg_100g":7.0,"p_mg_100g":34.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Premature, with iron, 20 calories, ready-to-feed","kcal_100g":63.0,"k_mg_100g":64.0,"mg_mg_100g":6.0,"p_mg_100g":59.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Premature, with iron, 24 calories, ready-to-feed","kcal_100g":81.0,"k_mg_100g":76.0,"mg_mg_100g":7.0,"p_mg_100g":70.0,"isPowder":false,"tags":["formula"]},
{"name":"Gerber, Good Start 2, Protect Plus, ready-to-feed","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":25.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, GO And Grow, ready-to-feed, with Ara and Dha","kcal_100g":66.0,"k_mg_100g":98.0,"mg_mg_100g":6.0,"p_mg_100g":85.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Expert Care, Diarrhea, ready- to- feed with Ara and Dha","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":49.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, For Spit Up, ready-to-feed, with Ara and Dha","kcal_100g":66.0,"k_mg_100g":70.0,"mg_mg_100g":4.0,"p_mg_100g":37.0,"isPowder":false,"tags":["formula"]},
{"name":"Snack, Gerber, Graduates, Lil Crunchies, baked whole grain corn snack","kcal_100g":503.0,"k_mg_100g":214.0,"mg_mg_100g":69.0,"p_mg_100g":1044.0,"isPowder":false,"tags":[]},
{"name":"Similac, For Spit Up, powder, with Ara and Dha","kcal_100g":514.0,"k_mg_100g":550.0,"mg_mg_100g":31.0,"p_mg_100g":288.0,"isPowder":true,"tags":["formula"]},
{"name":"Meat, beef, junior","kcal_100g":81.0,"k_mg_100g":187.0,"mg_mg_100g":11.0,"p_mg_100g":93.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, veal, strained","kcal_100g":81.0,"k_mg_100g":170.0,"mg_mg_100g":11.0,"p_mg_100g":98.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, pork, strained","kcal_100g":124.0,"k_mg_100g":223.0,"mg_mg_100g":10.0,"p_mg_100g":94.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, ham, strained","kcal_100g":97.0,"k_mg_100g":204.0,"mg_mg_100g":13.0,"p_mg_100g":81.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, chicken, junior","kcal_100g":146.0,"k_mg_100g":122.0,"mg_mg_100g":11.0,"p_mg_100g":90.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, chicken sticks, junior","kcal_100g":188.0,"k_mg_100g":106.0,"mg_mg_100g":14.0,"p_mg_100g":121.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, turkey, strained","kcal_100g":111.0,"k_mg_100g":135.0,"mg_mg_100g":12.0,"p_mg_100g":117.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, turkey, junior","kcal_100g":111.0,"k_mg_100g":135.0,"mg_mg_100g":12.0,"p_mg_100g":117.0,"isPowder":false,"tags":["meat"]},
{"name":"Finger snacks, Gerber, Graduates, Puffs, apple and cinnamon","kcal_100g":344.0,"k_mg_100g":196.0,"mg_mg_100g":60.0,"p_mg_100g":448.0,"isPowder":false,"tags":[]},
{"name":"Gerber, 3rd Foods, apple, mango and kiwi","kcal_100g":48.0,"k_mg_100g":123.0,"mg_mg_100g":6.0,"p_mg_100g":11.0,"isPowder":false,"tags":[]},
{"name":"Tropical fruit medley","kcal_100g":46.0,"k_mg_100g":141.0,"mg_mg_100g":5.0,"p_mg_100g":11.0,"isPowder":false,"tags":["fruit"]},
{"name":"Dinner, vegetables and dumplings and beef, strained","kcal_100g":48.0,"k_mg_100g":46.0,"mg_mg_100g":6.0,"p_mg_100g":28.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Ravioli, cheese filled, with tomato sauce","kcal_100g":99.0,"k_mg_100g":32.0,"mg_mg_100g":7.0,"p_mg_100g":56.0,"isPowder":false,"tags":[]},
{"name":"Dinner, beef noodle, strained","kcal_100g":63.0,"k_mg_100g":87.0,"mg_mg_100g":10.0,"p_mg_100g":38.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Macaroni and cheese, toddler","kcal_100g":82.0,"k_mg_100g":18.0,"mg_mg_100g":9.0,"p_mg_100g":81.0,"isPowder":false,"tags":["toddler"]},
{"name":"Dinner, beef and rice, toddler","kcal_100g":82.0,"k_mg_100g":120.0,"mg_mg_100g":8.0,"p_mg_100g":35.0,"isPowder":false,"tags":["meat","dinner","toddler"]},
{"name":"Dinner, beef with vegetables","kcal_100g":96.0,"k_mg_100g":127.0,"mg_mg_100g":15.0,"p_mg_100g":24.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, vegetables and lamb, junior","kcal_100g":51.0,"k_mg_100g":95.0,"mg_mg_100g":7.0,"p_mg_100g":49.0,"isPowder":false,"tags":["vegetable","dinner"]},
{"name":"Dinner, chicken noodle, strained","kcal_100g":74.0,"k_mg_100g":143.0,"mg_mg_100g":13.0,"p_mg_100g":52.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, chicken noodle, junior","kcal_100g":74.0,"k_mg_100g":143.0,"mg_mg_100g":13.0,"p_mg_100g":52.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, vegetables, noodles and chicken, junior","kcal_100g":64.0,"k_mg_100g":59.0,"mg_mg_100g":11.0,"p_mg_100g":33.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, pasta with vegetables","kcal_100g":60.0,"k_mg_100g":133.0,"mg_mg_100g":24.0,"p_mg_100g":50.0,"isPowder":false,"tags":["vegetable","dinner"]},
{"name":"Dinner, vegetables and noodles and turkey, strained","kcal_100g":44.0,"k_mg_100g":63.0,"mg_mg_100g":8.0,"p_mg_100g":25.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, vegetables and noodles and turkey, junior","kcal_100g":52.0,"k_mg_100g":73.0,"mg_mg_100g":9.0,"p_mg_100g":29.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, turkey and rice, strained","kcal_100g":52.0,"k_mg_100g":91.0,"mg_mg_100g":8.0,"p_mg_100g":34.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, macaroni and cheese, junior","kcal_100g":61.0,"k_mg_100g":44.0,"mg_mg_100g":7.0,"p_mg_100g":59.0,"isPowder":false,"tags":["dinner"]},
{"name":"Vegetables, green beans, strained","kcal_100g":27.0,"k_mg_100g":146.0,"mg_mg_100g":20.0,"p_mg_100g":41.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, green beans, junior","kcal_100g":24.0,"k_mg_100g":128.0,"mg_mg_100g":22.0,"p_mg_100g":19.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Green beans, dices, toddler","kcal_100g":29.0,"k_mg_100g":116.0,"mg_mg_100g":19.0,"p_mg_100g":22.0,"isPowder":false,"tags":["toddler"]},
{"name":"Vegetables, squash, strained","kcal_100g":28.0,"k_mg_100g":185.0,"mg_mg_100g":14.0,"p_mg_100g":21.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, squash, junior","kcal_100g":24.0,"k_mg_100g":185.0,"mg_mg_100g":14.0,"p_mg_100g":21.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, sweet potatoes strained","kcal_100g":57.0,"k_mg_100g":263.0,"mg_mg_100g":13.0,"p_mg_100g":24.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, sweet potatoes, junior","kcal_100g":60.0,"k_mg_100g":243.0,"mg_mg_100g":12.0,"p_mg_100g":24.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Fruit, applesauce, junior","kcal_100g":37.0,"k_mg_100g":77.0,"mg_mg_100g":3.0,"p_mg_100g":6.0,"isPowder":false,"tags":["fruit"]},
{"name":"Fruit, apricot with tapioca, strained","kcal_100g":60.0,"k_mg_100g":121.0,"mg_mg_100g":4.0,"p_mg_100g":10.0,"isPowder":false,"tags":["fruit"]},
{"name":"Vegetables, corn, creamed, strained","kcal_100g":57.0,"k_mg_100g":90.0,"mg_mg_100g":8.0,"p_mg_100g":33.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Dinner, mixed vegetable, junior","kcal_100g":34.0,"k_mg_100g":112.0,"mg_mg_100g":13.0,"p_mg_100g":30.0,"isPowder":false,"tags":["vegetable","dinner"]},
{"name":"Fruit, bananas with tapioca, junior","kcal_100g":67.0,"k_mg_100g":108.0,"mg_mg_100g":12.0,"p_mg_100g":9.0,"isPowder":false,"tags":["fruit"]},
{"name":"Vegetables, mix vegetables junior","kcal_100g":36.0,"k_mg_100g":170.0,"mg_mg_100g":11.0,"p_mg_100g":25.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, garden vegetable, strained","kcal_100g":32.0,"k_mg_100g":168.0,"mg_mg_100g":21.0,"p_mg_100g":28.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Plums, bananas and rice, strained","kcal_100g":57.0,"k_mg_100g":265.0,"mg_mg_100g":11.0,"p_mg_100g":32.0,"isPowder":false,"tags":[]},
{"name":"Dinner, turkey, rice, and vegetables, toddler","kcal_100g":60.0,"k_mg_100g":107.0,"mg_mg_100g":14.0,"p_mg_100g":63.0,"isPowder":false,"tags":["vegetable","meat","dinner","toddler"]},
{"name":"Dinner, apples and chicken, strained","kcal_100g":65.0,"k_mg_100g":95.0,"mg_mg_100g":6.0,"p_mg_100g":32.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, broccoli and chicken, junior","kcal_100g":62.0,"k_mg_100g":170.0,"mg_mg_100g":12.0,"p_mg_100g":58.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Enfamil Premature High Protein 24 Calories, ready to feed, with Ara and Dha","kcal_100g":81.0,"k_mg_100g":77.0,"mg_mg_100g":7.0,"p_mg_100g":70.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil Premature 30 Calories, ready to feed, with Ara and Dha","kcal_100g":101.0,"k_mg_100g":95.0,"mg_mg_100g":9.0,"p_mg_100g":87.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil for Supplementing, powder, with Ara and Dha, not reconstituted","kcal_100g":513.0,"k_mg_100g":550.0,"mg_mg_100g":41.0,"p_mg_100g":230.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil Reguline Powder, with Ara and Dha, not reconstituted","kcal_100g":513.0,"k_mg_100g":550.0,"mg_mg_100g":41.0,"p_mg_100g":230.0,"isPowder":true,"tags":["formula"]},
{"name":"Pregestimil 24 Calories, ready to feed, with Ara and Dha","kcal_100g":72.0,"k_mg_100g":86.0,"mg_mg_100g":6.0,"p_mg_100g":41.0,"isPowder":false,"tags":[]},
{"name":"Toddler drink, PurAmino Toddler Powder, with Ara and Dha, not reconstituted","kcal_100g":512.0,"k_mg_100g":550.0,"mg_mg_100g":55.0,"p_mg_100g":260.0,"isPowder":true,"tags":["toddler"]},
{"name":"Enfamil for Supplementing, ready to feed, with Ara and Dha","kcal_100g":68.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":30.0,"isPowder":false,"tags":["formula"]},
{"name":"Cereal, barley, prepared with whole milk","kcal_100g":84.0,"k_mg_100g":151.0,"mg_mg_100g":18.0,"p_mg_100g":110.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, with bananas, prepared with whole milk","kcal_100g":86.0,"k_mg_100g":178.0,"mg_mg_100g":18.0,"p_mg_100g":111.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, with honey, prepared with whole milk","kcal_100g":115.0,"k_mg_100g":170.0,"mg_mg_100g":35.0,"p_mg_100g":198.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, rice, prepared with whole milk","kcal_100g":85.0,"k_mg_100g":151.0,"mg_mg_100g":25.0,"p_mg_100g":122.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, rice, with honey, prepared with whole milk","kcal_100g":115.0,"k_mg_100g":141.0,"mg_mg_100g":45.0,"p_mg_100g":181.0,"isPowder":false,"tags":["cereal"]},
{"name":"Enfamil, with iron, powder","kcal_100g":520.0,"k_mg_100g":560.0,"mg_mg_100g":41.0,"p_mg_100g":270.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Infant, with iron, powder, with Ara and Dha","kcal_100g":511.0,"k_mg_100g":560.0,"mg_mg_100g":41.0,"p_mg_100g":270.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Infant, with iron, liquid concentrate, with Ara and Dha, reconstit","kcal_100g":68.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":28.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil Lipil, with iron, ready-to-feed, with Ara and Dha","kcal_100g":64.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":35.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Lipil, low iron, ready to feed, with Ara and Dha","kcal_100g":64.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":35.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Infant, ready-to-feed, with Ara and Dha","kcal_100g":68.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":28.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, PM 60/40, powder not reconstituted","kcal_100g":524.0,"k_mg_100g":411.0,"mg_mg_100g":31.0,"p_mg_100g":144.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Nutramigen With Lgg, with iron, powder, not reconstituted, with Ar","kcal_100g":514.0,"k_mg_100g":560.0,"mg_mg_100g":40.0,"p_mg_100g":260.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Nutramigen, with iron, ready-to-feed, with Ara and Dha","kcal_100g":68.0,"k_mg_100g":72.0,"mg_mg_100g":5.0,"p_mg_100g":34.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Alimentum, with iron, ready-to-feed","kcal_100g":66.0,"k_mg_100g":77.0,"mg_mg_100g":5.0,"p_mg_100g":49.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Enfacare, with iron, powder, with Ara and Dha","kcal_100g":505.0,"k_mg_100g":520.0,"mg_mg_100g":40.0,"p_mg_100g":330.0,"isPowder":true,"tags":["formula"]},
{"name":"Similac, with iron, liquid concentrate, not reconstituted","kcal_100g":127.0,"k_mg_100g":134.0,"mg_mg_100g":8.0,"p_mg_100g":54.0,"isPowder":false,"tags":["formula"]},
{"name":"Child Pediasure, ready-to-feed","kcal_100g":99.0,"k_mg_100g":125.0,"mg_mg_100g":19.0,"p_mg_100g":76.0,"isPowder":false,"tags":[]},
{"name":"Next Step, Prosobee Lipil, powder, with Ara and Dha","kcal_100g":480.0,"k_mg_100g":570.0,"mg_mg_100g":52.0,"p_mg_100g":620.0,"isPowder":true,"tags":[]},
{"name":"Next Step, Prosobee, Lipil, ready to feed, with Ara and Dha","kcal_100g":67.0,"k_mg_100g":79.0,"mg_mg_100g":7.0,"p_mg_100g":85.0,"isPowder":false,"tags":[]},
{"name":"Good Start Soy, with Ara and Dha, powder","kcal_100g":503.0,"k_mg_100g":581.0,"mg_mg_100g":55.0,"p_mg_100g":316.0,"isPowder":true,"tags":["formula"]},
{"name":"Corn and sweet potatoes, strained","kcal_100g":68.0,"k_mg_100g":154.0,"mg_mg_100g":10.0,"p_mg_100g":29.0,"isPowder":false,"tags":[]},
{"name":"Similac, Alimentum, Advance, ready-to-feed, with Ara and Dha","kcal_100g":67.0,"k_mg_100g":77.0,"mg_mg_100g":5.0,"p_mg_100g":49.0,"isPowder":false,"tags":["formula"]},
{"name":"Store brand, ready-to-feed","kcal_100g":63.0,"k_mg_100g":55.0,"mg_mg_100g":5.0,"p_mg_100g":28.0,"isPowder":false,"tags":[]},
{"name":"Store brand, liquid concentrate, not reconstituted","kcal_100g":130.0,"k_mg_100g":109.0,"mg_mg_100g":9.0,"p_mg_100g":55.0,"isPowder":false,"tags":[]},
{"name":"Enfamil, AR, ready-to-feed, with Ara and Dha","kcal_100g":71.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":35.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, AR, powder, with Ara and Dha","kcal_100g":504.0,"k_mg_100g":540.0,"mg_mg_100g":40.0,"p_mg_100g":260.0,"isPowder":true,"tags":["formula"]},
{"name":"Similac Neosure, ready-to-feed, with Ara and Dha","kcal_100g":69.0,"k_mg_100g":97.0,"mg_mg_100g":6.0,"p_mg_100g":42.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Neosure, powder, with Ara and Dha","kcal_100g":520.0,"k_mg_100g":731.0,"mg_mg_100g":46.0,"p_mg_100g":319.0,"isPowder":true,"tags":["formula"]},
{"name":"Similac, Sensitive (Lactose Free) ready-to-feed, with Ara and Dha","kcal_100g":68.0,"k_mg_100g":74.0,"mg_mg_100g":3.0,"p_mg_100g":39.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Advance, with iron, liquid concentrate, not reconstituted","kcal_100g":127.0,"k_mg_100g":134.0,"mg_mg_100g":8.0,"p_mg_100g":54.0,"isPowder":false,"tags":["formula"]},
{"name":"Clif Z bar","kcal_100g":416.0,"k_mg_100g":333.0,"mg_mg_100g":82.0,"p_mg_100g":244.0,"isPowder":false,"tags":[]},
{"name":"Juice treats, fruit medley, toddler","kcal_100g":347.0,"k_mg_100g":54.0,"mg_mg_100g":7.0,"p_mg_100g":9.0,"isPowder":false,"tags":["juice","fruit","toddler"]},
{"name":"Meat, beef, strained","kcal_100g":81.0,"k_mg_100g":187.0,"mg_mg_100g":11.0,"p_mg_100g":93.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, ham, junior","kcal_100g":97.0,"k_mg_100g":210.0,"mg_mg_100g":11.0,"p_mg_100g":89.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, lamb, strained","kcal_100g":94.0,"k_mg_100g":193.0,"mg_mg_100g":13.0,"p_mg_100g":104.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, lamb, junior","kcal_100g":112.0,"k_mg_100g":211.0,"mg_mg_100g":10.0,"p_mg_100g":91.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, chicken, strained","kcal_100g":130.0,"k_mg_100g":141.0,"mg_mg_100g":13.0,"p_mg_100g":97.0,"isPowder":false,"tags":["meat"]},
{"name":"Meat, turkey sticks, junior","kcal_100g":188.0,"k_mg_100g":120.0,"mg_mg_100g":10.0,"p_mg_100g":120.0,"isPowder":false,"tags":["meat"]},
{"name":"Snack, Gerber Graduate Fruit Strips, Real Fruit Bars","kcal_100g":330.0,"k_mg_100g":312.0,"mg_mg_100g":9.0,"p_mg_100g":23.0,"isPowder":false,"tags":["fruit"]},
{"name":"Meat, meat sticks, junior","kcal_100g":184.0,"k_mg_100g":114.0,"mg_mg_100g":11.0,"p_mg_100g":103.0,"isPowder":false,"tags":["meat"]},
{"name":"Gerber, 2nd Foods, apple, carrot and squash, organic","kcal_100g":64.0,"k_mg_100g":106.0,"mg_mg_100g":5.0,"p_mg_100g":17.0,"isPowder":false,"tags":[]},
{"name":"Dinner, vegetables and dumplings and beef, junior","kcal_100g":48.0,"k_mg_100g":47.0,"mg_mg_100g":7.0,"p_mg_100g":29.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, beef lasagna, toddler","kcal_100g":77.0,"k_mg_100g":122.0,"mg_mg_100g":11.0,"p_mg_100g":40.0,"isPowder":false,"tags":["meat","dinner","toddler"]},
{"name":"Dinner, macaroni and tomato and beef, strained","kcal_100g":61.0,"k_mg_100g":112.0,"mg_mg_100g":12.0,"p_mg_100g":39.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, macaroni and tomato and beef, junior","kcal_100g":59.0,"k_mg_100g":72.0,"mg_mg_100g":7.0,"p_mg_100g":44.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, spaghetti and tomato and meat, junior","kcal_100g":68.0,"k_mg_100g":122.0,"mg_mg_100g":11.0,"p_mg_100g":35.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, spaghetti and tomato and meat, toddler","kcal_100g":75.0,"k_mg_100g":163.0,"mg_mg_100g":15.0,"p_mg_100g":45.0,"isPowder":false,"tags":["meat","dinner","toddler"]},
{"name":"Dinner, vegetables and beef, strained","kcal_100g":77.0,"k_mg_100g":145.0,"mg_mg_100g":10.0,"p_mg_100g":33.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, vegetables and beef, junior","kcal_100g":77.0,"k_mg_100g":145.0,"mg_mg_100g":10.0,"p_mg_100g":33.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, chicken soup, strained","kcal_100g":50.0,"k_mg_100g":66.0,"mg_mg_100g":5.0,"p_mg_100g":24.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, chicken stew, toddler","kcal_100g":78.0,"k_mg_100g":92.0,"mg_mg_100g":10.0,"p_mg_100g":51.0,"isPowder":false,"tags":["meat","dinner","toddler"]},
{"name":"Dinner, vegetables chicken, strained","kcal_100g":59.0,"k_mg_100g":158.0,"mg_mg_100g":14.0,"p_mg_100g":47.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, vegetables, noodles and chicken, strained","kcal_100g":63.0,"k_mg_100g":55.0,"mg_mg_100g":10.0,"p_mg_100g":31.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, turkey and rice, junior","kcal_100g":56.0,"k_mg_100g":86.0,"mg_mg_100g":9.0,"p_mg_100g":37.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Dinner, vegetables and turkey, strained","kcal_100g":48.0,"k_mg_100g":102.0,"mg_mg_100g":13.0,"p_mg_100g":44.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, vegetables and turkey, junior","kcal_100g":53.0,"k_mg_100g":98.0,"mg_mg_100g":9.0,"p_mg_100g":32.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, macaroni and cheese, strained","kcal_100g":67.0,"k_mg_100g":67.0,"mg_mg_100g":8.0,"p_mg_100g":86.0,"isPowder":false,"tags":["dinner"]},
{"name":"Vegetable, green beans and potatoes","kcal_100g":62.0,"k_mg_100g":148.0,"mg_mg_100g":20.0,"p_mg_100g":61.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, beets, strained","kcal_100g":34.0,"k_mg_100g":182.0,"mg_mg_100g":14.0,"p_mg_100g":14.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, carrots, strained","kcal_100g":26.0,"k_mg_100g":196.0,"mg_mg_100g":9.0,"p_mg_100g":20.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Vegetables, carrots, junior","kcal_100g":32.0,"k_mg_100g":202.0,"mg_mg_100g":11.0,"p_mg_100g":20.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Potatoes, toddler","kcal_100g":52.0,"k_mg_100g":110.0,"mg_mg_100g":15.0,"p_mg_100g":23.0,"isPowder":false,"tags":["toddler"]},
{"name":"Cereal, Oatmeal, dry, Gerber, Single Grain, fortified","kcal_100g":396.0,"k_mg_100g":597.0,"mg_mg_100g":109.0,"p_mg_100g":459.0,"isPowder":false,"tags":["cereal"]},
{"name":"Vegetable, butternut squash and corn","kcal_100g":50.0,"k_mg_100g":352.0,"mg_mg_100g":26.0,"p_mg_100g":35.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Apples, dices, toddler","kcal_100g":50.0,"k_mg_100g":86.0,"mg_mg_100g":4.0,"p_mg_100g":8.0,"isPowder":false,"tags":["toddler"]},
{"name":"Fruit, applesauce, strained","kcal_100g":41.0,"k_mg_100g":71.0,"mg_mg_100g":3.0,"p_mg_100g":7.0,"isPowder":false,"tags":["fruit"]},
{"name":"Dinner, vegetables and chicken, junior","kcal_100g":53.0,"k_mg_100g":83.0,"mg_mg_100g":8.0,"p_mg_100g":32.0,"isPowder":false,"tags":["vegetable","meat","dinner"]},
{"name":"Dinner, mixed vegetable, strained","kcal_100g":41.0,"k_mg_100g":121.0,"mg_mg_100g":11.0,"p_mg_100g":24.0,"isPowder":false,"tags":["vegetable","dinner"]},
{"name":"Vegetables, mix vegetables strained","kcal_100g":36.0,"k_mg_100g":127.0,"mg_mg_100g":10.0,"p_mg_100g":22.0,"isPowder":false,"tags":["vegetable"]},
{"name":"Dinner, beef noodle, junior","kcal_100g":57.0,"k_mg_100g":46.0,"mg_mg_100g":7.0,"p_mg_100g":30.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Apples with ham, strained","kcal_100g":62.0,"k_mg_100g":120.0,"mg_mg_100g":7.0,"p_mg_100g":34.0,"isPowder":false,"tags":["meat"]},
{"name":"Carrots and beef, strained","kcal_100g":59.0,"k_mg_100g":226.0,"mg_mg_100g":13.0,"p_mg_100g":45.0,"isPowder":false,"tags":["meat"]},
{"name":"Beverage, Gerber, Graduates, Fruit Splashers","kcal_100g":29.0,"k_mg_100g":22.0,"mg_mg_100g":3.0,"p_mg_100g":3.0,"isPowder":false,"tags":["fruit"]},
{"name":"Snack, Gerber, Graduates, Yogurt Melts","kcal_100g":380.0,"k_mg_100g":714.0,"mg_mg_100g":53.0,"p_mg_100g":382.0,"isPowder":false,"tags":["dessert"]},
{"name":"Dinner, sweet potatoes and chicken, strained","kcal_100g":74.0,"k_mg_100g":200.0,"mg_mg_100g":13.0,"p_mg_100g":25.0,"isPowder":false,"tags":["meat","dinner"]},
{"name":"Enfamil 24, ready to feed, with Ara and Dha","kcal_100g":71.0,"k_mg_100g":84.0,"mg_mg_100g":6.0,"p_mg_100g":34.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil Enspire Powder, with Ara and Dha, not reconstituted","kcal_100g":514.0,"k_mg_100g":540.0,"mg_mg_100g":40.0,"p_mg_100g":220.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil Reguline, ready to feed, with Ara and Dha","kcal_100g":68.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":30.0,"isPowder":false,"tags":["formula"]},
{"name":"Gentlease, ready to feed, with Ara and Dha","kcal_100g":68.0,"k_mg_100g":84.0,"mg_mg_100g":5.0,"p_mg_100g":34.0,"isPowder":false,"tags":[]},
{"name":"Toddler Nutramigen Toddler with Lgg Powder, with Ara and Dha, not reconstit","kcal_100g":485.0,"k_mg_100g":590.0,"mg_mg_100g":48.0,"p_mg_100g":350.0,"isPowder":true,"tags":["formula","toddler"]},
{"name":"Pregestimil 20 Calories, ready to feed, with Ara and Dha","kcal_100g":69.0,"k_mg_100g":72.0,"mg_mg_100g":5.0,"p_mg_100g":34.0,"isPowder":false,"tags":[]},
{"name":"Cereal, high protein, prepared with whole milk","kcal_100g":111.0,"k_mg_100g":349.0,"mg_mg_100g":48.0,"p_mg_100g":177.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, mixed, prepared with whole milk","kcal_100g":96.0,"k_mg_100g":166.0,"mg_mg_100g":20.0,"p_mg_100g":118.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, mixed, with bananas, prepared with whole milk","kcal_100g":86.0,"k_mg_100g":178.0,"mg_mg_100g":18.0,"p_mg_100g":111.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, oatmeal, prepared with whole milk","kcal_100g":116.0,"k_mg_100g":204.0,"mg_mg_100g":35.0,"p_mg_100g":160.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, mixed, with honey, prepared with whole milk","kcal_100g":115.0,"k_mg_100g":171.0,"mg_mg_100g":28.0,"p_mg_100g":184.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, high protein, with apple and orange, prepared with whole milk","kcal_100g":112.0,"k_mg_100g":346.0,"mg_mg_100g":37.0,"p_mg_100g":166.0,"isPowder":false,"tags":["cereal"]},
{"name":"Cereal, rice, with bananas, prepared with whole milk","kcal_100g":86.0,"k_mg_100g":180.0,"mg_mg_100g":20.0,"p_mg_100g":109.0,"isPowder":false,"tags":["cereal"]},
{"name":"Good Start Supreme, with iron, liquid concentrate, not reconstituted","kcal_100g":127.0,"k_mg_100g":137.0,"mg_mg_100g":9.0,"p_mg_100g":46.0,"isPowder":false,"tags":["formula"]},
{"name":"Good Start Supreme, with iron, powder","kcal_100g":509.0,"k_mg_100g":553.0,"mg_mg_100g":36.0,"p_mg_100g":184.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Lipil, low iron, liquid concentrate, with Ara and Dha","kcal_100g":131.0,"k_mg_100g":142.0,"mg_mg_100g":11.0,"p_mg_100g":70.0,"isPowder":false,"tags":["formula"]},
{"name":"Pregestimil, with iron, powder, with Ara and Dha, not reconstituted","kcal_100g":517.0,"k_mg_100g":550.0,"mg_mg_100g":40.0,"p_mg_100g":260.0,"isPowder":true,"tags":[]},
{"name":"Pregestimil, with iron, with Ara and Dha, prepared from powder","kcal_100g":67.0,"k_mg_100g":73.0,"mg_mg_100g":5.0,"p_mg_100g":34.0,"isPowder":true,"tags":[]},
{"name":"Prosobee, with iron, ready-to-feed","kcal_100g":63.0,"k_mg_100g":79.0,"mg_mg_100g":7.0,"p_mg_100g":54.0,"isPowder":false,"tags":[]},
{"name":"Similac, Isomil, with iron, ready-to-feed","kcal_100g":66.0,"k_mg_100g":71.0,"mg_mg_100g":5.0,"p_mg_100g":49.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Isomil, with iron, liquid concentrate","kcal_100g":128.0,"k_mg_100g":138.0,"mg_mg_100g":10.0,"p_mg_100g":96.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Isomil, with iron, powder, not reconstituted","kcal_100g":517.0,"k_mg_100g":555.0,"mg_mg_100g":39.0,"p_mg_100g":386.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Nutramigen, with iron, liquid concentrate not reconstituted, with ","kcal_100g":68.0,"k_mg_100g":72.0,"mg_mg_100g":5.0,"p_mg_100g":34.0,"isPowder":false,"tags":["formula"]},
{"name":"Enfamil, Prosobee, with iron, powder, not reconstituted, with Ara and Dha","kcal_100g":512.0,"k_mg_100g":610.0,"mg_mg_100g":41.0,"p_mg_100g":350.0,"isPowder":true,"tags":["formula"]},
{"name":"Similac, with iron, powder, not reconstituted","kcal_100g":522.0,"k_mg_100g":552.0,"mg_mg_100g":32.0,"p_mg_100g":221.0,"isPowder":true,"tags":["formula"]},
{"name":"Enfamil, Prosobee, liquid concentrate, reconstituted, with Ara and Dha","kcal_100g":67.0,"k_mg_100g":78.0,"mg_mg_100g":5.0,"p_mg_100g":45.0,"isPowder":false,"tags":["formula"]},
{"name":"Prosobee, with iron, ready to feed, with Ara and Dha","kcal_100g":64.0,"k_mg_100g":79.0,"mg_mg_100g":5.0,"p_mg_100g":45.0,"isPowder":false,"tags":[]},
{"name":"Good Start Soy, with Dha and Ara, ready-to-feed","kcal_100g":64.0,"k_mg_100g":74.0,"mg_mg_100g":7.0,"p_mg_100g":41.0,"isPowder":false,"tags":["formula"]},
{"name":"Child Pediasure, ready-to-feed, with iron and fiber","kcal_100g":99.0,"k_mg_100g":124.0,"mg_mg_100g":19.0,"p_mg_100g":80.0,"isPowder":false,"tags":[]},
{"name":"Good Start Essentials Soy, with iron, powder","kcal_100g":502.0,"k_mg_100g":581.0,"mg_mg_100g":55.0,"p_mg_100g":316.0,"isPowder":true,"tags":["formula"]},
{"name":"Next Step Prosobee, powder, not reconstituted","kcal_100g":480.0,"k_mg_100g":570.0,"mg_mg_100g":52.0,"p_mg_100g":620.0,"isPowder":true,"tags":[]},
{"name":"Next Step Prosobee, prepared from powder","kcal_100g":67.0,"k_mg_100g":79.0,"mg_mg_100g":7.0,"p_mg_100g":85.0,"isPowder":true,"tags":[]},
{"name":"Store brand, powder","kcal_100g":524.0,"k_mg_100g":441.0,"mg_mg_100g":36.0,"p_mg_100g":221.0,"isPowder":true,"tags":[]},
{"name":"Store brand, soy, ready-to-feed","kcal_100g":63.0,"k_mg_100g":69.0,"mg_mg_100g":7.0,"p_mg_100g":41.0,"isPowder":false,"tags":[]},
{"name":"Store brand, soy, liquid concentrate, not reconstituted","kcal_100g":126.0,"k_mg_100g":138.0,"mg_mg_100g":14.0,"p_mg_100g":82.0,"isPowder":false,"tags":[]},
{"name":"Store brand, soy, powder","kcal_100g":508.0,"k_mg_100g":528.0,"mg_mg_100g":51.0,"p_mg_100g":317.0,"isPowder":true,"tags":[]},
{"name":"Similac, Sensitive, (Lactose Free), liquid concentrate, with Ara and Dha","kcal_100g":128.0,"k_mg_100g":138.0,"mg_mg_100g":8.0,"p_mg_100g":72.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Sensitive, (Lactose Free), powder, with Ara and Dha","kcal_100g":520.0,"k_mg_100g":557.0,"mg_mg_100g":30.0,"p_mg_100g":293.0,"isPowder":true,"tags":["formula"]},
{"name":"Similac, Advance, with iron, ready-to-feed","kcal_100g":66.0,"k_mg_100g":69.0,"mg_mg_100g":4.0,"p_mg_100g":28.0,"isPowder":false,"tags":["formula"]},
{"name":"Similac, Advance, with iron, powder, not reconstituted","kcal_100g":522.0,"k_mg_100g":552.0,"mg_mg_100g":32.0,"p_mg_100g":221.0,"isPowder":true,"tags":["formula"]}
];

// ── Search foods by name fragment (case-insensitive), also matches tags ───
function searchBabyFoods(query) {
  if (!query || query.trim() === "") {
    // Show preferred formulas pinned at top
    var prefs = settingsPreferredFormulas();
    var pinned = [];
    if (prefs.length) {
      prefs.forEach(function(name) {
        var f = babyFoodByName(name);
        if (f) pinned.push(f);
      });
    }
    var rest = BABY_FOODS.filter(function(f) {
      return pinned.indexOf(f) === -1;
    }).slice(0, 60 - pinned.length);
    return pinned.concat(rest);
  }
  var q = query.toLowerCase();
  return BABY_FOODS.filter(function(f) {
    return f.name.toLowerCase().indexOf(q) !== -1 ||
      f.tags.some(function(t) { return t.indexOf(q) !== -1; });
  }).slice(0, 40);
}

// ── Get a food by exact name ──────────────────────────────────────────────
function babyFoodByName(name) {
  for (var i = 0; i < BABY_FOODS.length; i++) {
    if (BABY_FOODS[i].name === name) return BABY_FOODS[i];
  }
  return null;
}

// ── Feeding amount calculator (with daily electrolyte totals) ─────────────
function calcFeedingAmount(food, targetKcalPerDay, frequency) {
  if (!food || !isFinite(targetKcalPerDay) || targetKcalPerDay <= 0) return null;
  if (!frequency || frequency < 1) frequency = 3;

  var kcalPerG = food.kcal_100g / 100;
  var gramsPerDay = targetKcalPerDay / kcalPerG;
  var gramsPerFeed = gramsPerDay / frequency;
  var ozPerFeed = gramsPerFeed / 28.35;
  var mLPerFeed = gramsPerFeed;

  var freqLabels = {3: "TID", 4: "QID", 6: "q4h", 8: "q3h", 12: "q2h"};
  var freqLabel = freqLabels[frequency] || ("q" + Math.round(24/frequency) + "h x " + frequency);

  // Daily electrolyte totals (mg/day) from the grams fed
  var result = {
    foodName: food.name,
    kcalPer100g: food.kcal_100g,
    isPowder: !!food.isPowder,
    targetKcalPerDay: Math.round(targetKcalPerDay),
    frequency: frequency,
    frequencyLabel: freqLabel,
    gramsPerDay: Math.round(gramsPerDay),
    gramsPerFeed: Math.round(gramsPerFeed),
    ozPerFeed: ozPerFeed,
    ozPerFeedRounded: ozPerFeed < 1 ? ozPerFeed.toFixed(1) : (Math.round(ozPerFeed) || "1"),
    mLPerFeed: Math.round(mLPerFeed)
  };

  // Daily electrolyte totals in mg
  if (isFinite(food.k_mg_100g))
    result.kMgPerDay = Math.round(gramsPerDay * food.k_mg_100g / 100);
  if (isFinite(food.mg_mg_100g))
    result.mgMgPerDay = Math.round(gramsPerDay * food.mg_mg_100g / 100);
  if (isFinite(food.p_mg_100g))
    result.pMgPerDay = Math.round(gramsPerDay * food.p_mg_100g / 100);

  return result;
}

// ── Render feeding amount as HTML (with electrolytes) ─────────────────────
function renderFeedingAmount(result) {
  if (!result) return "";
  var h = '<p><strong>' + escapeHtml(result.foodName) + '</strong> — ' +
    result.kcalPer100g + ' kcal/100g';
  if (result.isPowder) h += ' <span class="badge muted">powder</span>';
  h += '</p>';
  h += '<p>To meet <strong>' + result.targetKcalPerDay + ' kcal/day</strong> (' + result.frequencyLabel + '):</p>';
  h += '<ul style="font-size:.85rem;margin-bottom:.35rem">';
  h += '<li>' + result.gramsPerFeed + ' g per feed (' + result.gramsPerDay + ' g/day)</li>';
  h += '<li>' + result.ozPerFeedRounded + ' oz per feed</li>';
  h += '<li>' + result.mLPerFeed + ' mL per feed</li>';
  h += '</ul>';

  // Electrolyte totals
  var elec = [];
  if (isFinite(result.kMgPerDay)) elec.push('K ' + result.kMgPerDay + ' mg/day');
  if (isFinite(result.mgMgPerDay)) elec.push('Mg ' + result.mgMgPerDay + ' mg/day');
  if (isFinite(result.pMgPerDay)) elec.push('P ' + result.pMgPerDay + ' mg/day');
  if (elec.length) {
    h += '<p style="font-size:.8rem;margin:0;color:var(--muted)">Daily electrolytes: ' + elec.join(', ') + '</p>';
  }

  if (result.isPowder) {
    h += '<p class="disclaimer" style="font-size:.7rem;margin-top:.2rem">Powder — reconstitute per label. Amounts shown are for prepared formula.</p>';
  }
  return h;
}

// ── Build a one-line feeding plan string for the EMR note ─────────────────
function feedingPlanString(food, targetKcalPerDay, frequency) {
  if (!food) return null;
  if (!isFinite(targetKcalPerDay) || targetKcalPerDay <= 0) {
    // No kcal target available — show food name + frequency only
    var freqLabels = {3: "TID", 4: "QID", 6: "q4h", 8: "q3h", 12: "q2h"};
    var fl = freqLabels[frequency || 3] || ("q" + Math.round(24/(frequency||3)) + "h");
    return food.name + " (" + fl + ") — kcal target needed for amounts";
  }
  var r = calcFeedingAmount(food, targetKcalPerDay, frequency);
  if (!r) return null;
  var s = r.foodName + ", " + r.ozPerFeedRounded + " oz (" + r.mLPerFeed + " mL) " + r.frequencyLabel;
  // Append electrolytes if available
  var elec = [];
  if (isFinite(r.kMgPerDay)) elec.push("K " + r.kMgPerDay + " mg");
  if (isFinite(r.mgMgPerDay)) elec.push("Mg " + r.mgMgPerDay + " mg");
  if (isFinite(r.pMgPerDay)) elec.push("P " + r.pMgPerDay + " mg");
  if (elec.length) s += " (" + elec.join(", ") + "/day)";
  return s;
}
