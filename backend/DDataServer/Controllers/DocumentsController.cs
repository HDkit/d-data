using DDataServer.Models;
using DDataServer.Services;
using Microsoft.AspNetCore.Mvc;

namespace DDataServer.Controllers;

[ApiController]
[Route("documents")]
public sealed class DocumentsController(InMemoryDocumentStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Document>> GetAll([FromQuery] DocumentQuery query)
    {
        var documents = store.GetAll()
            .Where(document =>
                (string.IsNullOrWhiteSpace(query.Search) ||
                 document.Name.Contains(query.Search, StringComparison.OrdinalIgnoreCase) ||
                 document.Author.Contains(query.Search, StringComparison.OrdinalIgnoreCase) ||
                 document.FileFormat.Contains(query.Search, StringComparison.OrdinalIgnoreCase)) &&
                (string.IsNullOrWhiteSpace(query.Name) ||
                 document.Name.Contains(query.Name, StringComparison.OrdinalIgnoreCase)) &&
                (string.IsNullOrWhiteSpace(query.Author) ||
                 document.Author.Contains(query.Author, StringComparison.OrdinalIgnoreCase)) &&
                (string.IsNullOrWhiteSpace(query.FileFormat) ||
                 document.FileFormat.Equals(query.FileFormat, StringComparison.OrdinalIgnoreCase)) &&
                (!query.CreatedFrom.HasValue || document.DateCreated >= query.CreatedFrom.Value) &&
                (!query.CreatedTo.HasValue || document.DateCreated <= query.CreatedTo.Value) &&
                (!query.MinSize.HasValue || document.Size >= query.MinSize.Value) &&
                (!query.MaxSize.HasValue || document.Size <= query.MaxSize.Value))
            .OrderBy(document => document.Name)
            .ThenBy(document => document.Id)
            .ToArray();

        return Ok(documents);
    }

    [HttpGet("{id:guid}")]
    public ActionResult<Document> Get(Guid id)
    {
        var document = store.Get(id);
        return document is null ? NotFound() : Ok(document);
    }

    [HttpPost]
    public ActionResult<Document> Create(CreateDocumentRequest request)
    {
        var document = store.Add(new Document(
            Guid.Empty,
            request.Name!.Trim(),
            request.Author!.Trim(),
            request.DateCreated ?? DateTimeOffset.UtcNow,
            request.Size,
            DocumentFileFormats.Normalize(request.FileFormat!)));

        return CreatedAtAction(nameof(Get), new { id = document.Id }, document);
    }

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, UpdateDocumentRequest request)
    {
        var existing = store.Get(id);
        if (existing is null)
        {
            return NotFound();
        }

        var document = new Document(
            id,
            request.Name!.Trim(),
            request.Author!.Trim(),
            request.DateCreated ?? existing.DateCreated,
            request.Size,
            DocumentFileFormats.Normalize(request.FileFormat!));

        store.Update(id, document);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id) => store.Delete(id) ? NoContent() : NotFound();
}
