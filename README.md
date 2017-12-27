# epi-content-type-usage
Content type usage plugin for EPiServer CMS 9+

This add-on add a custom tool in EPiServer's Admin menu where user can search for instances of any content types along with their references.

To create a NuGet package, just complete the build of the project, then excute the buildpackage.ps1 script.
To install the NuGet package, configure NuGet's source to point to its folder, then issue the command from package manager console:

Install-Package Eshn.ContentTypeUsage
