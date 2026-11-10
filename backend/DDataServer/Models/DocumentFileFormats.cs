using System.ComponentModel.DataAnnotations;

namespace DDataServer.Models;

public static class DocumentFileFormats
{
    private static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase)
    {
        // Text and structured data
        "txt", "md", "markdown", "csv", "tsv", "json", "xml", "html", "htm", "rtf",

        // Common document formats
        "pdf", "doc", "docx", "odt", "xls", "xlsx", "ods",

        // Readable image formats. GIF is intentionally excluded.
        "jpg", "jpeg", "png", "webp", "bmp", "tif", "tiff", "svg", "avif"
    };

    public static bool IsAllowed(string? fileFormat) =>
        !string.IsNullOrWhiteSpace(fileFormat) && Allowed.Contains(Normalize(fileFormat));

    public static string Normalize(string fileFormat) =>
        fileFormat.Trim().TrimStart('.').ToLowerInvariant();
}

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class AllowedDocumentFileFormatAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        // Let [Required] provide the missing-value error.
        if (value is null || (value is string text && string.IsNullOrWhiteSpace(text)))
        {
            return ValidationResult.Success;
        }

        return value is string format && DocumentFileFormats.IsAllowed(format)
            ? ValidationResult.Success
            : new ValidationResult(
                "FileFormat must be a supported text, document, or image extension. GIF files are not supported.");
    }
}
