import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageService } from '../../services/image.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="upload-container">
      <h2>Image Gallery Upload</h2>
      <div class="upload-section">
        <input
          #folderInput
          type="file"
          [multiple]="true"
          webkitdirectory
          (change)="handleFolderSelection($event)"
          style="display: none"
        >
        <button mat-raised-button color="primary" (click)="folderInput.click()" [disabled]="loading">
          <mat-icon>create_new_folder</mat-icon>
          Select Image Folder
        </button>
      </div>
      <div class="loading-indicator" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading images from folder...</p>
      </div>
      <div class="error-message" *ngIf="error">
        {{ error }}
      </div>
      <div class="help-text">
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Select Image Folder" to choose a folder containing your images</li>
          <li>Images will be displayed in a 2×2 grid view</li>
          <li>Additional images will be available in a side panel</li>
          <li>Click on any image to edit (crop/rotate)</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .upload-section {
      margin: 20px 0;
      padding: 40px;
      background: #f5f5f5;
      border-radius: 4px;
      text-align: center;
      border: 2px dashed #ccc;

      button {
        padding: 16px 32px;
        font-size: 16px;
      }
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 20px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .error-message {
      color: #f44336;
      padding: 16px;
      background: #ffebee;
      border-radius: 4px;
      margin: 20px 0;
    }

    .help-text {
      margin-top: 40px;
      padding: 20px;
      background: #e3f2fd;
      border-radius: 4px;

      h3 {
        margin-top: 0;
        color: #1976d2;
      }

      ol {
        padding-left: 20px;
      }

      li {
        margin-bottom: 8px;
      }
    }
  `]
})
export class UploadComponent {
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private imageService: ImageService,
    private router: Router
  ) {}

  handleFolderSelection(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.error = 'No folder selected';
      return;
    }

    this.loading = true;
    this.error = null;

    const files = Array.from(input.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      this.error = 'No images found in the selected folder';
      this.loading = false;
      return;
    }

    console.log(`Attempting to upload ${files.length} images`);
    files.forEach(file => {
      console.log(`File to upload: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    });

    // Upload the files using the ImageService
    this.imageService.uploadImages(files).subscribe({
      next: (images) => {
        console.log('Upload response:', images);
        if (images && images.length > 0) {
          console.log(`Successfully uploaded ${images.length} images`);
          this.router.navigate(['/gallery']);
        } else {
          this.error = 'No images were uploaded successfully';
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        if (error.status === 413) {
          this.error = 'Files are too large. Please try uploading fewer or smaller images.';
        } else if (error.status === 415) {
          this.error = 'Unsupported file type. Please ensure all files are valid images.';
        } else if (error.status === 0) {
          this.error = 'Cannot connect to the server. Please check your connection.';
        } else {
          this.error = `Upload failed: ${error.message || 'Unknown error'}`;
        }
      },
      complete: () => {
        this.loading = false;
        console.log('Upload operation completed');
      }
    });
  }
}
