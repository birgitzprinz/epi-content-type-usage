[![Platform](https://img.shields.io/badge/Episerver-%209.0.0+-orange.svg?style=flat)](http://world.episerver.com/cms/)

# EPiServer Content Type Usage
Content type usage plugin for EPiServer CMS 9+

---------------------------------------------------------

This add-on adds a custom tool in EPiServer's Admin menu where user can search for instances of any content types along with their references.

For CMS 9, use the branch **"CMS9"**

For CMS 10, use the branch **"CMS10"**

For CMS 11, use the **"master"** branch

To create a NuGet package, just complete the build of the project, then excute the **buildpackage.ps1** script.
To install the NuGet package, configure NuGet's source to point to its folder, then issue the command from package manager console:

```
Install-Package Eshn.ContentTypeUsage
```
