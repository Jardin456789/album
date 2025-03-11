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
  try {
    // Vérifier si la requête est multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'La requête doit être multipart/form-data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'album';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Aucun fichier fourni' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convertir le buffer en base64 pour Cloudinary
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Télécharger l'image vers Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      public_id: file.name.split('.')[0], // Utiliser le nom du fichier sans extension
    });

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
  } catch (error) {
    console.error('Erreur lors du téléchargement vers Cloudinary:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors du téléchargement' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 