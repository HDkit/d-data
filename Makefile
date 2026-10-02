build:
	dotnet build
clean:
	dotnet clean
restore:
	dotnet restore
watch:
	dotnet watch --project DDataServer/DDataServer.csproj run
start:
	dotnet run --project DDataServer/DDataServer.csproj