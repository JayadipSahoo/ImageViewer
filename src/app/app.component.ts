import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary">
        <span>Image Viewer</span>
        <div class="spacer"></div>
        <nav>
          <a mat-button routerLink="/upload" routerLinkActive="active">
            <mat-icon>upload</mat-icon>
            Upload
          </a>
          <a mat-button routerLink="/gallery" routerLinkActive="active">
            <mat-icon>photo_library</mat-icon>
            Gallery
          </a>
        </nav>
      </mat-toolbar>

      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .spacer {
      flex: 1;
    }

    mat-toolbar {
      nav {
        display: flex;
        gap: 8px;

        a {
          display: flex;
          align-items: center;
          gap: 8px;

          &.active {
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    main {
      flex: 1;
      background: #fafafa;
    }
  `]
})
export class AppComponent {
  title = 'Image Viewer';
}
