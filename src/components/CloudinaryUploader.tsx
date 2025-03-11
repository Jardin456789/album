import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Image, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloudinaryUploaderProps {
  folder?: string;
  onUploadComplete?: (result: any) => void;
}

export default function CloudinaryUploader({ 
  folder = "album",
  onUploadComplete
}: CloudinaryUploaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    const uploadedUrls: string[] = [];
    const totalFiles = files.length;
    let completedFiles = 0;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        try {
          // Appel à notre API pour télécharger le fichier
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.secure_url) {
            uploadedUrls.push(result.secure_url);
          }
          
          // Mettre à jour la progression
          completedFiles++;
          const progress = Math.floor((completedFiles / totalFiles) * 100);
          setUploadProgress(progress);
          
        } catch (uploadError) {
          console.error(`Erreur lors du téléchargement du fichier ${file.name}:`, uploadError);
          // Continuer avec les autres fichiers même si un échoue
        }
      }
      
      if (uploadedUrls.length > 0) {
        setUploadedFiles(prev => [...prev, ...uploadedUrls]);
        
        if (onUploadComplete) {
          onUploadComplete(uploadedUrls);
        }
        
        // Réinitialiser le formulaire après un court délai
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1000);
      } else {
        setError("Aucun fichier n'a pu être téléchargé.");
        setIsUploading(false);
      }
      
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err);
      setError("Échec du téléchargement. Veuillez réessayer.");
      setIsUploading(false);
    }
  };
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md text-white rounded-full shadow-lg transition-all duration-300",
        isExpanded ? "w-64 rounded-lg" : "w-auto"
      )}
    >
      <div className="flex items-center">
        {/* Bouton d'upload */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-white rounded-full hover:bg-white/10"
          onClick={() => isExpanded ? handleUploadClick() : setIsExpanded(true)}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </Button>
        
        {/* Bouton de fermeture du panneau */}
        {isExpanded && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white rounded-full hover:bg-white/10"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        {/* Panneau étendu */}
        {isExpanded && (
          <div className="flex flex-col px-3 py-2">
            <div className="text-xs mb-2">
              <div className="font-medium">Ajouter des photos</div>
              <div className="text-white/70">Téléchargez des images vers Cloudinary</div>
            </div>
            
            {/* Barre de progression */}
            {isUploading && (
              <div className="w-full mb-2">
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-xs text-white/70 mt-1 text-center">
                  {uploadProgress}% téléchargé
                </div>
              </div>
            )}
            
            {/* Message d'erreur */}
            {error && (
              <div className="text-xs text-red-400 mb-2">
                {error}
              </div>
            )}
            
            {/* Bouton d'upload visible dans le panneau étendu */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs bg-white/10 hover:bg-white/20 border-white/20"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              <Image className="h-3.5 w-3.5 mr-1.5" />
              Sélectionner des images
            </Button>
            
            {/* Compteur de fichiers téléchargés */}
            {uploadedFiles.length > 0 && (
              <div className="text-xs text-white/70 mt-2 flex items-center">
                <Check className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                {uploadedFiles.length} fichier(s) téléchargé(s)
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Input de fichier caché */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
    </div>
  );
} 