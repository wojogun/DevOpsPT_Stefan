
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
