import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ImageService } from '../../services/image.service';
import { ImageEditorComponent } from '../image-editor/image-editor.component';

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
        <mat-grid-list cols="2" rowHeight="1:1" gutterSize="16">
          <mat-grid-tile *ngFor="let image of gridImages; let i = index">
            <mat-card class="image-card">
              <img [src]="image.url" [alt]="image.name">
              <div class="image-overlay">
                <button mat-icon-button color="primary" (click)="openEditor(image)">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>
            </mat-card>
          </mat-grid-tile>
        </mat-grid-list>
      </div>

      <div class="side-panel">
        <h3>All Images</h3>
        <div class="image-list" cdkDropList (cdkDropListDropped)="drop($event)">
          <div *ngFor="let image of allImages; let i = index" 
               class="image-item"
               cdkDrag
               (click)="selectForGrid(image, i)">
            <img [src]="image.url" [alt]="image.name">
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
    }

    .image-card {
      width: 100%;
      height: 100%;
      cursor: pointer;
      overflow: hidden;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
        opacity: 0;
        transition: opacity 0.3s;

        button {
          background: white;
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
    }

    .image-item {
      position: relative;
      aspect-ratio: 1;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;

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
  allImages: any[] = [];
  gridImages: any[] = [];
  selectedIndices: number[] = [0, 1, 2, 3]; // Track which images are in the grid

  constructor(
    private imageService: ImageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.imageService.getImages().subscribe(images => {
      this.allImages = images;
      this.updateGridImages();
    });
  }

  updateGridImages() {
    // Update grid images based on selected indices
    this.gridImages = this.selectedIndices
      .map(index => this.allImages[index])
      .filter(img => img); // Filter out any undefined entries
    
    // If we have fewer than 4 images in the grid, fill from the start
    while (this.gridImages.length < 4 && this.allImages.length > this.gridImages.length) {
      const nextIndex = this.allImages.findIndex(img => !this.gridImages.includes(img));
      if (nextIndex !== -1) {
        this.gridImages.push(this.allImages[nextIndex]);
        this.selectedIndices[this.gridImages.length - 1] = nextIndex;
      }
    }
  }

  selectForGrid(image: any, index: number) {
    const gridIndex = this.selectedIndices.indexOf(index);
    if (gridIndex === -1) {
      // If not in grid, replace the first image
      this.selectedIndices[0] = index;
      // Rotate other indices
      this.selectedIndices = [
        ...this.selectedIndices.slice(0, 1),
        ...this.selectedIndices.slice(1).map(i => 
          i >= this.allImages.length ? 0 : i
        )
      ];
    }
    this.updateGridImages();
  }

  openEditor(image: any) {
    const dialogRef = this.dialog.open(ImageEditorComponent, {
      width: '90vw',
      maxWidth: '1200px',
      data: { image }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.saveAsNew) {
          // Add as a new image
          this.imageService.uploadImages([result.file]).subscribe(newImages => {
            if (newImages && newImages.length > 0) {
              // Add the new image to the grid
              const lastIndex = this.allImages.length;
              this.selectedIndices = [lastIndex, ...this.selectedIndices.slice(0, 3)];
              this.loadImages(); // Reload all images to get the new one
            }
          });
        } else {
          // Update existing image
          this.imageService.updateImage(image.id, result.file).subscribe(updatedImage => {
            if (updatedImage) {
              this.loadImages(); // Reload all images to get the updated one
            }
          });
        }
      }
    });
  }

  deleteImage(image: any) {
    // Remove from selected indices
    this.selectedIndices = this.selectedIndices.map(index => 
      index > this.allImages.indexOf(image) ? index - 1 : index
    );
    
    // Remove from arrays
    this.allImages = this.allImages.filter(img => img.id !== image.id);
    this.updateGridImages();
    
    // Save to service
    this.imageService.deleteImage(image.id).subscribe();
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.allImages, event.previousIndex, event.currentIndex);
    
    // Update selected indices after drag
    this.selectedIndices = this.selectedIndices.map(index => {
      if (index === event.previousIndex) return event.currentIndex;
      if (index === event.currentIndex) return event.previousIndex;
      return index;
    });
    
    this.updateGridImages();
  }
}

