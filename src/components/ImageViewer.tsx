import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '../lib/cloudinary';

interface ImageResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
}

interface ImageViewerProps {
  image: ImageResource | null;
  onClose: () => void;
  videoUrl?: string;
  allImages?: ImageResource[]; // Ajout d'un tableau de toutes les images pour la navigation
  currentIndex?: number; // Index de l'image actuelle
}

export default function ImageViewer({ image, onClose, videoUrl, allImages = [], currentIndex = 0 }: ImageViewerProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Déterminer si nous avons plusieurs images pour la navigation
  const hasMultipleImages = allImages && allImages.length > 1;
  
  // Obtenir l'image active
  const activeImage = hasMultipleImages ? allImages[activeIndex] : image;
  
  useEffect(() => {
    console.log("ImageViewer rendu avec image:", activeImage);
    // Réinitialiser l'état d'erreur à chaque changement d'image
    setImageError(false);
    setIsLoading(true);
    
    // Ajouter des gestionnaires d'événements pour les touches du clavier
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (hasMultipleImages) {
        if (e.key === 'ArrowRight') {
          navigateToImage((activeIndex + 1) % allImages.length);
        } else if (e.key === 'ArrowLeft') {
          navigateToImage((activeIndex - 1 + allImages.length) % allImages.length);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Nettoyer les gestionnaires d'événements
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImage, activeIndex, allImages]);

  if (!activeImage) return null;

  // Fonction pour transformer l'URL Cloudinary et ajouter les paramètres d'optimisation
  const optimizeCloudinaryUrl = (url: string, isFullSize = false): string => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    // Vérifier si l'URL contient déjà /upload/
    if (url.includes('/upload/')) {
      // Insérer les paramètres d'optimisation après /upload/ et forcer le format WebP
      const quality = isFullSize ? 'q_auto:best' : 'q_auto';
      const width = isFullSize ? '' : 'w_1200';
      const transformations = [quality, 'f_webp'];
      if (width) transformations.push(width);
      
      return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
    
    return url;
  };

  // Naviguer vers une image spécifique
  const navigateToImage = (index: number) => {
    setActiveIndex(index);
    setIsZoomed(false);
  };

  // Utiliser directement l'URL sécurisée fournie par Cloudinary
  let imageUrl = activeImage.secure_url;
  
  // Optimiser l'URL pour WebP et qualité auto
  imageUrl = optimizeCloudinaryUrl(imageUrl, isZoomed);
  
  console.log("URL de l'image optimisée utilisée:", imageUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Bouton de fermeture */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-colors duration-300 z-10"
        aria-label="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Informations sur l'image */}
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded z-10">
        <p className="text-sm">{activeImage.public_id.split('/').pop()}</p>
        <p className="text-xs opacity-75">
          {activeIndex + 1} / {hasMultipleImages ? allImages.length : 1} • 
          {activeImage.width}×{activeImage.height} • 
          {activeImage.format.toUpperCase()}
        </p>
      </div>

      {/* Boutons de navigation */}
      {hasMultipleImages && (
        <>
          <button 
            onClick={() => navigateToImage((activeIndex - 1 + allImages.length) % allImages.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-colors duration-300 z-10"
            aria-label="Image précédente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => navigateToImage((activeIndex + 1) % allImages.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-colors duration-300 z-10"
            aria-label="Image suivante"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div className="max-w-[95vw] max-h-[90vh] relative">
        {showVideo && videoUrl ? (
          <div className="relative w-full h-0 pb-[56.25%]">
            <iframe 
              src={videoUrl} 
              className="absolute inset-0 w-full h-full" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <>
            {imageError ? (
              <div className="bg-gray-800 text-white p-8 rounded">
                <p className="text-xl mb-4">Impossible de charger l'image</p>
                <p>L'image n'a pas pu être chargée. Veuillez réessayer plus tard.</p>
              </div>
            ) : (
              <div className={`relative ${isLoading ? 'animate-pulse bg-gray-800' : ''}`}>
                <img 
                  src={imageUrl} 
                  alt={activeImage.public_id.split('/').pop() || "Image en plein écran"} 
                  className={`max-w-full max-h-[85vh] object-contain transition-transform duration-300 ${isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  onLoad={() => setIsLoading(false)}
                  onError={(e) => {
                    console.error("Erreur de chargement de l'image en plein écran:", e);
                    setImageError(true);
                    setIsLoading(false);
                  }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {videoUrl && (
          <button 
            onClick={() => setShowVideo(!showVideo)}
            className="bg-white text-black px-4 py-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors duration-300"
          >
            {showVideo ? "Voir l'image" : "Voir la vidéo"}
          </button>
        )}
        
        <button 
          onClick={() => window.open(optimizeCloudinaryUrl(activeImage.secure_url, true), '_blank')}
          className="bg-white text-black px-4 py-2 rounded-full shadow-lg hover:bg-gray-200 transition-colors duration-300"
        >
          Télécharger
        </button>
      </div>
    </div>
  );
} 