using System.ComponentModel.DataAnnotations;

namespace DDataServer.Models;

public sealed class DocumentQuery : IValidatableObject
{
    [StringLength(200)]
    public string? Search { get; init; }

    [StringLength(200)]
    public string? Name { get; init; }

    [StringLength(200)]
    public string? Author { get; init; }

    [StringLength(50)]
    public string? FileFormat { get; init; }

    public DateTimeOffset? CreatedFrom { get; init; }

    public DateTimeOffset? CreatedTo { get; init; }

    [Range(0, long.MaxValue)]
    public long? MinSize { get; init; }

    [Range(0, long.MaxValue)]
    public long? MaxSize { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (CreatedFrom is { } createdFrom &&
            CreatedTo is { } createdTo &&
            createdFrom > createdTo)
        {
            yield return new ValidationResult(
                "CreatedFrom cannot be later than CreatedTo.",
                [nameof(CreatedFrom), nameof(CreatedTo)]);
        }

        if (MinSize is { } minSize &&
            MaxSize is { } maxSize &&
            minSize > maxSize)
        {
            yield return new ValidationResult(
                "MinSize cannot be greater than MaxSize.",
                [nameof(MinSize), nameof(MaxSize)]);
        }
    }
}
