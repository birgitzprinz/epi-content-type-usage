using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.Framework.Localization;
using EPiServer.Framework.Localization.XmlResources;
using System.Reflection;
using System.Web.Mvc;
using System.Web.Routing;

namespace ContentTypeUsage.Initialization
{
    [InitializableModule]
    public class ContentTypeUsageInitialization: IInitializableModule
    {
        public void Initialize(InitializationEngine context)
        {
            // Map custom route for Content Type Usage admin plugin
            RouteTable.Routes.MapRoute(
                null,
                "custom-plugins/content-type-usage",
                new { controller = "ContentTypeUsage", action = "Index" });
            RouteTable.Routes.MapRoute(
                null,
                "custom-plugins/content-type-usage/GetInstances",
                new { controller = "ContentTypeUsage", action = "GetInstances" });
            RouteTable.Routes.MapRoute(
                null,
                "custom-plugins/content-type-usage/GetReferences",
                new { controller = "ContentTypeUsage", action = "GetReferences" });

            // Language translation
            var localizationService = LocalizationService.Current as ProviderBasedLocalizationService;
            var localizationProvider = new EmbeddedXmlLocalizationProviderInitializer().GetInitializedProvider("Eshn.ContentTypeUsage", Assembly.GetExecutingAssembly());
            localizationService.Providers.Add(localizationProvider);
        }

        public void Uninitialize(InitializationEngine context)
        {

        }
    }
}