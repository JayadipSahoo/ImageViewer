import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    ImageCropperComponent,
    MatIconModule
  ],
  template: `
    <div class="editor-container">
      <h2>Edit Image</h2>
      
      <div class="editor-content">
        <image-cropper
          [imageURL]="data.imageUrl"
          [maintainAspectRatio]="true"
          [aspectRatio]="4/3"
          [resizeToWidth]="800"
          format="png"
          [roundCropper]="false"
          [canvasRotation]="rotation"
          [transform]="transform"
          [alignImage]="'center'"
          (imageCropped)="imageCropped($event)"
          (loadImageFailed)="loadImageFailed()"
          (imageLoaded)="imageLoaded()"
        ></image-cropper>

        <div class="editor-controls">
          <button mat-icon-button (click)="rotateLeft()" matTooltip="Rotate Left">
            <mat-icon>rotate_left</mat-icon>
          </button>
          <button mat-icon-button (click)="rotateRight()" matTooltip="Rotate Right">
            <mat-icon>rotate_right</mat-icon>
          </button>
          <button mat-icon-button (click)="flipHorizontal()" matTooltip="Flip Horizontal">
            <mat-icon>flip</mat-icon>
          </button>
          <button mat-icon-button (click)="flipVertical()" matTooltip="Flip Vertical">
            <mat-icon style="transform: rotate(90deg)">flip</mat-icon>
          </button>
          <button mat-icon-button (click)="downloadEditedImage()" color="primary" matTooltip="Download" [disabled]="!croppedImage?.blob">
            <mat-icon>download</mat-icon>
          </button>
        </div>
      </div>

      <div class="editor-footer">
        <mat-checkbox [(ngModel)]="saveAsNew">Save as new image</mat-checkbox>
        <div class="action-buttons">
          <button mat-button (click)="cancel()">Cancel</button>
          <button mat-raised-button color="primary" (click)="save()" [disabled]="!croppedImage?.blob">
            {{ saveAsNew ? 'Save as New' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      padding: 20px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .editor-content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .editor-controls {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .editor-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    image-cropper {
      max-height: 60vh;
      background: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class ImageEditorComponent implements OnInit {
  saveAsNew = false;
  croppedImage: ImageCroppedEvent | null = null;
  rotation = 0;
  transform = {
    scale: 1,
    flipH: false,
    flipV: false
  };
  isImageLoaded = false;

  constructor(
    public dialogRef: MatDialogRef<ImageEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string, name: string },
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('Editor opened with image URL:', this.data.imageUrl);
  }

  imageCropped(event: ImageCroppedEvent) {
    console.log('Image cropped:', event);
    this.croppedImage = event;
  }

  imageLoaded() {
    console.log('Image loaded successfully');
    this.isImageLoaded = true;
  }

  loadImageFailed() {
    console.error('Failed to load image');
    this.snackBar.open('Failed to load image', 'Close', { duration: 3000 });
  }

  rotateLeft() {
    this.rotation = (this.rotation - 90) % 360;
  }

  rotateRight() {
    this.rotation = (this.rotation + 90) % 360;
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  downloadEditedImage() {
    if (!this.croppedImage?.blob) {
      this.snackBar.open('No image to download', 'Close', { duration: 3000 });
      return;
    }

    try {
      const url = window.URL.createObjectURL(this.croppedImage.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${this.data.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Image downloaded successfully', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error downloading image:', error);
      this.snackBar.open('Failed to download image', 'Close', { duration: 3000 });
    }
  }

  async save() {
    if (!this.croppedImage?.blob) {
      this.snackBar.open('No image to save', 'Close', { duration: 3000 });
      return;
    }

    try {
      const fileName = this.saveAsNew ? `edited_${this.data.name}` : this.data.name;
      const file = new File([this.croppedImage.blob], fileName, { type: 'image/png' });
      
      this.dialogRef.close({
        file,
        saveAsNew: this.saveAsNew
      });
    } catch (error) {
      console.error('Error saving image:', error);
      this.snackBar.open('Failed to save image', 'Close', { duration: 3000 });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
