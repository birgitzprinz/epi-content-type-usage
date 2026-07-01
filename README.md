[![NuGet](https://img.shields.io/nuget/v/Eshn.ContentTypeUsage.svg?style=flat)](https://www.nuget.org/packages/Eshn.ContentTypeUsage/)
[![Platform](https://img.shields.io/badge/Optimizely-CMS%2013-orange.svg?style=flat)](https://world.optimizely.com/)
[![.NET](https://img.shields.io/badge/.NET-10-blueviolet.svg?style=flat)](https://dotnet.microsoft.com/)

# Optimizely Content Type Usage

Content type usage plugin for Optimizely CMS (formerly EPiServer CMS).

Adds a custom tool in the Optimizely Admin menu where users can search for instances of any content type along with their references.

---

## Branch / Version Support

| Branch | CMS Version | .NET | Status |
|--------|-------------|------|--------|
| **master** | Optimizely CMS 13 | .NET 10 | ✅ Active |
| **CMS12** | EPiServer CMS 12 | .NET 6 | 🔒 Maintenance only |
| CMS11 | EPiServer CMS 11 | .NET Framework | ⛔ Archived |
| CMS10 | EPiServer CMS 10 | .NET Framework | ⛔ Archived |
| CMS9  | EPiServer CMS 9  | .NET Framework | ⛔ Archived |

---

## Requirements (master / CMS 13)

- Optimizely CMS 13 (`EPiServer.CMS.UI.Core` >= 13.0.0, < 14.0.0)
- .NET 10
- Node.js 18+ and npm (required at build time for the React front-end)

---

## Installation

Install via NuGet:

```
dotnet add package Eshn.ContentTypeUsage
```

Register the module in your `Program.cs`:

```csharp
services.Configure<ContentTypeUsageOptions>(options => { });
```

Then access the tool via **Settings → Content Type Usage**.

---

## Building

The `dotnet build` command runs `npm install` and `npm run build` automatically via MSBuild targets — no manual npm commands are needed for normal builds.

To build and create a NuGet package manually, run from the `ContentTypeUsage` project directory:

```
dotnet build -c Release
dotnet pack --no-build -c Release -o ../artifacts
```

---

## Front-End Development

The admin UI is built with **React 18**, **Bootstrap 5**, and bundled with **Webpack 5**.

Source files are under `ClientResources/Scripts/`. Useful npm scripts (run from the `ContentTypeUsage` project directory):

| Command | Description |
|---------|-------------|
| `npm run build` | Production bundle (minified + source map) |
| `npm run build:dev` | Development bundle (full source maps) |
| `npm run watch` | Incremental watch rebuild |
| `npm test` | Run unit tests (Jest + React Testing Library) |

---

## Release Notes

### v3.0.4
- Search box and Search button are hidden while the Filter AJAX request is in flight

### v3.0.3
- Loading overlay now covers the content table and search area during AJAX requests
- Loading overlay added to the references modal body during AJAX requests
- Filter button now clears the search input immediately
- Suggestion label updates only after search results are returned
- Search box and Search button remain visible when a search returns no results

### v3.0.2
- Fixed modal backdrop covering the dialog by rendering it as a DOM sibling of the modal element
- Added developer preview HTML page for local UI testing without a running Optimizely server
- Fixed Visual Studio design-time build (NETSDK1013) by guarding `NuspecFile` on `TargetFramework`

### v3.0.1
- Fixed Visual Studio design-time build error NETSDK1013
- Updated solution file format to VS 2022
- Restyled admin UI with Bootstrap 5.3.3
- Fixed modal backdrop z-index issue

### v3.0.0
- Updated for Optimizely CMS 13 and .NET 10
- Replaced jQuery / MicroModal / Chosen with React 18 + Webpack 5 + Babel
- Added source map support (dev and production)
- Added 84 unit tests with Jest and React Testing Library
- Automated `ContentTypeUsage.zip` creation via post-build MSBuild target
- `module.config` `clientResourceRelativePath` is now set automatically from the package version

### v2.2.0
- First version for EPiServer CMS 12
