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
    public string? FileFormat { get; init; }
}

public sealed class UpdateDocumentRequest
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
    public string? FileFormat { get; init; }
}

public sealed class DocumentQuery
{
    public string? Search { get; init; }

    public string? Name { get; init; }

    public string? Author { get; init; }

    public string? FileFormat { get; init; }

    public DateTimeOffset? CreatedFrom { get; init; }

    public DateTimeOffset? CreatedTo { get; init; }

    public long? MinSize { get; init; }

    public long? MaxSize { get; init; }
}
