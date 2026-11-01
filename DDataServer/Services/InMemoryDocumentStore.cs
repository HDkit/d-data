using System.Collections.Concurrent;
using DDataServer.Models;

namespace DDataServer.Services;

public sealed class InMemoryDocumentStore
{
    private readonly ConcurrentDictionary<Guid, Document> _documents = new();

    public IReadOnlyCollection<Document> GetAll() => _documents.Values.ToArray();

    public Document? Get(Guid id) =>
        _documents.TryGetValue(id, out var document) ? document : null;

    public Document Add(Document document)
    {
        var created = document with { Id = Guid.NewGuid() };
        _documents[created.Id] = created;
        return created;
    }

    public bool Update(Guid id, Document document)
    {
        if (!_documents.ContainsKey(id))
        {
            return false;
        }

        _documents[id] = document with { Id = id };
        return true;
    }

    public bool Delete(Guid id) => _documents.TryRemove(id, out _);
}
