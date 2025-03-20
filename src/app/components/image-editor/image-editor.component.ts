import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ImageCropperComponent,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <div class="editor-container">
      <h2>Edit Image</h2>
      
      <div class="editor-content">
        <image-cropper
          [imageFile]="data.image.file"
          [maintainAspectRatio]="true"
          [aspectRatio]="4/3"
          [resizeToWidth]="800"
          (imageCropped)="imageCropped($event)"
          [transform]="transform"
          (imageLoaded)="imageLoaded($event)"
          [roundCropper]="false"
          [canvasRotation]="transform.rotate"
          [style.display]="isImageLoaded ? 'block' : 'none'"
        ></image-cropper>
        
        <div class="loading-message" *ngIf="!isImageLoaded">
          Loading image...
        </div>
        
        <div class="editor-controls" *ngIf="isImageLoaded">
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
        </div>
      </div>

      <div class="save-options">
        <mat-checkbox [(ngModel)]="saveAsNew">Save as new image</mat-checkbox>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="!isImageLoaded">
          {{ saveAsNew ? 'Save as New' : 'Save' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      padding: 20px;
      max-width: 900px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      gap: 20px;

      h2 {
        margin: 0;
        color: #1976d2;
      }
    }

    .editor-content {
      flex: 1;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      image-cropper {
        flex: 1;
        min-height: 300px;
        background: #f5f5f5;
        border-radius: 4px;
      }
    }

    .loading-message {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      background: #f5f5f5;
      border-radius: 4px;
      color: #666;
    }

    .editor-controls {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;

      button {
        background: white;
      }
    }

    .save-options {
      padding: 8px 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
  `]
})
export class ImageEditorComponent {
  transform: { rotate: number; flipH: boolean; flipV: boolean } = {
    rotate: 0,
    flipH: false,
    flipV: false
  };

  croppedImage: string | null = null;
  isImageLoaded = false;
  saveAsNew = false;

  constructor(
    public dialogRef: MatDialogRef<ImageEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: { file: File, name: string, type: string } }
  ) {}

  imageLoaded(image: LoadedImage) {
    this.isImageLoaded = true;
    console.log('Image loaded', image);
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.croppedImage = event.base64;
    }
  }

  rotateLeft() {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate - 90) % 360
    };
  }

  rotateRight() {
    this.transform = {
      ...this.transform,
      rotate: (this.transform.rotate + 90) % 360
    };
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

  save() {
    if (this.croppedImage) {
      fetch(this.croppedImage)
        .then(res => res.blob())
        .then(blob => {
          const fileName = this.saveAsNew 
            ? `edited_${this.data.image.name}`
            : this.data.image.name;
            
          const file = new File([blob], fileName, {
            type: this.data.image.type
          });
          
          this.dialogRef.close({
            file,
            saveAsNew: this.saveAsNew
          });
        });
    } else {
      this.dialogRef.close(null);
    }
  }
}
