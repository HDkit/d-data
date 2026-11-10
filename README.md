# d-data

**AI-powered file processor**

Transform documents and raw data into organized, structured notes and spreadsheets using AI.

## Project layout

- `backend/DDataServer` — ASP.NET Core API and in-memory document store
- `frontend` — Next.js document dashboard

## Run locally

The backend solution is `backend/DDataServer.slnx`, and the development Makefile is `backend/Makefile`.

Start the API in one terminal:

```bash
dotnet run --project backend/DDataServer/DDataServer.csproj --launch-profile http
```

Start the dashboard in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The dashboard uses `http://localhost:5087` by default. To use another API URL, copy `frontend/.env.example` to `frontend/.env.local` and change `NEXT_PUBLIC_API_BASE_URL`.

The API currently uses an in-memory store, so documents are reset when the backend restarts. The dashboard exposes all document endpoints: list/filter, get by ID, create, update, and delete.

From the repository root, use `make -C backend build`, `make -C backend start`, or `make -C backend frontend-dev` for the corresponding workflows.

**Example use cases:**

* Digitalize exams for import/export to e-learning platforms
* Convert CVs into structured formats that fit application forms
* Transform raw scraped data into clean, structured datasets for analytics
* Extract and structure information from unstructured documents, such as civil law cases and study materials.
