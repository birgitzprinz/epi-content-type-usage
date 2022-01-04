using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Modules;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;

namespace ContentTypeUsage
{
    [InitializableModule]
    [ModuleDependency(typeof(EPiServer.Shell.UI.InitializationModule))]
    [ModuleDependency(typeof(EPiServer.Web.InitializationModule))]
    public class InitializationModule: IConfigurableModule
    {
        protected ServiceConfigurationContext ServiceConfigurationContext;

        public void ConfigureContainer(
            ServiceConfigurationContext serviceConfigurationContext)
        {
            ServiceConfigurationContext = serviceConfigurationContext;
            serviceConfigurationContext.Services.Configure<ProtectedModuleOptions>(
                options =>
                {
                    // Register shell module
                    if (options.Items.Any(
                        x => x.Name.Equals(nameof(ContentTypeUsage))))
                        return;
                    var moduleDetails = new ModuleDetails
                    {
                        Name = nameof(ContentTypeUsage),
                        Assemblies = { nameof(ContentTypeUsage)}
                    };
                    options.Items.Add(moduleDetails);
                });
            serviceConfigurationContext.Services.Configure(
                (Action<RazorViewEngineOptions>)(ro =>
               {
                   if (ro.ViewLocationExpanders.Any(
                       v =>
                           v.GetType() == typeof(ContentTypeUsageModuleLocationExpander)))
                       return;
                   ro.ViewLocationExpanders.Add(
                        new ContentTypeUsageModuleLocationExpander());
               }));
        }

        public void Initialize(InitializationEngine context)
        {
        }

        public void Uninitialize(InitializationEngine context)
        {
        }
    }
}
