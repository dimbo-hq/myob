#!/usr/bin/env python3
"""
Procedural Supermarket Dataset Generator for myob Retail OS (India Edition / INR ₹).
Generates randomized, authentic retail inventory datasets of any scale (500 to 100,000+ items).
"""

import os
import csv
import random
import argparse
from datetime import datetime, timedelta

# Rich vocabulary for high-cardinality procedural generation
ADJECTIVES = [
    'Organic', 'Artisan', 'Handcrafted', 'Farm-Fresh', 'Premium', 'Natural', 
    'Select', 'Signature', 'Gourmet', 'Crisp', 'Sweet', 'Rustic', 'Heritage',
    'Pure', 'Raw', 'Desi', 'Grass-Fed', 'Free-Range', 'Smoked', 'Roasted',
    'Gluten-Free', 'Plant-Based', 'Zero-Sugar', 'Low-Sodium', 'Extra-Virgin',
    'Cold-Pressed', 'Spiced', 'Cured', 'Aged', 'Traditional', 'Homestyle',
    'Sun-Dried', 'Stone-Ground', 'Whole-Grain', 'Unpolished', 'Authentic',
    'Royal', 'Golden', 'Valley Fresh', 'Wildcrafted', 'Country Style'
]

FLAVORS_VARIETIES = [
    'Alphonso Mango', 'Kashmiri Saffron', 'Cardamom Spiced', 'Sea Salt', 'Garlic & Herb',
    'Smoked Paprika', 'Dark Chocolate', 'Vanilla Bean', 'Pista Almond', 'Rose Infused',
    'Masala Chai', 'Caramelized Onion', 'Matcha Green Tea', 'Mint Lime',
    'Nagpur Orange', 'Golden Ginger', 'Cinnamon Spice', 'Truffle Infused',
    'Jalapeno Lime', 'Kesar Pista', 'Toasted Sesame', 'Coconut Cream', 'Kachi Ghani Mustard',
    'Red Chilli & Garlic', 'Tandoori Smoked', 'Lemon Pepper', 'Ajwain & Jeera',
    'Tulsi Honey', 'Makhana Crunch', 'Sweet Tamarind', 'Chatpata Masala'
]

SIZES_PACKAGING = [
    '50g', '100g', '150g', '200g', '250g', '300g', '350g', '400g', '500g', '750g', '1kg', '2kg', '5kg', '10kg',
    '150ml', '200ml', '250ml', '330ml', '500ml', '750ml', '1L', '1.5L', '2L', '5L',
    '2-Pack', '4-Pack', '6-Pack', '8-Pack', '10-Pack', '12-Pack', '24-Pack', 'Family Pack', 'Value Pack', 'Snack Pack'
]

DEPARTMENTS = {
    'Fresh Produce': {
        'nouns': [
            'Apples', 'Bananas', 'Avocados', 'Roma Tomatoes', 'Baby Spinach',
            'Blueberries', 'Strawberries', 'Yukon Gold Potatoes', 'Red Onions',
            'Cucumbers', 'Bell Peppers', 'Portobello Mushrooms', 'Broccoli Crowns',
            'Watermelon', 'Seedless Grapes', 'Lemons', 'Carrots', 'Palak Leaves', 'Fresh Methi',
            'Pomegranates', 'Bottle Gourd (Lauki)', 'Pineapples', 'Alphonso Mangoes', 'Papayas',
            'Green Chillies', 'Ginger Root', 'Garlic Bulbs', 'Cauliflower', 'Green Peas Fresh',
            'Ladyfinger (Bhindi)', 'Sweet Potatoes', 'Fresh Mint (Pudina)', 'Coriander Leaves',
            'Custard Apple (Sitaphal)', 'Guavas', 'Oranges Nagpur', 'Pears', 'Bitter Gourd (Karela)'
        ],
        'units': ['kg', 'bunch', 'pack', 'pcs', 'bag'],
        'temp_zone': ['ambient', 'chilled'],
        'cost_range': (15.0, 160.0),
        'shelf_range': (2, 21),
        'aisles': ['Aisle 01', 'Aisle 02']
    },
    'Dairy & Eggs': {
        'nouns': [
            'Cow Milk', 'Buffalo Milk', 'Oat Milk', 'Almond Milk', 'Greek Yogurt',
            'Desi Cow Ghee', 'Salted Butter', 'Unsalted White Butter', 'Paneer Block', 'Pasture Eggs',
            'Heavy Cream', 'Cream Cheese', 'Mozzarella Shredded', 'Curd Tub (Dahi)', 'Chaash / Buttermilk',
            'Gouda Block', 'Parmigiano-Reggiano', 'Feta Cheese', 'Toned Milk', 'Double Toned Milk',
            'Flavored Yogurt', 'Soy Milk Protein', 'Lassi Mango Infused', 'Mishri Mawa', 'Ricotta Fresh'
        ],
        'units': ['bottle', 'carton', 'tub', 'pack', 'box', 'packet'],
        'temp_zone': ['chilled'],
        'cost_range': (28.0, 520.0),
        'shelf_range': (3, 30),
        'aisles': ['Aisle 02', 'Aisle 03']
    },
    'Bakery & Deli': {
        'nouns': [
            'Sourdough Loaf', 'Pav 6-Pack', 'Whole Wheat Atta Bread', 'Butter Croissants',
            'Brioche Burger Buns', 'Rusk Toast', 'Fruit Muffins', 'Garlic Focaccia', 'Pita Bread',
            'Multigrain Tortillas', 'Smoked Chicken Slices', 'Paneer Tikka Deli', 'Chicken Salami',
            'Chicken Frankfurters', 'Kulcha 4-Pack', 'Ciabatta Roll', 'Cinnamon Swirl Buns',
            'Brownie Bites', 'Bagel Plain 4pk', 'Lavash Crackers', 'Fruit Cake Slice', 'Cheese Croissant'
        ],
        'units': ['pcs', 'pack', 'box'],
        'temp_zone': ['ambient', 'chilled'],
        'cost_range': (25.0, 320.0),
        'shelf_range': (1, 14),
        'aisles': ['Aisle 03', 'Aisle 04']
    },
    'Meat & Seafood': {
        'nouns': [
            'Fresh Chicken Curry Cut', 'Boneless Chicken Breast', 'Mutton Curry Cut',
            'Fresh Rohu Fish', 'Atlantic Salmon Fillet', 'Tiger Prawns Jumbo',
            'Surmai Steaks', 'Chicken Keema', 'Chicken Sausages', 'Mutton Chops',
            'Crab Meat Fresh', 'Pomfret Whole', 'Catla Fish Steaks', 'Goat Mince Premium',
            'Basa Fish Fillets', 'Squid Rings Cleaned', 'Chicken Drumsticks'
        ],
        'units': ['pack', 'kg', 'pcs'],
        'temp_zone': ['chilled'],
        'cost_range': (140.0, 950.0),
        'shelf_range': (2, 7),
        'aisles': ['Aisle 04', 'Aisle 05']
    },
    'Beverages': {
        'nouns': [
            'Cold Brew Coffee', 'Sparkling Mineral Water', 'Tender Coconut Water',
            'Organic Green Tea', 'Ginger Kombucha', 'Fresh Mosambi Juice', 'Filter Coffee Beans',
            'Masala CTC Tea', 'Electrolyte Energy Drink', 'Nimbu Paani Soda', 'Amla Juice Pure',
            'Badam Milk Drink', 'Tonic Water Premium', 'Himalayan Spring Water', 'Iced Lemon Tea',
            'Apple Cider Vinegar Drink', 'Kokum Sharbat', 'Jeera Masala Soda', 'Chamomile Herbal Tea',
            'Espresso Roast Ground Coffee', 'Guava Chilli Juice', 'Cold Pressed Orange Juice'
        ],
        'units': ['can', 'bottle', 'carton', 'bag', 'box', 'pack'],
        'temp_zone': ['ambient', 'chilled'],
        'cost_range': (20.0, 450.0),
        'shelf_range': (14, 365),
        'aisles': ['Aisle 05', 'Aisle 06']
    },
    'Pantry & Dry Goods': {
        'nouns': [
            'Mustard Oil Kachi Ghani', 'Cold-Pressed Groundnut Oil', 'Extra Virgin Olive Oil',
            'Royal Basmati Rice', 'Penne Rigate Pasta', 'Toor Dal Premium', 'Moong Dal Washed',
            'Organic Rolled Oats', 'Raw Wildflower Honey', 'Organic Sharbati Atta',
            'Pink Himalayan Salt', 'Kabuli Chana Large', 'Pure Jaggery Powder (Gud)', 'Lentils Red Masoor',
            'Urad Dal Whole', 'Chana Dal Polished', 'Poha Thick Flakes', 'Rawa Sooji',
            'Coconut Milk Canned', 'Cashew Paste Curry Base', 'Organic Brown Sugar', 'Sona Masoori Rice'
        ],
        'units': ['bottle', 'bag', 'box', 'can', 'jar', 'packet'],
        'temp_zone': ['ambient'],
        'cost_range': (30.0, 750.0),
        'shelf_range': (90, 720),
        'aisles': ['Aisle 06', 'Aisle 07', 'Aisle 08']
    },
    'Frozen Foods': {
        'nouns': [
            'Frozen Green Peas', 'Wood-Fired Veggie Pizza', 'Alphonso Kulfi Tub', 'Frozen Paneer Cubes',
            'Veg Spring Rolls', 'Aloo Tikki 8-Pack', 'Frozen Samosas', 'French Fries Crispy',
            'Edamame Pods', 'Malai Kulfi Bar', 'Frozen Veg Momos', 'Veg Burger Patties',
            'Fish Fingers Frozen', 'Sweet Corn Kernels', 'Garlic Naan Frozen 4pk',
            'Paneer Paratha Frozen', 'Mixed Berries Frozen', 'Hash Browns 6pk'
        ],
        'units': ['bag', 'box', 'tub', 'pack', 'packet'],
        'temp_zone': ['frozen'],
        'cost_range': (45.0, 420.0),
        'shelf_range': (60, 365),
        'aisles': ['Aisle 08', 'Aisle 09']
    },
    'Snacks & Confectionery': {
        'nouns': [
            'Masala Potato Chips', 'Roasted Makhana Foxnuts', '70% Dark Chocolate Bar',
            'Roasted Salted Cashews', 'California Almonds', 'Moong Dal Namkeen', 'Bhujia Sev',
            'Banana Chips Kerala Style', 'Granola Health Bars', 'Dry Fruits Trail Mix',
            'Kaju Katli Sweet Box', 'Gourmet Cookies Choco-Chip', 'Soan Papdi Box',
            'Spicy Peanut Chikki', 'Butter Murukku', 'Diet Mixture Namkeen', 'Gulab Jamun Tin'
        ],
        'units': ['bag', 'bar', 'box', 'tub', 'pack', 'packet'],
        'temp_zone': ['ambient'],
        'cost_range': (18.0, 550.0),
        'shelf_range': (45, 300),
        'aisles': ['Aisle 09', 'Aisle 10']
    },
    'Household & Personal Care': {
        'nouns': [
            'Liquid Laundry Detergent', 'Dishwash Gel Lemon', 'Kitchen Paper Towels 4-Roll',
            'Herbal Hand Wash Neem', 'Clove & Mint Toothpaste', 'Bath Tissue 6-Pack',
            'Surface Floor Cleaner Rose', 'Biodegradable Garbage Bags', 'Ayurvedic Bath Soap',
            'Shampoo Anti-Dandruff', 'Mosquito Vaporizer Refill', 'Floor Disinfectant Pine',
            'Fabric Softener Floral', 'Stainless Steel Scrubber 3pk', 'Bamboo Toothbrush 2pk'
        ],
        'units': ['bottle', 'pack', 'tube', 'box', 'packet'],
        'temp_zone': ['ambient'],
        'cost_range': (30.0, 600.0),
        'shelf_range': (180, 1000),
        'aisles': ['Aisle 11', 'Aisle 12']
    }
}

BRAND_PREFIXES = [
    'Himalayan', 'Patanjali', 'Amul', 'Tata', 'Pashmina', 'Heritage', 'Ganga', 'Pure Vedic',
    'Kaveri', 'Green Earth', 'Nature Harvest', 'Royal Indian', 'FarmGold', 'Vedic Fresh',
    'Desi Organics', 'SunBrite', 'Urban Roots', 'Bhoomi', 'Satvik', 'Deccan', 'Nilgiri',
    'Organic Tattva', 'Saffola', 'Mother Dairy', 'Fortune', 'Everest', 'Catch', 'Dabur'
]
BRAND_SUFFIXES = [
    'Farms', 'Organics', 'Foods', 'Naturals', 'Kitchens', 'Botanicals', 'Provisions',
    'Dairy', 'Harvest', 'Milling', 'Springs', 'Goods', 'Agro', 'Co.', 'Mills', 'Plantations'
]

def generate_random_brand():
    return f"{random.choice(BRAND_PREFIXES)} {random.choice(BRAND_SUFFIXES)}"

def generate_random_name(category_name, dept_data):
    noun = random.choice(dept_data['nouns'])
    adj = random.choice(ADJECTIVES)
    size = random.choice(SIZES_PACKAGING)
    
    if random.random() < 0.55:
        flavor = random.choice(FLAVORS_VARIETIES)
        return f"{adj} {flavor} {noun} {size}"
    else:
        return f"{adj} {noun} {size}"

def generate_dataset_file(output_path, count=3000):
    today = datetime.now()
    departments_list = list(DEPARTMENTS.keys())
    
    # Ensure target folder exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # GS1 India Barcode base (890XXXXXXXXXX)
    barcode_start = 890100000000 + random.randint(10000, 800000)

    headers = ['Name', 'Brand', 'SKU', 'Barcode', 'Category', 'CurrentStock', 'Unit', 'CostPrice', 'SellingPrice', 'ExpiryDate', 'Aisle', 'TempZone']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()

        for i in range(count):
            cat_name = random.choice(departments_list)
            dept = DEPARTMENTS[cat_name]
            
            name = generate_random_name(cat_name, dept)
            brand = generate_random_brand()
            unit = random.choice(dept['units'])
            temp_zone = random.choice(dept['temp_zone'])
            aisle = random.choice(dept['aisles'])
            
            # Formatted unique SKU per category
            cat_code = cat_name[:4].upper().replace('&', '').replace(' ', '')
            sku = f"{cat_code}-{i+1:06d}"
            
            # Unique 12-13 digit Indian EAN Barcode
            barcode = str(barcode_start + i + 1)
            
            # Pricing in INR with realistic retail margin (25% - 85%)
            min_cost, max_cost = dept['cost_range']
            cost_price = round(random.uniform(min_cost, max_cost), 2)
            margin = random.uniform(1.25, 1.85)
            selling_price = round(cost_price * margin, 2)
            
            # Stock distribution
            current_stock = random.randint(4, 250)
            
            # Shelf-life & Expiration distribution
            rand_exp = random.random()
            if rand_exp < 0.04:
                days_offset = random.randint(-12, -1) # expired batches for audit
            elif rand_exp < 0.12:
                days_offset = random.randint(0, 3)    # near expiry for dynamic markdown
            else:
                min_shelf, max_shelf = dept['shelf_range']
                days_offset = random.randint(min_shelf, max_shelf)
                
            expiry_date = (today + timedelta(days=days_offset)).strftime('%Y-%m-%d')
            
            writer.writerow({
                'Name': name,
                'Brand': brand,
                'SKU': sku,
                'Barcode': barcode,
                'Category': cat_name,
                'CurrentStock': current_stock,
                'Unit': unit,
                'CostPrice': f"{cost_price:.2f}",
                'SellingPrice': f"{selling_price:.2f}",
                'ExpiryDate': expiry_date,
                'Aisle': aisle,
                'TempZone': temp_zone
            })

    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"✅ Generated {count:,} items -> {output_path} ({file_size_mb:.2f} MB)")

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic retail CSV datasets in INR (₹)")
    parser.add_argument('--sizes', nargs='+', type=int, default=[500, 1000, 2000, 3000, 4000, 5000, 10000, 50000],
                        help="List of dataset sizes to generate")
    parser.add_argument('--dir', type=str, default='datasets',
                        help="Target output directory")
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_dir = os.path.join(project_root, args.dir)
    
    print(f"🚀 Generating synthetic retail datasets into: {target_dir}")
    print(f"📦 Sizes requested: {args.sizes}\n")

    for size in args.sizes:
        filename = f"supermarket_{size}_items.csv"
        filepath = os.path.join(target_dir, filename)
        generate_dataset_file(filepath, count=size)

    print("\n🎉 All synthetic datasets generated successfully!")

if __name__ == '__main__':
    main()
