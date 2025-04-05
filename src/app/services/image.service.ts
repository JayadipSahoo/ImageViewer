import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface ImageData {
  id: number;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://localhost:5028/api/image';  // Direct backend URL
  private images = new BehaviorSubject<ImageData[]>([]);

  constructor(private http: HttpClient) {
    this.loadImages();
  }

  loadImages() {
    this.http.get<ImageData[]>(this.apiUrl)
      .subscribe({
        next: (images) => {
          console.log('Images loaded from server:', images);
          this.images.next(images);
        },
        error: (error) => {
          console.error('Error loading images from server:', error);
          this.images.next([]);
        }
      });
  }

  getImages(): Observable<ImageData[]> {
    return this.images.asObservable();
  }

  uploadImages(files: File[]): Observable<ImageData[]> {
    console.log('Starting upload process for', files.length, 'files');
    
    // Create an array of upload observables
    const uploadObservables = files.map(file => {
      console.log('Preparing upload for file:', file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      return this.http.post<ImageData>(`${this.apiUrl}/upload`, formData).pipe(
        tap(response => console.log(`Successfully uploaded ${file.name}:`, response)),
        catchError(error => {
          console.error(`Error uploading ${file.name}:`, error);
          return of(null);
        })
      );
    });

    // Use forkJoin to process all uploads in parallel
    return forkJoin(uploadObservables).pipe(
      map(results => results.filter((result): result is ImageData => result !== null)),
      tap(successfulUploads => {
        console.log('All uploads completed. Successful uploads:', successfulUploads.length);
        
        if (successfulUploads.length > 0) {
          const currentImages = this.images.value;
          const updatedImages = [...currentImages, ...successfulUploads];
          this.images.next(updatedImages);
        }
      })
    );
  }

  updateImage(id: number, newFile: File): Observable<ImageData> {
    const formData = new FormData();
    formData.append('file', newFile);

    return this.http.put<ImageData>(`${this.apiUrl}/${id}`, formData).pipe(
      tap(updatedImage => {
        console.log('Image updated successfully:', updatedImage);
        const currentImages = this.images.value;
        const index = currentImages.findIndex(img => img.id === id);
        if (index !== -1) {
          const updatedImages = [
            ...currentImages.slice(0, index),
            updatedImage,
            ...currentImages.slice(index + 1)
          ];
          this.images.next(updatedImages);
        }
      })
    );
  }

  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log('Image deleted successfully:', id);
        const currentImages = this.images.value;
        const updatedImages = currentImages.filter(img => img.id !== id);
        this.images.next(updatedImages);
      })
    );
  }

  getImageUrl(id: number): string {
    return `${this.apiUrl}/${id}`;
  }
}
