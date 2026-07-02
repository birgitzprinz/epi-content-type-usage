Eshn.ContentTypeUsage v2.3.1 (CMS 12 branch)


REQUIREMENTS
============
- Optimizely CMS 12 (EPiServer.CMS.UI.Core >= 12.4.0, < 13.0.0)
- .NET 5 or .NET 6
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

v2.3.1
  - Updated Index.cshtml

v2.3.0
  - Replaced jQuery / MicroModal / Chosen front-end stack with React 18 + Bootstrap 5.3.3 + Webpack 5
  - Added Babel build pipeline with production and development modes
  - Added source map support (eval-source-map for dev, source-map for prod)
  - Added 84 unit tests with Jest and React Testing Library
  - Automated ContentTypeUsage.zip creation via Create-ModuleZip.ps1 post-build step
  - module.config clientResourceRelativePath is now set from the package version automatically
  - Fixed JSON property names to camelCase to match React component expectations
  - Loading overlay covers content table and search area during AJAX requests
  - Loading overlay added to references modal body during AJAX requests
  - Filter button clears search input immediately
  - Suggestion label updates only after search results are returned
  - Search box and Search button remain visible when a search returns no results
  - Search box and Search button are hidden while the Filter AJAX request is in flight

v2.2.0
  - Added support for .NET 6
  - Implement a feature allowing the tool to be relocated from the admin area, enabling editor access
  - Added support for multiple languages for all block usages across different versions
  - Hide Usages column for page types

v2.1.0
  - First version for Optimizely CMS 12
