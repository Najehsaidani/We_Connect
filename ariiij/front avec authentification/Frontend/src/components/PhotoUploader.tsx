
import React, { useState, useRef } from 'react';
import { Image, X, Upload, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploaderProps {
  onPhotoAdded?: (photoUrl: string, file?: File) => void;
  onPhotoRemoved?: () => void;
}

const PhotoUploader = ({ onPhotoAdded, onPhotoRemoved }: PhotoUploaderProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (!file.type.match('image.*')) {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner une image (JPG, PNG, GIF)",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 5MB",
          variant: "destructive"
        });
        return;
      }

      setIsUploading(true);

      // Simulate upload delay
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhoto(result);
          // Passer à la fois l'URL et le fichier
          onPhotoAdded?.(result, file);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    onPhotoRemoved?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!photo ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Téléchargement...</span>
            </>
          ) : (
            <>
              <Image className="h-4 w-4" />
              <span>Ajouter une photo</span>
            </>
          )}
        </Button>
      ) : (
        <div className="relative mt-2 mb-4">
          <div className="relative rounded-md overflow-hidden">
            <img
              src={photo}
              alt="Uploaded preview"
              className="max-h-80 w-full object-contain bg-black/5"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removePhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
