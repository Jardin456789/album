import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  artist?: string;
}

export default function AudioPlayer({ 
  audioUrl, 
  title = "Musique d'ambiance",
  artist = "Album Photo"
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialiser l'audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Événements audio
    const setAudioData = () => {
      setDuration(audio.duration);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
    };
    
    // Ajouter les écouteurs d'événements
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);
    
    // Définir le volume initial
    audio.volume = volume;
    
    // Nettoyer les écouteurs d'événements
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);
  
  // Gérer la lecture/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.play().catch(error => {
        console.error("Erreur lors de la lecture audio:", error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);
  
  // Gérer le volume et le mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Formater le temps (secondes -> MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Gérer le changement de volume
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  // Calculer le pourcentage de progression
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-md text-white rounded-full shadow-lg transition-all duration-300",
        isExpanded ? "w-64 rounded-lg" : "w-auto"
      )}
    >
      <div className="flex items-center">
        {/* Bouton de lecture/pause */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-white rounded-full hover:bg-white/10"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
        
        {/* Bouton d'expansion */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white rounded-full hover:bg-white/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Volume2 className="h-5 w-5" />
        </Button>
        
        {/* Contrôles étendus */}
        {isExpanded && (
          <div className="flex flex-col px-3 py-2">
            <div className="text-xs mb-1">
              <div className="font-medium">{title}</div>
              <div className="text-white/70">{artist}</div>
            </div>
            
            {/* Barre de progression */}
            <div className="w-full mb-2">
              <Slider
                defaultValue={[0]}
                value={[progressPercentage]}
                max={100}
                step={0.1}
                onValueChange={(values) => {
                  const audio = audioRef.current;
                  if (!audio) return;
                  audio.currentTime = (values[0] / 100) * duration;
                }}
                className="h-1"
              />
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Contrôle du volume */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10 p-0"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
              
              <Slider
                defaultValue={[volume * 100]}
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="h-1 flex-1"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Élément audio (caché) */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
} 