using System.ComponentModel.DataAnnotations;

namespace DDataServer.Models;

public sealed class CreateDocumentRequest
{
    [Required]
    [StringLength(200)]
    public string? Name { get; init; }

    [Required]
    [StringLength(200)]
    public string? Author { get; init; }

    public DateTimeOffset? DateCreated { get; init; }

    [Range(0, long.MaxValue)]
    public long Size { get; init; }

    [Required]
    [StringLength(50)]
    [AllowedDocumentFileFormat]
    public string? FileFormat { get; init; }
}
