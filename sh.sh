#!/bin/bash

echo "🛠️  Création manuelle de la configuration pour forcer 'gestionrestorant'..."

# 1. On force l'association au bon projet
cat <<EOF > .firebaserc
{
  "projects": {
    "default": "gestionrestorant"
  }
}
EOF

# 2. On crée la config minimale pour que le dossier soit reconnu comme un projet Firebase
cat <<EOF > firebase.json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist/gestion-restaurant/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF

echo "✅ Fichiers de configuration créés."

# 3. Maintenant que le fichier existe, on peut dire à Firebase d'utiliser cet alias
echo "🔗 Activation du projet..."
firebase use default

echo "----------------------------------------------------------------"
echo "🎉 Problème résolu ! Vous êtes maintenant connecté à 'gestionrestorant'."
echo "Vous pouvez lancer 'firebase deploy' directement, ou 'firebase init' pour affiner."