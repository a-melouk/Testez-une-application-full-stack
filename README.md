# Yoga App

Cette application permet de gérer des sessions de yoga. Elle comprend un back-end Spring Boot, un front-end Angular et une base de données MySQL.

## Prérequis

- Java 11
- Node.js 16
- MySQL
- Angular CLI 14

## Installation de la base de données

1. Assurez-vous que MySQL est en cours d'exécution sur le port 3306 (port par défaut)
2. Créez une base de données nommée "yoga":
   ```sql
   CREATE DATABASE yoga;
   ```
3. Assurez-vous que l'utilisateur MySQL a les droits nécessaires sur cette base de données ou créez un utilisateur avec les permissions adéquates:
   ```sql
   CREATE USER 'yoga_user'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON yoga.* TO 'yoga_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. Les tables seront automatiquement créées lors du démarrage de l'application back-end grâce à Hibernate.

## Installation de l'application

1. Clonez ce repository:
   ```bash
   git clone https://github.com/votre-user/yoga-app.git
   cd yoga-app
   ```

2. Installation des dépendances du back-end:
   ```bash
   cd back
   mvn clean install
   ```

3. Installation des dépendances du front-end:
   ```bash
   cd ../front
   npm install
   ```

## Lancement de l'application

1. Démarrez le back-end (depuis le dossier `back`):
   ```bash
   mvn spring-boot:run
   ```
   Le serveur back-end démarrera sur http://localhost:8080

2. Dans un autre terminal, démarrez le front-end (depuis le dossier `front`):
   ```bash
   ng serve
   ```
   L'application front-end sera accessible sur http://localhost:4200

3. Accédez à l'application dans votre navigateur à l'adresse http://localhost:4200

4. Vous pouvez vous connecter avec:
   - Compte admin:
     - Login: yoga@studio.com
     - Password: test!1234
   - Ou créer un nouveau compte utilisateur

## Exécution des tests

### Tests Front-end (Jest)

Pour exécuter les tests unitaires et d'intégration du front-end:

```bash
cd front
npm test
```

Pour exécuter les tests avec génération du rapport de couverture:

```bash
cd front
npm test -- --coverage
```

Le rapport de couverture sera généré dans le dossier `front/coverage/`.

### Tests End-to-End (Cypress)

Pour exécuter les tests end-to-end:

```bash
cd front
npm run e2e
```

Pour exécuter les tests end-to-end avec génération du rapport de couverture:

```bash
cd front
npm run e2e:coverage
```

Le rapport de couverture sera généré dans le dossier `front/coverage-e2e/`.

### Tests Back-end (JUnit)

Pour exécuter les tests unitaires et d'intégration du back-end:

```bash
cd back
mvn test
```

Pour exécuter les tests avec génération du rapport de couverture:

```bash
cd back
mvn verify
```

Le rapport de couverture JaCoCo sera généré dans le dossier `back/target/site/jacoco/`.

## Génération des rapports de couverture

### Front-end (Jest)

```bash
cd front
npm test -- --coverage
```

Le rapport HTML sera disponible dans `front/coverage/lcov-report/index.html`.

### End-to-End (Cypress)

```bash
cd front
npm run e2e:coverage
```

Le rapport HTML sera disponible dans `front/coverage-e2e/lcov-report/index.html`.

### Back-end (JaCoCo)

```bash
cd back
mvn verify
```

Le rapport HTML sera disponible dans `back/target/site/jacoco/index.html`.

## Fonctionnalités

### Utilisateur standard
- Création de compte
- Connexion/Déconnexion
- Consultation des sessions de yoga
- Participation aux sessions de yoga
- Consultation de son profil

### Administrateur
- Toutes les fonctionnalités utilisateur
- Création de sessions de yoga
- Modification de sessions existantes
- Suppression de sessions