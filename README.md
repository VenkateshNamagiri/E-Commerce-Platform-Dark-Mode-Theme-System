E-Commerce Product Management System:

A full-stack E-Commerce web application built using React, Flask, MySQL, and Axios.

This project provides product management functionality with a real image upload system. Instead of using randomly generated placeholder image URLs, administrators can upload actual product images that are stored on the Flask server and served back to the React frontend.

🚀 Features:

Admin product management
Add new products
Edit existing products
Delete products
View product details
Product image upload
Instant image preview before upload
Image validation
Unique filenames for uploaded images
Images stored on the Flask server
MySQL database integration
REST API using Flask
React frontend
Axios for API communication
Toast notifications for success and error messages
Responsive product interface
Fallback "No image" display when a product has no image

🛠️ Technologies Used:

Frontend:

React
Axios
JavaScript
HTML
CSS

Backend:

Python
Flask
Flask-CORS
Werkzeug
MySQL Connector
Database
MySQL
File Upload
multipart/form-data
Python uuid
Flask static file serving

📁 Project Structure:

A typical project structure looks like this:

e-commerce/
│
├── backend/
│   ├── app.py
│   ├── static/
│   │   └── uploads/
│   │       └── uploaded-images
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── ProductForm.jsx
│   │   ├── ...
│   │   └── App.jsx
│   ├── package.json
│   └── ...
│
└── README.md

⚙️ Backend Setup
1. Navigate to the backend folder
cd backend

2. Install the required Python packages
pip install flask flask-cors mysql-connector-python


Werkzeug is included with Flask, so it does not need to be installed separately.

3. Configure MySQL

Create the required MySQL database and products table.

Example:

CREATE DATABASE ecommerce;

USE ecommerce;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500)
);


Update the MySQL connection details in the Flask application according to your local environment.

4. Configure the upload folder

The backend uses:

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


Uploaded images are saved inside:

backend/static/uploads/

🖼️ Image Upload System

The application uses real uploaded image files instead of dynamically generated image URLs.

The upload process works as follows:

Admin selects image
       ↓
React creates FormData
       ↓
Axios sends multipart/form-data
       ↓
Flask receives the image
       ↓
File type is validated
       ↓
Unique filename is generated
       ↓
Image is saved in static/uploads
       ↓
Flask returns image_url
       ↓
Product is created/updated with image_url
       ↓
React displays the stored image

Allowed Image Types

The application accepts:

PNG
JPG
JPEG
WebP

Example validation:

def allowed_file(filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    return '.' in filename and ext in ALLOWED_EXTENSIONS

Unique Filenames

Each uploaded image receives a unique filename using UUID:

ext = file.filename.rsplit('.', 1)[-1].lower()
unique_name = f"{uuid.uuid4().hex}.{ext}"


This prevents two files with the same original filename from overwriting each other.

For example:

photo.jpg


could become:

a82f5c7e91d24b8f9c2e.jpg

🔌 API Endpoints
Upload Image
POST /api/upload


Accepts an image using multipart/form-data.

The image must be sent using the field name:

image


Successful response:

{
    "image_url": "/static/uploads/example.jpg"
}

Get Products
GET /api/products


Returns the available products.

Get Product
GET /api/products/<id>


Returns a specific product.

Create Product
POST /api/products


Creates a product using the image_url returned from the upload endpoint.

Example request:

{
    "name": "Laptop",
    "description": "Powerful laptop",
    "price": 50000,
    "image_url": "/static/uploads/example.jpg"
}

Update Product
PUT /api/products/<id>


Updates an existing product.

Delete Product
DELETE /api/products/<id>


Deletes a product.

💻 Frontend Setup

1. Navigate to the frontend folder
cd frontend

2. Install dependencies
npm install

3. Start the React development server
npm run dev


The frontend will normally be available at the URL shown by the development server.

▶️ Running the Application

Start the Flask backend first:

cd backend
python app.py


Then start the React frontend in a separate terminal:

cd frontend
npm run dev


The React application communicates with the Flask API using Axios.

📤 Uploading a Product Image

The admin product form contains a file input instead of an image URL field:

<input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
/>


When an image is selected, an instant preview is displayed:

const [file, setFile] = useState(null);
const [preview, setPreview] = useState(null);

function handleFileChange(e) {
    const selected = e.target.files[0];

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
}


When the form is submitted, the image is uploaded first:

const formData = new FormData();
formData.append('image', file);

const uploadRes = await api.post(
    '/api/upload',
    formData,
    {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
);


The returned image_url is then used when creating or updating the product.

🖼️ Displaying Uploaded Images:

Uploaded images are served by Flask from:

/static/uploads/<filename>


The React frontend constructs the complete URL:

<img
    src={`http://localhost:5000${product.image_url}`}
    alt={product.name}
/>


For example:

/static/uploads/abc123.jpg


becomes:

http://localhost:5000/static/uploads/abc123.jpg


If a product does not contain an image, the application displays:

No image


instead of showing a broken image.

🔒 File Validation

The application restricts uploaded files to supported image formats.

ALLOWED_EXTENSIONS = {
    'png',
    'jpg',
    'jpeg',
    'webp'
}


A maximum upload size of 2 MB can be enforced with Flask:

app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024


Invalid file types are rejected with an error response.

🔄 Why Real Image Uploads?

Earlier versions of the project used dynamically generated Picsum image URLs.

This caused a problem because the image could change or become mismatched when the page was loaded again.

The improved system stores the actual uploaded image on the server.

Instead of:

Product → Random image URL


the application now uses:

Product
   ↓
Stored image_url
   ↓
Exact uploaded file


Therefore, the same product always displays the same uploaded image.

🧪 Testing Checklist:

Before considering the application complete, verify:

 Backend starts successfully.
 React frontend starts successfully.
 MySQL connection works.
 Products can be added.
 Products can be edited.
 Products can be deleted.
 Products can be viewed.
 Image file can be selected.
 Image preview appears immediately.
 Valid image types upload successfully.
 Invalid file types are rejected.
 Files larger than the configured limit are rejected.
 Uploaded images appear in static/uploads.
 Uploaded image URLs are stored in the database.
 Product cards display the correct image.
 Product details display the correct image.
 Products without images show "No image".
 No Picsum URLs are used.

📌 Important Notes:

Do not manually enter image URLs in the product form.
Images should be uploaded through /api/upload.
The returned image_url should be stored with the product.
Uploaded files should have unique filenames.
The static/uploads directory must exist or be created automatically.
During development, the frontend uses the Flask backend running on localhost:5000.

🎯 Project Goal:

The goal of this project is to demonstrate a complete full-stack E-Commerce product management workflow, including real file upload, server-side storage, database persistence, and frontend image rendering.

The image upload system makes the project closer to how real-world E-Commerce administration systems handle product images.