import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';

export interface ImageData {
  id: string;
  name: string;
  url?: string;
  file?: File;
  blob?: string; // Store blob as base64 string
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private images = new BehaviorSubject<ImageData[]>([]);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    try {
      const savedImages = localStorage.getItem('images');
      if (savedImages) {
        const parsedImages = JSON.parse(savedImages) as ImageData[];
        // Create new object URLs for each image
        const imagesWithUrls = parsedImages.map((img: ImageData) => {
          if (img.blob) {
            const blob = this.base64ToBlob(img.blob);
            return {
              ...img,
              url: URL.createObjectURL(blob)
            };
          }
          return img;
        });
        this.images.next(imagesWithUrls);
      }
    } catch (error) {
      console.error('Error loading images from localStorage:', error);
      this.images.next([]);
    }
  }

  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  getImages(): Observable<ImageData[]> {
    return this.images.asObservable();
  }

  saveNewImage(imageData: ImageData): Observable<ImageData> {
    return from(Promise.resolve()).pipe(
      switchMap(async () => {
        if (!imageData.file) {
          throw new Error('No file provided');
        }

        const buffer = await imageData.file.arrayBuffer();
        const blob = new Blob([buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const base64 = await this.blobToBase64(blob);

        const newImage: ImageData = {
          id: imageData.id,
          name: imageData.name,
          url,
          blob: base64
        };

        const currentImages = this.images.value;
        const updatedImages = [...currentImages, newImage];
        this.images.next(updatedImages);
        await this.saveToLocalStorage(updatedImages);

        return newImage;
      })
    );
  }

  uploadImages(files: File[]): Observable<ImageData[]> {
    return from(Promise.all(
      files.map(async (file) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2);
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const base64 = await this.blobToBase64(blob);
        
        return {
          id,
          name: file.name,
          url,
          file,
          blob: base64
        };
      })
    )).pipe(
      tap(newImages => {
        const currentImages = this.images.value;
        const updatedImages = [...currentImages, ...newImages];
        this.images.next(updatedImages);
        this.saveToLocalStorage(updatedImages);
      })
    );
  }

  updateImage(id: string, newFile: File): Observable<ImageData> {
    return from(newFile.arrayBuffer()).pipe(
      switchMap(async (buffer) => {
        const currentImages = this.images.value;
        const imageIndex = currentImages.findIndex(img => img.id === id);
        
        if (imageIndex === -1) throw new Error('Image not found');

        // Revoke old URL to prevent memory leaks
        if (currentImages[imageIndex].url) {
          URL.revokeObjectURL(currentImages[imageIndex].url);
        }

        const blob = new Blob([buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const base64 = await this.blobToBase64(blob);

        const updatedImage: ImageData = {
          ...currentImages[imageIndex],
          url,
          file: newFile,
          blob: base64
        };

        const updatedImages = [
          ...currentImages.slice(0, imageIndex),
          updatedImage,
          ...currentImages.slice(imageIndex + 1)
        ];

        this.images.next(updatedImages);
        await this.saveToLocalStorage(updatedImages);

        return updatedImage;
      })
    );
  }

  deleteImage(id: string): Observable<void> {
    const currentImages = this.images.value;
    const imageToDelete = currentImages.find(img => img.id === id);
    
    if (imageToDelete?.url) {
      URL.revokeObjectURL(imageToDelete.url);
    }

    const updatedImages = currentImages.filter(img => img.id !== id);
    this.images.next(updatedImages);
    this.saveToLocalStorage(updatedImages);

    return from(Promise.resolve());
  }

  private async saveToLocalStorage(images: ImageData[]) {
    try {
      const imagesForStorage = images.map(img => ({
        id: img.id,
        name: img.name,
        blob: img.blob
      }));
      localStorage.setItem('images', JSON.stringify(imagesForStorage));
    } catch (error) {
      console.error('Error saving images to localStorage:', error);
    }
  }
}
