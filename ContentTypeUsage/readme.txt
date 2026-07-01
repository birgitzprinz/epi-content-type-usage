Eshn.ContentTypeUsage v3.0.4


REQUIREMENTS
============
- Optimizely CMS 13 (EPiServer.CMS.UI.Core >= 13.0.0, < 14.0.0)
- .NET 10
- Node.js 18+ and npm (required at build time for the React front-end)


USAGE
============
To access the add-on, go to Admin -> Content Type Usage


INSTALLATION
============
Install via NuGet:

  dotnet add package Eshn.ContentTypeUsage

Register the module in your Program.cs:

  services.AddContentTypeUsage(options => { });


FRONT-END DEVELOPMENT
=====================
The admin UI is built with React 18 and bundled with Webpack 5.

Source files are under:
  ClientResources/Scripts/
    index.jsx                   - React entry point
    utils.js                    - escapeHtml / formatString helpers
    components/
      App.jsx                   - Root component, owns all state and fetch logic
      ContentTypeSelector.jsx   - Content type dropdown and Filter button
      ContentInstancesTable.jsx - Paged table of content instances with search
      ReferencesModal.jsx       - Modal listing block usages with search
      Pager.jsx                 - Reusable pager component

npm scripts (run from the ContentTypeUsage project directory):

  npm run build         - Production bundle (minified, source map .map file)
  npm run build:dev     - Development bundle (full source maps, not minified)
  npm run watch         - Development bundle with incremental watch rebuild
  npm test              - Run unit tests (Jest + React Testing Library)
  npm run test:watch    - Run tests in watch mode

Source maps:
  Development builds use eval-source-map for fastest incremental rebuilds.
  Production builds emit a separate app.bundle.js.map file.
  Both modes map stack traces and DevTools breakpoints back to the original
  .jsx source lines under webpack:// in the browser Sources panel.

The dotnet build runs npm install (first time only) and npm run build
automatically via MSBuild targets, so no manual npm commands are needed
for normal builds.


PACKAGING
=========
The dotnet build also runs Create-ModuleZip.ps1 via a post-build MSBuild
target, which produces ContentTypeUsage.zip automatically.

The zip contains:
  module.config                           (clientResourceRelativePath set to the package version)
  {version}/ClientResources/Styles/       (CSS)
  {version}/ClientResources/Scripts/dist/ (Webpack bundle and source map)

Source files, test files, and node_modules are excluded from the zip.

To build and pack the NuGet package, run from the ContentTypeUsage project directory:

  dotnet build
  dotnet pack --no-build -o ..\artifacts


RELEASE NOTES
=============

v3.0.4
  - Search box and Search button are hidden while the Filter AJAX request is in flight

v3.0.3
  - Loading overlay now covers the content table and search area during AJAX requests
  - Loading overlay added to the references modal body during AJAX requests
  - Filter button now clears the search input immediately
  - Suggestion label updates only after search results are returned
  - Search box and Search button remain visible when a search returns no results

v3.0.2
  - Fixed modal backdrop covering the dialog by rendering it as a DOM sibling of the modal element
  - Added developer preview HTML page for local UI testing without a running Optimizely server
  - Fixed Visual Studio 2026 design-time build (NETSDK1013) by guarding NuspecFile on TargetFramework

v3.0.1
  - Fixed Visual Studio design-time build error NETSDK1013 caused by NuspecFile evaluation with empty TargetFramework
  - Updated solution file format version header from VS 2017 to VS 2022
  - Restyled admin UI with Bootstrap 5.3.3, replacing custom CSS
  - Fixed modal backdrop z-index issue by rendering backdrop as a sibling of the modal element

v3.0.0
  - Updated for Optimizely CMS 13 and .NET 10
  - Replaced removed ModuleResourceResolver with Paths.ProtectedRootPath
  - Replaced obsolete ContentType.LocalizedFullName with LocalizationService.GetContentTypeFullName()
  - Removed CMS 12 navigation helpers (CreatePlatformNavigationMenu / ApplyPlatformNavigation)
  - Replaced jQuery / MicroModal / Chosen front-end stack with React 18
  - Added Webpack 5 + Babel build pipeline with production and development modes
  - Added source map support (eval-source-map for dev, source-map for prod)
  - Added 79 unit tests with Jest and React Testing Library
  - Automated ContentTypeUsage.zip creation via Create-ModuleZip.ps1 post-build step
  - module.config clientResourceRelativePath is now set from the package version automatically

v2.2.0
  - First version for Optimizely CMS 12
