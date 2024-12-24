import os
import fitz  # PyMuPDF
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.conf import settings

class FilePreviewService:
    PREVIEW_SIZE = (800, 800)  # Max preview dimensions
    
    def __init__(self):
        self.supported_types = {
            'application/pdf': self._preview_pdf,
            'image/jpeg': self._preview_image,
            'image/png': self._preview_image,
            'image/gif': self._preview_image,
            'text/plain': self._preview_text,
        }

    def generate_preview(self, file_obj, content_type):
        """Generate a preview for the given file if supported."""
        if content_type not in self.supported_types:
            return None
            
        try:
            return self.supported_types[content_type](file_obj)
        except Exception as e:
            print(f"Preview generation failed: {str(e)}")
            return None

    def _preview_pdf(self, file_obj):
        """Generate preview for PDF files."""
        pdf_document = fitz.open(stream=file_obj.read(), filetype="pdf")
        first_page = pdf_document[0]
        
        # Convert to PNG
        pix = first_page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img_data = pix.tobytes("png")
        
        # Create thumbnail
        return self._create_thumbnail(Image.open(BytesIO(img_data)))

    def _preview_image(self, file_obj):
        """Generate preview for image files."""
        image = Image.open(file_obj)
        return self._create_thumbnail(image)

    def _preview_text(self, file_obj):
        """Generate preview for text files."""
        # For text files, we'll return the first few lines
        content = file_obj.read().decode('utf-8')
        preview = '\n'.join(content.split('\n')[:20])  # First 20 lines
        return preview.encode('utf-8')

    def _create_thumbnail(self, image):
        """Create a thumbnail from an image."""
        # Convert to RGB if necessary
        if image.mode not in ('L', 'RGB'):
            image = image.convert('RGB')
            
        # Create thumbnail
        image.thumbnail(self.PREVIEW_SIZE, Image.Resampling.LANCZOS)
        
        # Save to bytes
        output = BytesIO()
        image.save(output, format='JPEG', quality=85)
        return output.getvalue() 