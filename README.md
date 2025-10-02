## Hive React Native App

### Prérequis

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)

### Installation

**Installe les dépendances** 

   ```sh
# si pas installé : nvm install v20.19.5 
nvm use
   ```

**Installe les dépendances** 

   ```sh
   npm install
   ```

**Configure les variables d'environnement**
   ```sh
   cp .env.example .env
   # puis édite .env selon tes besoins
   ```

### Scripts disponibles

- **Démarrer le projet Expo**
  ```sh
  npm start
  ```
- **Démarrer sur Android**
  ```sh
  npm run android
  ```
- **Démarrer sur iOS**
  ```sh
  npm run ios
  ```
- **Démarrer sur le web**
  ```sh
  npm run web
  ```
- **Linter le projet**
  ```sh
  npm run lint
  ```
- **Reset complet du projet (cache, node_modules, etc.)**
  ```sh
  npm run reset-project
  ```

### Gestion des variables d'environnement

Le fichier `.env` (ignoré par git) permet de stocker les secrets et URLs sensibles. Pour l'initialiser :

```sh
cp .env.example .env
# puis édite .env
```

Utilisation dans le code (avec react-native-dotenv) :

```js
import { API_URL } from "@env";
```

### Structure du projet

Voir l'arborescence du dossier pour l'organisation des fichiers (app, components, constants, etc).

---

Pour toute question, voir la documentation Expo ou contacter l'équipe du projet.
