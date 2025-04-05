import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { ImageService, ImageData } from '../../services/image.service';
import { ImageEditorComponent } from '../image-editor/image-editor.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    DragDropModule
  ],
  template: `
    <div class="gallery-container">
      <div class="main-grid">
        <div class="drop-zone" 
             cdkDropList
             #mainDropList="cdkDropList"
             [cdkDropListData]="selectedImageArray"
             [cdkDropListConnectedTo]="[sideDropList]"
             (cdkDropListDropped)="onMainDrop($event)"
             [class.has-image]="selectedImage">
          <div *ngIf="!selectedImage" class="drop-zone-content">
            <mat-icon>cloud_upload</mat-icon>
            <p>Drag and drop an image here to edit</p>
            <input
              type="file"
              #fileInput
              style="display: none"
              (change)="onFileSelected($event)"
              accept="image/*"
              multiple
            />
            <button mat-raised-button color="primary" (click)="fileInput.click()">
              Upload Images
            </button>
          </div>
          <mat-card *ngIf="selectedImage" class="image-card" cdkDrag [cdkDragDisabled]="true">
            <img [src]="getImageUrl(selectedImage.id)" [alt]="selectedImage.name">
            <div class="image-overlay">
              <button mat-icon-button color="primary" (click)="openEditor(selectedImage)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="primary" (click)="downloadImage(selectedImage)">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="clearSelected()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </mat-card>
        </div>
      </div>

      <div class="side-panel">
        <h3>All Images</h3>
        <div class="image-list" 
             cdkDropList
             #sideDropList="cdkDropList"
             [cdkDropListData]="allImages"
             [cdkDropListConnectedTo]="[mainDropList]"
             (cdkDropListDropped)="onSideDrop($event)">
          <div *ngFor="let image of allImages" 
               class="image-item"
               cdkDrag
               [class.selected]="selectedImage?.id === image.id"
               (click)="selectImage(image)">
            <img [src]="getImageUrl(image.id)" [alt]="image.name">
            <div class="image-item-overlay">
              <button mat-icon-button (click)="$event.stopPropagation(); openEditor(image)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="$event.stopPropagation(); deleteImage(image)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-container {
      display: flex;
      gap: 24px;
      padding: 24px;
      height: calc(100vh - 100px);
    }

    .main-grid {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drop-zone {
      width: 100%;
      height: 100%;
      border: 2px dashed #ccc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      transition: all 0.3s ease;
      min-height: 400px;

      &.cdk-drop-list-dragging {
        border-color: #1976d2;
        background: rgba(25, 118, 210, 0.1);
      }

      &.has-image {
        border-style: solid;
        border-color: #1976d2;
        background: #fff;
      }

      .drop-zone-content {
        text-align: center;
        color: #666;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
        }

        p {
          margin: 0;
          font-size: 16px;
        }
      }
    }

    .image-card {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      background: transparent;
      box-shadow: none;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        opacity: 0;
        transition: opacity 0.3s;

        button {
          background: white;
          
          &[color="warn"] {
            background: #f44336;
            color: white;
          }
        }
      }

      &:hover .image-overlay {
        opacity: 1;
      }
    }

    .side-panel {
      width: 300px;
      background: #f5f5f5;
      border-radius: 4px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      
      h3 {
        margin: 0 0 16px;
        color: #1976d2;
      }
    }

    .image-list {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 4px;
      min-height: 200px;

      &.cdk-drop-list-dragging .image-item:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    }

    .image-item {
      position: relative;
      aspect-ratio: 1;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      border: 2px solid transparent;
      transition: transform 0.2s;

      &.selected {
        border-color: #1976d2;
      }

      &:hover {
        transform: translateY(-2px);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-item-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s;

        button {
          background: white;
        }
      }

      &:hover .image-item-overlay {
        opacity: 1;
      }
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class GalleryComponent implements OnInit {
  allImages: ImageData[] = [];
  selectedImage: ImageData | null = null;
  private imagesSubject = new BehaviorSubject<ImageData[]>([]);

  // Computed property to handle the selected image array for drag and drop
  get selectedImageArray(): ImageData[] {
    return this.selectedImage ? [this.selectedImage] : [];
  }

  constructor(
    public imageService: ImageService,
    private dialog: MatDialog
  ) {}

  // Public method to get image URL
  getImageUrl(id: number): string {
    return this.imageService.getImageUrl(id);
  }

  ngOnInit() {
    // Subscribe to image service updates
    this.imageService.getImages().subscribe(images => {
      console.log('Received images update:', images);
      this.allImages = images;
      this.imagesSubject.next(images);
      
      // If we have a selected image, update its data
      if (this.selectedImage) {
        const updatedImage = images.find(img => img.id === this.selectedImage?.id);
        this.selectedImage = updatedImage || null;
      }
    });

    // Force a refresh of images when component initializes
    this.loadImages();
  }

  loadImages() {
    console.log('Loading images...');
    // This will trigger a new HTTP request to get fresh data
    this.imageService.loadImages();
  }

  selectImage(image: ImageData) {
    this.selectedImage = image;
  }

  clearSelected() {
    this.selectedImage = null;
  }

  onMainDrop(event: CdkDragDrop<ImageData[]>) {
    if (event.previousContainer === event.container) {
      return;
    }

    const draggedImage = event.previousContainer.data[event.previousIndex];
    this.selectImage(draggedImage);
  }

  onSideDrop(event: CdkDragDrop<ImageData[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  openEditor(image: ImageData) {
    const dialogRef = this.dialog.open(ImageEditorComponent, {
      width: '800px',
      height: '600px',
      data: { 
        imageUrl: this.imageService.getImageUrl(image.id),
        name: image.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.file) {
        if (result.saveAsNew) {
          // Upload as new image
          this.imageService.uploadImages([result.file]).subscribe({
            next: (uploadedImages) => {
              console.log('New image uploaded:', uploadedImages);
              this.loadImages();
            },
            error: (error) => {
              console.error('Error uploading new image:', error);
            }
          });
        } else {
          // Update existing image
          this.imageService.updateImage(image.id, result.file).subscribe({
            next: (updatedImage) => {
              console.log('Image updated:', updatedImage);
              this.loadImages();
            },
            error: (error) => {
              console.error('Error updating image:', error);
            }
          });
        }
      }
    });
  }

  downloadImage(image: ImageData) {
    const link = document.createElement('a');
    link.href = this.imageService.getImageUrl(image.id);
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  deleteImage(image: ImageData) {
    if (confirm(`Are you sure you want to delete ${image.name}?`)) {
      this.imageService.deleteImage(image.id).subscribe({
        next: () => {
          if (this.selectedImage?.id === image.id) {
            this.selectedImage = null;
          }
        },
        error: (error: Error) => {
          console.error('Error deleting image:', error);
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      console.log(`Uploading ${files.length} files...`);
      
      this.imageService.uploadImages(files).subscribe({
        next: (uploadedImages) => {
          console.log('Upload completed:', uploadedImages);
          // Refresh the image list after upload
          this.loadImages();
        },
        error: (error) => {
          console.error('Upload failed:', error);
          // You might want to show an error message to the user here
        }
      });
    }
  }
}

