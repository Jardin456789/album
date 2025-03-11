import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloudinaryImage {
  public_id: string;
  format: string;
  width: number;
  height: number;
  secure_url: string;
}

interface LightboxDialogProps {
  images: CloudinaryImage[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LightboxDialog({ 
  images, 
  initialIndex = 0, 
  open, 
  onOpenChange 
}: LightboxDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [optimalImageUrl, setOptimalImageUrl] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);
  const currentImage = images[currentIndex];

  // Réinitialiser l'index lorsque la boîte de dialogue s'ouvre
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Gérer la navigation avec les touches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'ArrowLeft') {
        navigateToPrevious();
      } else if (e.key === 'ArrowRight') {
        navigateToNext();
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'i') {
        setShowInfo(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, images.length, onOpenChange]);

  // Calculer l'URL optimale de l'image côté client uniquement
  useEffect(() => {
    if (currentImage && typeof window !== 'undefined') {
      // Utiliser une transformation pour agrandir l'image sans spécifier de dimensions exactes
      // Cela évite les erreurs 400 de Cloudinary
      const url = `https://res.cloudinary.com/dvhfgnvtx/image/upload/q_auto,f_auto/${currentImage.public_id}`;
      setOptimalImageUrl(url);
    }
  }, [currentImage]);

  const navigateToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const navigateToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDownload = () => {
    if (!currentImage) return;
    
    // Créer un lien de téléchargement avec l'URL originale en haute qualité
    const downloadUrl = `https://res.cloudinary.com/dvhfgnvtx/image/upload/q_100/${currentImage.public_id}.${currentImage.format}`;
    
    // Créer un élément a temporaire pour déclencher le téléchargement
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${currentImage.public_id.split('/').pop()}.${currentImage.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = () => {
    // Cette fonction serait implémentée pour supprimer l'image
    // Pour l'instant, affichons juste une alerte
    if (confirm(`Voulez-vous vraiment supprimer cette image (${currentImage.public_id}) ?`)) {
      alert("Fonctionnalité de suppression à implémenter");
      // Ici, vous appelleriez une API pour supprimer l'image de Cloudinary
    }
  };

  // Utiliser l'URL sécurisée par défaut si l'URL optimale n'est pas encore calculée
  const imageUrl = optimalImageUrl || (currentImage?.secure_url || '');

  if (!currentImage) return null;

  // Extraire le nom de l'image pour le titre
  const imageName = currentImage.public_id.split('/').pop() || `Image ${currentIndex + 1}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 m-0 bg-black border-0 rounded-none overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {imageName} - Image {currentIndex + 1} sur {images.length}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-full flex flex-col">
          {/* Barre supérieure avec tous les boutons regroupés à droite */}
          <div className="absolute top-0 right-0 z-30 flex items-center gap-2 p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => setShowInfo(prev => !prev)}
            >
              <Info className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full"
              onClick={handleDownload}
            >
              <Download className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full"
              onClick={handleDelete}
            >
              <Trash2 className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Boutons de navigation */}
          <Button 
            variant="ghost"
            size="icon"
            onClick={navigateToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 rounded-full w-16 h-16 flex items-center justify-center"
            aria-label="Image précédente"
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>
          
          <Button 
            variant="ghost"
            size="icon"
            onClick={navigateToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 rounded-full w-16 h-16 flex items-center justify-center"
            aria-label="Image suivante"
          >
            <ChevronRight className="h-10 w-10" />
          </Button>
          
          {/* Image - plein écran sans marges ni bordures */}
          <div className="flex-1 flex items-center justify-center w-full h-full bg-black">
            <div className="max-w-[50vw] flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt={`Image ${currentIndex + 1} - ${imageName}`}
                className="object-contain"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100vh',
                  width: 'auto',
                  height: 'auto',
                }}
              />
            </div>
          </div>
          
          {/* Informations sur l'image */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/90 to-transparent transition-all duration-300",
            showInfo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
          )}>
            <div className="flex flex-col gap-1">
              <p className="text-lg font-medium">
                Image {currentIndex + 1} / {images.length}
              </p>
              <p className="text-sm opacity-80">
                ID: {currentImage.public_id.split('/').pop()}
              </p>
              <p className="text-sm opacity-80">
                Dimensions: {currentImage.width} × {currentImage.height}
              </p>
              <p className="text-sm opacity-80">
                Format: {currentImage.format.toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Indicateur de position */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 