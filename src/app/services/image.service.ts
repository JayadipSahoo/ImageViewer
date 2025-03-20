import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Image {
  id: number;
  name: string;
  url: string;
  file: File;
}

interface StoredImage {
  id: number;
  name: string;
  type: string;
  fileData: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private images = new BehaviorSubject<Image[]>([]);
  private counter = 1;

  constructor() {
    // Load images from localStorage on service initialization
    const savedImages = localStorage.getItem('images');
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        // Convert stored data back to File objects
        const reconstitutedImages = parsed.map((img: any) => ({
          ...img,
          file: new File([base64ToBlob(img.fileData, img.type)], img.name, { type: img.type })
        }));
        this.images.next(reconstitutedImages);
        this.counter = Math.max(...reconstitutedImages.map((img: Image) => img.id)) + 1;
      } catch (e) {
        console.error('Failed to parse saved images:', e);
      }
    }
  }

  private saveToLocalStorage(images: Image[]) {
    try {
      // Convert File objects to base64 for storage
      const storableImages = images.map(img => ({
        id: img.id,
        name: img.name,
        type: img.file.type,
        fileData: null as string | null
      }));

      // Convert files to base64
      const promises = images.map((img, index) => 
        fileToBase64(img.file).then(base64 => {
          storableImages[index].fileData = base64;
        })
      );

      Promise.all(promises).then(() => {
        localStorage.setItem('images', JSON.stringify(storableImages));
      });
    } catch (e) {
      console.error('Failed to save images to localStorage:', e);
    }
  }

  getImages(): Observable<Image[]> {
    return this.images.asObservable();
  }

  uploadImages(files: File[]): Observable<Image[]> {
    const newImages: Image[] = files.map(file => ({
      id: this.counter++,
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));

    const updatedImages = [...this.images.value, ...newImages];
    this.images.next(updatedImages);
    this.saveToLocalStorage(updatedImages);

    return of(newImages);
  }

  updateImage(id: number, file: File): Observable<Image> {
    const updatedImages = this.images.value.map(img => {
      if (img.id === id) {
        // Revoke old object URL to prevent memory leaks
        URL.revokeObjectURL(img.url);
        
        const updated = {
          ...img,
          name: file.name,
          url: URL.createObjectURL(file),
          file: file
        };
        return updated;
      }
      return img;
    });

    this.images.next(updatedImages);
    this.saveToLocalStorage(updatedImages);

    return of(updatedImages.find(img => img.id === id)!);
  }

  deleteImage(id: number): Observable<void> {
    const image = this.images.value.find(img => img.id === id);
    if (image) {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(image.url);
    }

    const updatedImages = this.images.value.filter(img => img.id !== id);
    this.images.next(updatedImages);
    this.saveToLocalStorage(updatedImages);

    return of(void 0);
  }

  // Clean up method to be called when the application shuts down
  cleanup() {
    // Revoke all object URLs to prevent memory leaks
    this.images.value.forEach(img => {
      URL.revokeObjectURL(img.url);
    });
  }
}

// Helper functions for base64 conversion
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToBlob(base64: string, type: string): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: type });
}
