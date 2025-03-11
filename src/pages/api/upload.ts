import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const POST: APIRoute = async ({ request }) => {
  console.log("API Upload: Début de la requête");
  try {
    // Vérifier si la requête est multipart/form-data
    const contentType = request.headers.get('content-type');
    console.log("API Upload: Content-Type:", contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.log("API Upload: Erreur - Content-Type incorrect");
      return new Response(
        JSON.stringify({ error: 'La requête doit être multipart/form-data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'album';
    
    console.log("API Upload: Fichier reçu:", file ? file.name : "aucun fichier");
    console.log("API Upload: Dossier cible:", folder);

    if (!file) {
      console.log("API Upload: Erreur - Aucun fichier fourni");
      return new Response(
        JSON.stringify({ error: 'Aucun fichier fourni' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Méthode alternative pour télécharger le fichier
    // Au lieu d'utiliser Buffer, utilisons directement le blob
    const blob = await file.arrayBuffer();
    
    // Créer un objet FormData pour l'API Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', new Blob([blob], { type: file.type }));
    cloudinaryFormData.append('upload_preset', 'ml_default'); // Utilisez votre preset ou 'ml_default'
    cloudinaryFormData.append('folder', folder);
    
    // Appel direct à l'API Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    console.log("API Upload: URL Cloudinary:", cloudinaryUrl);
    
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.log("API Upload: Erreur Cloudinary:", errorText);
      return new Response(
        JSON.stringify({ error: `Erreur Cloudinary: ${uploadResponse.status}` }),
        { status: uploadResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await uploadResponse.json();
    console.log("API Upload: Succès, image téléchargée:", result.public_id);

    // Renvoyer la réponse
    return new Response(
      JSON.stringify({
        success: true,
        public_id: result.public_id,
        format: result.format,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('API Upload: Erreur lors du téléchargement vers Cloudinary:', error);
    return new Response(
      JSON.stringify({ error: `Erreur lors du téléchargement: ${error.message || 'Erreur inconnue'}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 