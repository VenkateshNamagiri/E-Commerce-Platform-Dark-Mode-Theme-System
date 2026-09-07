"""
Populates the database with categories, products, and two starter users.

Run this AFTER creating the schema:
    python seed.py
"""
from flask_bcrypt import Bcrypt
from config import get_db

bcrypt = Bcrypt()

CATEGORIES = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Sports"]

PRODUCTS = [
    # (name, description, price, stock, category, image_url)
    # image_url is None for every seeded product on purpose - real images are
    # uploaded by the admin through the ProductForm's file upload, not linked
    # from a placeholder service. Products will show a "No image" box until
    # an admin edits them and uploads a real picture.
    ("Wireless Headphones", "Over-ear Bluetooth headphones with noise cancellation.", 79.99, 25, "Electronics", None),
    ("Smart Watch", "Fitness tracking smart watch with heart-rate monitor.", 129.99, 15, "Electronics", None),
    ("Bluetooth Speaker", "Portable waterproof speaker with 12-hour battery.", 45.50, 30, "Electronics", None),
    ("USB-C Charging Cable", "6ft braided fast-charging cable.", 9.99, 100, "Electronics", None),
    ("Mechanical Keyboard", "RGB backlit mechanical keyboard, blue switches.", 89.00, 20, "Electronics", None),

    ("Men's Cotton T-Shirt", "Soft breathable cotton crew-neck tee.", 14.99, 60, "Clothing", None),
    ("Women's Denim Jacket", "Classic fit denim jacket.", 54.99, 18, "Clothing", None),
    ("Running Shoes", "Lightweight breathable running shoes.", 69.99, 22, "Clothing", None),
    ("Wool Beanie", "Warm knit beanie for cold weather.", 12.50, 40, "Clothing", None),
    ("Leather Belt", "Genuine leather belt with metal buckle.", 19.99, 35, "Clothing", None),

    ("Non-Stick Frying Pan", "10-inch non-stick frying pan.", 24.99, 28, "Home & Kitchen", None),
    ("Electric Kettle", "1.7L rapid-boil electric kettle.", 32.00, 20, "Home & Kitchen", None),
    ("Memory Foam Pillow", "Contour memory foam pillow for neck support.", 27.50, 26, "Home & Kitchen", None),
    ("4-Slice Toaster", "Stainless steel 4-slice toaster with browning control.", 39.99, 14, "Home & Kitchen", None),
    ("Ceramic Dinner Set", "16-piece ceramic dinnerware set.", 59.99, 10, "Home & Kitchen", None),

    ("The Pragmatic Programmer", "Classic book on software craftsmanship.", 34.99, 12, "Books", None),
    ("Atomic Habits", "Bestselling book on building good habits.", 16.99, 40, "Books", None),
    ("Sci-Fi Short Stories", "Anthology of award-winning sci-fi short stories.", 12.99, 22, "Books", None),

    ("Yoga Mat", "Non-slip 6mm thick yoga mat.", 22.99, 33, "Sports", None),
    ("Adjustable Dumbbell Set", "5-25 lb adjustable dumbbell pair.", 149.99, 8, "Sports", None),
]

USERS = [
    ("Admin User", "admin@example.com", "admin123", "admin"),
    ("Test Customer", "customer@example.com", "customer123", "customer"),
]


def seed():
    db = get_db()
    cur = db.cursor()

    print("Seeding categories...")
    cat_ids = {}
    for name in CATEGORIES:
        cur.execute(
            "INSERT INTO categories (name) VALUES (%s) "
            "ON DUPLICATE KEY UPDATE name = VALUES(name)",
            (name,),
        )
        db.commit()
        cur.execute("SELECT id FROM categories WHERE name = %s", (name,))
        cat_ids[name] = cur.fetchone()[0]

    print("Seeding products...")
    for name, desc, price, stock, category, image_url in PRODUCTS:
        cur.execute("SELECT id FROM products WHERE name = %s", (name,))
        if cur.fetchone():
            continue
        cur.execute("""
            INSERT INTO products (name, description, price, stock, category_id, image_url)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (name, desc, price, stock, cat_ids[category], image_url))
    db.commit()

    print("Seeding users...")
    for name, email, password, role in USERS:
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            continue
        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        cur.execute("""
            INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)
        """, (name, email, hashed, role))
    db.commit()

    cur.close()
    db.close()
    print("\nDone!")
    print("  Admin login:    admin@example.com / admin123")
    print("  Customer login: customer@example.com / customer123")


if __name__ == "__main__":
    seed()
