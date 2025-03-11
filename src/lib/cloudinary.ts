import { v2 as cloudinary } from 'cloudinary';
import { Cloudinary } from '@cloudinary/url-gen';

// Déclaration pour TypeScript
interface ImportMetaEnv {
  PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  PUBLIC_CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Récupération des variables d'environnement avec valeurs par défaut pour éviter les erreurs
const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const API_KEY = import.meta.env.PUBLIC_CLOUDINARY_API_KEY || '';
const API_SECRET = import.meta.env.CLOUDINARY_API_SECRET || '';

// Vérification des variables d'environnement
console.log("=== VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT CLOUDINARY ===");
console.log("CLOUD_NAME défini:", !!CLOUD_NAME);
console.log("API_KEY défini:", !!API_KEY);
console.log("API_SECRET défini:", !!API_SECRET);

// Configuration pour le côté serveur
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true
});

// Configuration pour le côté client
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME
  },
  url: {
    secure: true
  }
});

// Fonction pour récupérer les images d'un dossier
export async function getImagesFromFolder(folderName: string = 'album') {
  try {
    console.log("=== DÉBUT getImagesFromFolder ===");
    console.log("Cloud name:", CLOUD_NAME || "NON DÉFINI");
    console.log("API Key (partiel):", API_KEY ? API_KEY.substring(0, 5) + "..." : "NON DÉFINI");
    console.log("API Secret défini:", !!API_SECRET);
    console.log("Dossier recherché:", folderName);
    
    // Vérifier si les informations d'identification sont définies
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error("ERREUR: Informations d'identification Cloudinary manquantes");
      return [];
    }
    
    // Utiliser search au lieu de resources pour plus de flexibilité
    console.log("Exécution de la recherche Cloudinary...");
    const result = await cloudinary.search
      .expression(`folder:${folderName}`)
      .sort_by('created_at', 'desc')
      .max_results(500) // Augmentation à 500 (maximum autorisé par Cloudinary)
      .execute();
    
    console.log("Recherche terminée. Nombre de résultats:", result.resources ? result.resources.length : 0);
    if (result.resources && result.resources.length > 0) {
      console.log("Premier résultat:", JSON.stringify(result.resources[0], null, 2));
    } else {
      console.log("Aucune ressource trouvée dans le dossier", folderName);
    }
    
    console.log("=== FIN getImagesFromFolder ===");
    return result.resources;
  } catch (error: any) {
    console.error('ERREUR CRITIQUE lors de la récupération des images:', error);
    console.error('Message d\'erreur:', error.message || "Pas de message d'erreur");
    console.error('Stack trace:', error.stack || "Pas de stack trace");
    if (error.response) {
      console.error('Réponse d\'erreur Cloudinary:', error.response);
    }
    console.log("=== FIN getImagesFromFolder (avec erreur) ===");
    return [];
  }
}

// Fonction pour récupérer toutes les images (sans filtre de dossier)
export async function getAllImages() {
  try {
    console.log("=== DÉBUT getAllImages ===");
    console.log("Tentative de récupération de toutes les images...");
    
    // Vérifier si les informations d'identification sont définies
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error("ERREUR: Informations d'identification Cloudinary manquantes");
      return [];
    }
    
    // Utiliser search sans filtre de dossier
    const result = await cloudinary.search
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
    
    console.log("Recherche terminée. Nombre de résultats:", result.resources ? result.resources.length : 0);
    if (result.resources && result.resources.length > 0) {
      console.log("Premier résultat:", JSON.stringify(result.resources[0], null, 2));
    } else {
      console.log("Aucune ressource trouvée");
    }
    
    console.log("=== FIN getAllImages ===");
    return result.resources;
  } catch (error: any) {
    console.error('ERREUR CRITIQUE lors de la récupération de toutes les images:', error);
    console.error('Message d\'erreur:', error.message || "Pas de message d'erreur");
    console.error('Stack trace:', error.stack || "Pas de stack trace");
    if (error.response) {
      console.error('Réponse d\'erreur Cloudinary:', error.response);
    }
    console.log("=== FIN getAllImages (avec erreur) ===");
    return [];
  }
}

// Fonction pour générer des URLs optimisées
export function getOptimizedImageUrl(publicId: string, options: any = {}) {
  try {
    console.log(`Génération d'URL optimisée pour: ${publicId}`);
    const cloudName = CLOUD_NAME;
    
    if (!cloudName) {
      console.error("Cloud name non défini");
      return "";
    }
    
    // Si publicId est déjà une URL complète, extraire le public_id et continuer
    if (publicId.startsWith('http')) {
      console.log(`URL complète détectée: ${publicId}`);
      // Si c'est une URL Cloudinary, on peut la transformer
      if (publicId.includes('cloudinary.com')) {
        // Extraire le public_id de l'URL
        const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
        const match = publicId.match(regex);
        if (match && match[1]) {
          publicId = match[1];
          console.log(`Public ID extrait: ${publicId}`);
        } else {
          // Si on ne peut pas extraire le public_id, retourner l'URL d'origine
          return publicId;
        }
      } else {
        // Si ce n'est pas une URL Cloudinary, la retourner telle quelle
        return publicId;
      }
    }
    
    // Vérifier si publicId contient déjà le format
    const hasFormat = /\.(jpg|jpeg|png|gif|webp)$/.test(publicId);
    console.log(`Le public ID contient-il déjà un format? ${hasFormat}`);
    
    // Valeurs par défaut pour minimiser l'egress
    const {
      width = 800,
      height = 'auto',
      quality = 'auto',
      // Forcer le format WebP pour toutes les images
      crop = 'limit'
    } = options;
    
    // Construire les transformations
    let transformations = [];
    
    // Ajouter la transformation de redimensionnement
    if (width !== 'auto' && height !== 'auto') {
      transformations.push(`c_${crop},w_${width},h_${height}`);
    } else if (width !== 'auto') {
      transformations.push(`c_${crop},w_${width}`);
    } else if (height !== 'auto') {
      transformations.push(`c_${crop},h_${height}`);
    }
    
    // Ajouter la qualité
    transformations.push(`q_${quality}`);
    
    // Forcer le format WebP pour toutes les images
    transformations.push('f_webp');
    
    // Nettoyer le publicId (supprimer les extensions de fichier)
    let cleanPublicId = publicId;
    if (hasFormat) {
      cleanPublicId = publicId.replace(/\.(jpg|jpeg|png|gif|webp)$/, '');
    }
    
    const transformationString = transformations.join(',');
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanPublicId}`;
    
    console.log(`URL optimisée générée en WebP: ${url}`);
    
    return url;
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL optimisée:", error);
    // En cas d'erreur, retourner le publicId original s'il s'agit d'une URL, sinon une chaîne vide
    return publicId.startsWith('http') ? publicId : "";
  }
}

// Fonction pour générer des URLs optimisées pour différentes tailles d'écran (responsive)
export function getResponsiveImageUrl(publicId: string) {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 100 }),
    small: getOptimizedImageUrl(publicId, { width: 400 }),
    medium: getOptimizedImageUrl(publicId, { width: 800 }),
    large: getOptimizedImageUrl(publicId, { width: 1200 }),
    original: getOptimizedImageUrl(publicId, { width: 'auto' })
  };
}

// Fonction pour tester la connexion à Cloudinary
export async function testCloudinaryConnection() {
  try {
    console.log("=== DÉBUT testCloudinaryConnection ===");
    console.log("Variables d'environnement Cloudinary:");
    console.log("- CLOUD_NAME:", CLOUD_NAME || "NON DÉFINI");
    console.log("- API_KEY (partiel):", API_KEY ? API_KEY.substring(0, 5) + "..." : "NON DÉFINI");
    console.log("- API_SECRET défini:", !!API_SECRET);
    
    // Vérifier si les informations d'identification sont définies
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error("ERREUR: Informations d'identification Cloudinary manquantes pour le test de connexion");
      return false;
    }
    
    console.log("Tentative de ping vers Cloudinary...");
    const pingResult = await cloudinary.api.ping();
    console.log("Connexion à Cloudinary réussie:", pingResult);
    console.log("=== FIN testCloudinaryConnection ===");
    return true;
  } catch (error: any) {
    console.error("ERREUR CRITIQUE lors de la connexion à Cloudinary:", error);
    console.error('Message d\'erreur:', error.message || "Pas de message d'erreur");
    console.error('Stack trace:', error.stack || "Pas de stack trace");
    if (error.response) {
      console.error('Réponse d\'erreur Cloudinary:', error.response);
    }
    console.log("=== FIN testCloudinaryConnection (avec erreur) ===");
    return false;
  }
}

// Fonction pour tester l'accès à une image spécifique
export async function testImageAccess() {
  try {
    console.log("=== TEST D'ACCÈS AUX IMAGES ===");
    const cloudName = CLOUD_NAME;
    if (!cloudName) {
      console.error("Cloud name non défini");
      return false;
    }
    
    // Tableau de tests à effectuer
    const tests = [
      {
        name: "Image de test standard",
        url: `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_200,q_auto/test`
      },
      {
        name: "Image avec format auto",
        url: `https://res.cloudinary.com/${cloudName}/image/upload/c_scale,w_200,q_auto,f_auto/test`
      },
      {
        name: "Image avec chemin complet",
        url: `https://res.cloudinary.com/${cloudName}/image/upload/v1/test`
      },
      {
        name: "Image sans transformation",
        url: `https://res.cloudinary.com/${cloudName}/image/upload/test`
      }
    ];
    
    // Exécuter tous les tests
    let successCount = 0;
    for (const test of tests) {
      console.log(`Test: ${test.name} - URL: ${test.url}`);
      try {
        const response = await fetch(test.url);
        const success = response.ok;
        console.log(`Résultat: ${success ? "Réussi" : "Échoué"} (Status: ${response.status})`);
        if (success) successCount++;
      } catch (error) {
        console.error(`Erreur lors du test "${test.name}":`, error);
      }
    }
    
    // Vérifier si au moins un test a réussi
    const anySuccess = successCount > 0;
    console.log(`Résultat global: ${anySuccess ? "Au moins un test réussi" : "Tous les tests ont échoué"}`);
    
    return anySuccess;
  } catch (error) {
    console.error("Erreur lors du test d'accès aux images:", error);
    return false;
  }
}

export default cloudinary; 