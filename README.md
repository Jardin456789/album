# Album Photo - Galerie d'images avec Astro et Cloudinary

Une application moderne de galerie d'images construite avec Astro, Tailwind CSS, shadcn-ui et Cloudinary. Cette application permet d'afficher jusqu'à 100 images à la fois, avec une musique de fond et la possibilité de visionner des vidéos.

## Fonctionnalités

- 🖼️ Affichage de jusqu'à 100 images depuis Cloudinary
- 🎵 Lecteur de musique de fond intégré
- 🎬 Possibilité de visionner des vidéos associées aux images
- 🎨 Interface utilisateur moderne avec Tailwind CSS et shadcn-ui
- 📱 Design responsive pour tous les appareils
- ⚡ Performance optimisée grâce à Astro et au chargement paresseux des images

## Prérequis

- Node.js 18 ou supérieur
- Un compte Cloudinary (gratuit)

## Installation

1. Clonez ce dépôt :
```bash
git clone <url-du-depot>
cd album-photo
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
   - Copiez le fichier `.env.example` en `.env`
   - Remplissez les informations de votre compte Cloudinary

```bash
cp .env.example .env
```

4. Lancez le serveur de développement :
```bash
npm run dev
```

## Configuration de Cloudinary

1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Obtenez vos informations d'identification depuis le tableau de bord
3. Créez un dossier nommé "album" dans votre compte Cloudinary
4. Téléchargez vos images dans ce dossier

## Personnalisation

### Musique de fond

Pour changer la musique de fond, modifiez l'URL dans le fichier `src/pages/index.astro` :

```astro
const audioUrl = "https://votre-url-audio.mp3";
```

### Vidéo

Pour changer la vidéo, modifiez l'URL dans le fichier `src/pages/index.astro` :

```astro
const videoUrl = "https://www.youtube.com/embed/votre-id-video";
```

### Styles

Les styles peuvent être personnalisés en modifiant les fichiers suivants :
- `src/styles/global.css` - Variables CSS et styles globaux
- `tailwind.config.mjs` - Configuration de Tailwind CSS

## Déploiement

Cette application peut être déployée sur n'importe quelle plateforme supportant Astro, comme Vercel, Netlify ou GitHub Pages.

```bash
npm run build
```

## Licence

MIT

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
