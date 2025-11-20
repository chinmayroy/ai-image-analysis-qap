from django.db import models

class UploadedImage(models.Model):
    image = models.ImageField(upload_to='uploads/')
    annotated_image = models.ImageField(upload_to='annotated/', null=True, blank=True)
    detection_results = models.JSONField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} - {self.uploaded_at}"