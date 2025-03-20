import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private images = new BehaviorSubject<any[]>([]);

  constructor() {
    // Load images from localStorage on init
    const savedImages = localStorage.getItem('images');
    if (savedImages) {
      this.images.next(JSON.parse(savedImages));
    }
  }

  getImages(): Observable<any[]> {
    return this.images.asObservable();
  }

  uploadImages(files: File[]): Observable<any[]> {
    return from(Promise.all(
      files.map(async (file) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2);
        const url = URL.createObjectURL(file);
        return { id, file, name: file.name, url };
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

  updateImage(id: string, newFile: File): Observable<any> {
    return from(Promise.resolve()).pipe(
      map(() => {
        const currentImages = this.images.value;
        const imageIndex = currentImages.findIndex(img => img.id === id);
        
        if (imageIndex === -1) return null;

        // Revoke old URL to prevent memory leaks
        URL.revokeObjectURL(currentImages[imageIndex].url);

        const updatedImage = {
          ...currentImages[imageIndex],
          file: newFile,
          url: URL.createObjectURL(newFile)
        };

        const updatedImages = [
          ...currentImages.slice(0, imageIndex),
          updatedImage,
          ...currentImages.slice(imageIndex + 1)
        ];

        this.images.next(updatedImages);
        this.saveToLocalStorage(updatedImages);

        return updatedImage;
      })
    );
  }

  deleteImage(id: string): Observable<void> {
    const currentImages = this.images.value;
    const imageToDelete = currentImages.find(img => img.id === id);
    
    if (imageToDelete) {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(imageToDelete.url);
    }

    const updatedImages = currentImages.filter(img => img.id !== id);
    this.images.next(updatedImages);
    this.saveToLocalStorage(updatedImages);

    return from(Promise.resolve());
  }

  private saveToLocalStorage(images: any[]) {
    const imagesForStorage = images.map(img => ({
      id: img.id,
      name: img.name,
      url: img.url
    }));
    localStorage.setItem('images', JSON.stringify(imagesForStorage));
  }
}
