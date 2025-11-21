from django.contrib import admin
from django.utils.html import format_html
from .models import UploadedImage  # <--- CHANGE THIS to your actual Model name

class UploadedImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'preview_image', 'count_objects', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('id', 'detection_results')
    readonly_fields = ('preview_image_large', 'preview_annotated_large', 'uploaded_at')
    def preview_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 60px; height: auto; border-radius: 4px;" />', obj.image.url)
        return "No Image"
    preview_image.short_description = "Thumbnail"

    def count_objects(self, obj):
        if obj.detection_results:
            return len(obj.detection_results)
        return 0
    count_objects.short_description = "Objects Detected"

    def preview_image_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 400px; max-height: 400px;" />', obj.image.url)
        return "No Image"
    preview_image_large.short_description = "Original Image"

    def preview_annotated_large(self, obj):
        if obj.annotated_image:
            return format_html('<img src="{}" style="max-width: 400px; max-height: 400px;" />', obj.annotated_image.url)
        return "Not Processed Yet"
    preview_annotated_large.short_description = "Annotated Image (YOLO)"

    fieldsets = (
        ("Image Info", {
            "fields": ("image", "preview_image_large", "uploaded_at")
        }),
        ("AI Analysis", {
            "fields": ("annotated_image", "preview_annotated_large", "detection_results")
        }),
    )

admin.site.register(UploadedImage, UploadedImageAdmin)