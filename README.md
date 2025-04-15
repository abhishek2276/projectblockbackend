# 🛠️ CAD File Block Viewer (DXF)
A full-stack application to upload and parse CAD (DXF) files, extract block data (like coordinates), and display it in a searchable interface.

# git clone
git clone https://github.com/abhishek2276/projectblockbackend.git
in your terminal

# ⚙️ Setup Instructions
🔧 Prerequisites
Node.js (v18+ recommended)

PostgreSQL

npm

📦 Install dependencies

npm install
🗄️ Database Setup
Create a PostgreSQL database.



Run Sequelize migrations:


npx sequelize-cli db:migrate
# 🚀 Run the App


npm start


# 📁 Features
Upload DXF files

Extract and store block names and coordinates

Search/filter blocks

View individual block properties

Paginated block list

# 🧩 Database Schema (PostgreSQL)
1. Files Table
Column	Type	Description
id	UUID	Primary key
name	STRING	Name of uploaded file
uploadDate	TIMESTAMP	File upload time
2. Blocks Table
Column	Type	Description
id	UUID	Primary key
fileId	UUID	Foreign key to Files.id
blockName	STRING	Name of the block
x	FLOAT	X coordinate
y	FLOAT	Y coordinate
z	FLOAT	Z coordinate
# 🛠️ API Documentation
# 🔹 POST /api/files/upload
Description: Upload DXF file and store its blocks
Body: multipart/form-data with file field
Response:


{
  "message": "File uploaded successfully!",

}
# 🔹 GET /api/files/blocks/${id}
Description: Get block by id
Response:


coordinates:[
  {
    "type": "SPLINE",
    "degree": null,
    "controlPoints": [
      {
        "x": 597.16534,
        "y": 372.32521,
        "z": 0
      },
      {
        "x": 597.16534,
        "y": 372.32521,
        "z": 0
      },
      {
        "x": 597.16534,
        "y": 291.65039,
        "z": 0
  ...
]
# 🔹 GET /api/files/blocks
Description: Get all the stored blocks 

# 📚 Reasoning Behind Library Choices
Library	Purpose
express	Backend framework
multer	Handle file uploads
dxf-parser	Parse DXF files for block extraction
sequelize	ORM for PostgreSQL for ease of migrations/models
uuid	UUID support for primary keys
jest	Unit testing framework
cors	Enable cross-origin requests for frontend
# 🤖 AI Coding Assistant Usage
Prompted ChatGPT for:

Sequelize association patterns

Best way to extract coordinates from DXF blocks

Clean Tailwind UI layout ideas

Writing Jest unit tests

Used Copilot for quick code completions
