
## Import des Projekts von
https://github.com/t-stefan/FHB-Assignment-Backend
neu: wojogun/DevOpsPT_Stefan
typ: public  
Collaborators: wojogun, chpkt, livadeHe

``` git clone https://github.com/wojogun/DevOpsPT_Stefan.git
cd DevOpsPT_Stefan/
git checkout -b feature/ci
npm install
npm audit fix
--> 3 high severity vulnerabilities
npm start (app starten)
npm run dev (app mit hot reload)
```

Im github-Repo -> Settings/Actions/General
  "Allow all actions and reuseable workflows"
  Save

```
npm install --save-dev mocha chai supertest eslint eslint-plugin-n globals
mkdir -p .github/workflows
touch .github/workflows/ci.yml
```
```
name: CI-Pipeline-DevOpsPT-Stefan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js environment
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Fix vulnerabilities (non-breaking)
        run: npm audit fix || true

      - name: Run ESLint
        run: npm run lint

      - name: Run tests
        run: npm test
```

> package.json:
```
"scripts": {
    "start": "node index.js",
    "test": "mocha 'test/**/*.test.js'",
    "lint": "eslint ."
```

```
git add .
git commit -m "initial ci, mocha, lint"
git push --set-upstream origin feature/ci
```

Der erste pull-request führte zu einem Fehler. Mit Lint passt was nicht - die config fehlt.

> touch eslint.config.cjs
```
const globals = require('globals');
const eslintPluginNode = require('eslint-plugin-n');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      node: eslintPluginNode,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'off',
    },
  },
];
```
**Jetzt läuft die Pipeline mal fehlerfrei!**

## testfiles anlegen
> git checkout -b feature/tests
```
mkdir -p test/unit test/integration
touch test/unit/math.test.js
touch test/integration/api.notes.test.js
```

Auslagern von ID-Genierierung (von index.js)
> mkdir utils
> touch utils/notes.js
> touch test/unit/utils.test.js

index.js so anpassen, dass man app exportieren kann,
letzten Teil ändern auf:
```
const PORT = 3001

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

module.exports = app
```
"app exportieren" bedeutet, dass man den Express-Server (also die app-Instanz) aus der index.js-Datei für andere Dateien zugänglich macht. Die index.js startet standardmäßig den server mit app.listen(...)
Hat man dann ein require() in einem Test würde nochmals ein Server gestartet --> "Address already in use"

Pull-Request und Merge habe an dieser Stelle fehlerfrei geklappt

## Docker
Im Repo werden nun Secrets für Dockerhub angelegt.  
Settings/Secretes and variables/Actions
- DOCKER_USERNAME
- DOCKER_PASSWORD

> git checkout -b feature/docker
> touch Dockerfile
```
FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
CMD ["npm", "start"]
```
Nun folgen Anpassungen im Workflow:
Aufteilung in 2 Jobs:
- Testing
- Docker

## dependabot
> git checkout -b feature/dependabot
> touch .gitlab/dependabot.yml
```
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "chore"
```

Was das bewirkt:
- Prüft täglich die package.json & package-lock.json
- startet Pull Requests bei neuen Versionen
- Begrenzt auf max. 5 gleichzeitige PRs
- Fügt chore: als Commit-Präfix hinzu

Nachdem der Merge des Branches in Main erfolgt war, kam auch schon das erste Update rein:  
> npm_and_yarn in /. - Update #1031115562

Um eine Rückmeldung von Dependabot zu bekommen, wenn keine Updates nötig sind, gibt es aktuell leider keine direkte Benachrichtigung von GitHub selbst. GitHub verhält sich dabei sehr „still“ – kein Pull Request heißt: alles aktuell. Aber man kann sich das Log von Dependabot ansehen:
> Im Repo: Insights/Dependency Graph/Dependabot

## SonarCube Cloud
Erst mal muss man sich auf https://sonarcloud.io/ registrieren, wobei die Authentifizierung über github erfolgen kann. Bei der Gelegenheit wurde auch gleich das Repo verknüpft bzw für Sonar berechtigt.

Dann muss man dort einen neuen Token anlegen: My Account/Security
Achtung! Dieser Token wird nur einmal angezeigt, also rauskopieren. Hinterlegt wird er dann in den Github-Secrets unter SONAR_TOKEN.

> touch sonar-project.properties
```
sonar.organization=wojogun
sonar.projectKey=wojogun_DevOpsPT_Stefan
sonar.projectName=noteapp
sonar.sources=.
sonar.exclusions=**/node_modules/**,**/test/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```
und die ci.yml muss auch noch angepasst werden (neuen Job hinzufügen):
```
  sonarcloud:
    needs: testing
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Run SonarCloud analysis
        uses: SonarSource/sonarcloud-github-action@v2
        with:
          projectBaseDir: .
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

```

