import React, { useState, useEffect, useRef, useMemo } from 'react';
import LightboxDialog from './LightboxDialog';

interface CloudinaryImage {
  public_id: string;
  format: string;
  width: number;
  height: number;
  secure_url: string;
}

interface GalleryWithLightboxProps {
  images: CloudinaryImage[];
  maxImages?: number;
}

export default function GalleryWithLightbox({ 
  images, 
  maxImages = 500 // Augmenté à 500 pour s'assurer qu'il n'y a pas de limite
}: GalleryWithLightboxProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Calculer les images à afficher une seule fois lors du montage initial
  // Utiliser useMemo pour éviter de recalculer à chaque rendu
  const displayedImages = useMemo(() => {
    return images.slice(0, maxImages);
  }, [images, maxImages]);
  
  // Générer des z-index stables basés sur l'index
  // Utiliser useMemo pour éviter de recalculer à chaque rendu
  const zIndexes = useMemo(() => {
    return displayedImages.map((_, index) => {
      // Utiliser une formule déterministe basée sur l'index
      return ((index * 13) % 3) + 1; // Valeurs entre 1 et 3
    });
  }, [displayedImages]);
  
  // Marquer que nous sommes côté client après le montage
  useEffect(() => {
    setIsClient(true);
    
    // Logs pour le débogage - une seule fois après le montage
    console.log(`Nombre total d'images disponibles: ${images.length}`);
    console.log(`Nombre d'images affichées: ${displayedImages.length}`);
    console.log(`Nombre de rangées nécessaires: ${Math.ceil(displayedImages.length / 10)}`);
  }, []); // Dépendance vide pour n'exécuter qu'une seule fois
  
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };
  
  const handleOpenChange = (open: boolean) => {
    setLightboxOpen(open);
  };

  // Fonction pour générer un style pour chaque image
  const getImageStyle = (index: number) => {
    // Calculer la position dans une grille 10x10
    const row = Math.floor(index / 10);
    const col = index % 10;
    
    // Calculer la position
    const top = row * 10;
    const left = col * 10;
    
    // Rotation - uniquement côté client pour éviter les erreurs d'hydratation
    // Utiliser une valeur déterministe basée sur l'index
    const rotation = isClient 
      ? (((index * 7) % 6) - 3) * 0.1 // Valeur déterministe basée sur l'index
      : 0; // Pas de rotation côté serveur
    
    // Z-index - utiliser la valeur stable générée
    const zIndex = isClient && zIndexes.length > 0 
      ? zIndexes[index] || 1 // Utiliser la valeur pseudo-aléatoire mais stable
      : 1; // Valeur par défaut pour le rendu serveur
    
    return {
      position: 'absolute' as 'absolute',
      top: `${top}%`,
      left: `${left}%`,
      width: '10.5%', // Légèrement plus grand que l'espacement pour garantir le chevauchement
      height: '10.5%', // Légèrement plus grand que l'espacement pour garantir le chevauchement
      transform: `rotate(${rotation}deg)`,
      zIndex,
      transition: 'transform 0.2s ease, z-index 0.2s ease',
    };
  };
  
  // Calculer la hauteur nécessaire pour afficher toutes les images
  // Chaque rangée occupe 10% de la hauteur, donc nous multiplions par 10 pour obtenir la hauteur en pourcentage
  const totalRows = Math.ceil(displayedImages.length / 10);
  const containerHeightVh = totalRows * 10;
  
  return (
    <div className="w-full h-screen overflow-auto bg-black">
      {/* Logo en haut à gauche, par-dessus tout */}
      <div className="fixed top-4 left-4 z-50">
        {/* 
          Note: Remplacez le chemin ci-dessous par le chemin correct vers votre logo
          après l'avoir ajouté manuellement dans le dossier public
        */}
        <img 
          src="/logo.png" 
          alt="Album Logo" 
          width={120} 
          height={40}
          className="drop-shadow-lg"
        />
      </div>
      
      <div 
        className="relative w-full bg-black" 
        style={{ 
          height: `${containerHeightVh}vh`, 
          minHeight: '100vh'
        }}
      >
        {displayedImages.map((image, index) => {
          const fetchPriority = index < 30 ? "high" : "low";
          const imageStyle = getImageStyle(index);
          
          return (
            <div 
              key={image.public_id} 
              className="overflow-hidden cursor-pointer hover:z-10 hover:scale-102" 
              onClick={() => handleImageClick(index)}
              style={imageStyle}
            >
              <img 
                src={`https://res.cloudinary.com/dvhfgnvtx/image/upload/c_fill,g_auto,ar_1.5,q_auto,f_webp/${image.public_id}`} 
                alt={`Image ${index + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority={fetchPriority}
                style={{
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* Composant Lightbox Dialog */}
      <LightboxDialog 
        images={images}
        initialIndex={selectedImageIndex}
        open={lightboxOpen}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
} 