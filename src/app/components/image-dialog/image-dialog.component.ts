import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageData } from '../../services/image.service';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.name }}</h2>
    <mat-dialog-content>
      <div class="image-container">
        <img [src]="data.url" [alt]="data.name">
        <div class="image-info">
          <p><strong>Size:</strong> {{ formatFileSize(data.fileSize) }}</p>
          <p><strong>Uploaded:</strong> {{ data.uploadDate | date }}</p>
          <p><strong>Type:</strong> {{ data.contentType }}</p>
        </div>
      </div>
      <div class="image-actions">
        <button mat-raised-button color="accent" (click)="downloadImage()">
          <mat-icon>download</mat-icon>
          Download
        </button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .image-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 20px;
    }
    img {
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
      border-radius: 4px;
    }
    .image-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
    }
    .image-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    mat-dialog-content {
      max-width: 800px;
      max-height: 80vh;
      overflow: auto;
    }
  `]
})
export class ImageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageData
  ) {}

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadImage() {
    if (!this.data.url || !this.data.name) {
      console.error('Image URL or name is missing');
      return;
    }
    
    const link = document.createElement('a');
    link.href = this.data.url;
    link.download = this.data.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
