# Utilise l'image officielle de Node.js comme base
FROM node:14

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application dans le conteneur
COPY . .

# Exposer le port sur lequel votre application tourne
EXPOSE 3000

# Commande pour lancer l'application
CMD ["npm", "start"]
