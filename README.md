# Image Viewer Application

A modern Angular application for viewing and editing images in a structured grid layout. This application allows users to load images from a local folder, view them in a 2×2 grid, and perform basic image editing operations like cropping and rotation.

## Features

- **Folder Selection**: Easy folder selection for loading multiple images at once
- **Grid View**: Display images in a 2×2 grid layout
- **Side Panel**: Additional images available in a scrollable side panel
- **Image Editing**:
  - Crop images with an interactive cropper
  - Rotate images in 90-degree increments
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Local Storage**: Images persist between sessions using browser storage

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16.x or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Angular CLI](https://angular.io/cli) (version 17.x)

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ImageViewer/image-viewer-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install Required Angular Material Packages**
   ```bash
   ng add @angular/material
   npm install ngx-image-cropper
   ```

4. **Start Development Server**
   ```bash
   ng serve
   ```

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:4200`
   - The application should now be running

## Project Structure

```
image-viewer-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── upload/
│   │   │   │   └── upload.component.ts
│   │   │   ├── gallery/
│   │   │   │   └── gallery.component.ts
│   │   │   └── image-editor/
│   │   │       └── image-editor.component.ts
│   │   ├── services/
│   │   │   └── image.service.ts
│   │   ├── models/
│   │   │   └── image.model.ts
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── assets/
│   └── styles.scss
├── package.json
└── angular.json
```

## Component Overview

### 1. Upload Component
- Entry point for loading images
- Handles folder selection and image filtering
- Routes to gallery view after successful upload

### 2. Gallery Component
- Displays images in a 2×2 grid
- Shows additional images in side panel
- Enables drag-and-drop between panel and grid
- Click on image opens editor dialog

### 3. Image Editor Component
- Provides image editing capabilities
- Crop functionality with aspect ratio control
- Rotation controls
- Save/Cancel options

## Usage Guide

1. **Loading Images**
   - Click "Select Image Folder" button
   - Choose a folder containing images
   - Wait for images to load
   - You'll be automatically redirected to the gallery view

2. **Gallery View**
   - Main grid shows up to 4 images
   - Side panel shows all loaded images
   - Drag images from panel to grid to rearrange
   - Click any image to open editor

3. **Editing Images**
   - Click an image to open editor
   - Use crop tool to select area
   - Use rotation buttons to rotate image
   - Click Save to keep changes or Cancel to discard

## Development Notes

### Key Dependencies
- @angular/material: UI components
- ngx-image-cropper: Image cropping functionality
- @angular/cdk: Drag and drop functionality

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

### Local Storage
- Images are stored in browser's localStorage
- Maximum storage size depends on browser (usually 5-10 MB)
- Clear browser data to reset storage

## Troubleshooting

1. **Images Not Loading**
   - Check if folder contains supported image formats (JPG, PNG, GIF)
   - Ensure images are not too large (recommend < 5MB each)
   - Check browser console for specific errors

2. **Editor Not Opening**
   - Clear browser cache
   - Check console for JavaScript errors
   - Ensure all dependencies are installed correctly

3. **Performance Issues**
   - Reduce number of loaded images
   - Check image sizes
   - Clear browser cache and reload

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
