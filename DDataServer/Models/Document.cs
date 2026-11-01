namespace DDataServer.Models;

public sealed record Document(
    Guid Id,
    string Name,
    string Author,
    DateTimeOffset DateCreated,
    long Size,
    string FileFormat);
