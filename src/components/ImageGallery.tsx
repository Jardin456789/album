import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getResponsiveImageUrl } from '../lib/cloudinary';

interface ImageResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
}

interface ImageGalleryProps {
  images: ImageResource[];
  onImageClick: (image: ImageResource) => void;
}

export default function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
  useEffect(() => {
    console.log("=== COMPOSANT IMAGEGALLERY RENDU ===");
    console.log("ImageGallery rendu avec", images.length, "images");
    if (images.length > 0) {
      console.log("Exemple d'image:", JSON.stringify(images[0], null, 2));
      console.log("URL sécurisée fournie par Cloudinary:", images[0].secure_url);
    }
  }, [images]);

  if (!images || images.length === 0) {
    console.log("Aucune image à afficher dans ImageGallery");
    return <div className="text-center p-8">Aucune image à afficher</div>;
  }

  // Fonction pour transformer l'URL Cloudinary et ajouter les paramètres d'optimisation
  const optimizeCloudinaryUrl = (url: string): string => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Vérifier si l'URL contient déjà /upload/
    if (url.includes('/upload/')) {
      // Insérer les paramètres d'optimisation après /upload/ et forcer le format WebP
      return url.replace('/upload/', '/upload/q_auto,f_webp/');
    }
    
    return url;
  };

  return (
    <div className="bg-white w-full">
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-0">
        {images.map((image, index) => {
          console.log(`Rendu de l'image ${index}:`, image.public_id);
          
          // Utiliser directement l'URL sécurisée fournie par Cloudinary
          let imageUrl = image.secure_url;
          
          // Optimiser l'URL pour WebP et qualité auto
          imageUrl = optimizeCloudinaryUrl(imageUrl);
          
          // Fallback en cas d'URL manquante
          if (!imageUrl) {
            console.warn(`URL manquante pour l'image ${index}, tentative de génération...`);
            try {
              imageUrl = getOptimizedImageUrl(image.public_id, {
                width: 300,
                quality: 'auto',
                crop: 'fill'
              });
            } catch (error) {
              console.error(`Erreur lors de la génération de l'URL pour l'image ${index}:`, error);
              return null; // Ignorer cette image
            }
          }
          
          return (
            <div 
              key={image.public_id} 
              className="relative aspect-square overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onImageClick(image)}
            >
              <img
                src={imageUrl}
                alt={image.public_id.split('/').pop() || 'Image'}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority={index < 12 ? "high" : "low"}
                width={image.width ? Math.min(image.width, 300) : 300}
                height={image.height ? Math.min(image.height, 300) : 300}
                onError={(e) => {
                  console.error(`Erreur de chargement de l'image ${index}:`, e);
                  // Afficher une image de remplacement en cas d'erreur
                  e.currentTarget.src = 'https://via.placeholder.com/300?text=Image+non+disponible';
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
} 