# Créer les dossiers et sous-dossiers
mkdir src
mkdir src\config
mkdir src\controllers
mkdir src\models
mkdir src\routes

# Créer les fichiers dans les dossiers correspondants
ni src\config\db.js -ItemType File
ni src\controllers\roomController.js -ItemType File
ni src\models\Room.js -ItemType File
ni src\routes\roomRoutes.js -ItemType File
ni src\app.js -ItemType File
ni src\server.js -ItemType File

# Créer les fichiers à la racine
ni .env -ItemType File
ni .gitignore -ItemType File
ni package.json -ItemType File
ni README.md -ItemType File

# Vérification de l'arborescence
tree /f
