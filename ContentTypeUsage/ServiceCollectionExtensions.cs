using EPiServer.Shell.Modules;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using Microsoft.Extensions.Configuration;

namespace ContentTypeUsage
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddContentTypeUsage(this IServiceCollection services, Action<ContentTypeUsageOptions> setupAction)
        {
            services.Configure<ProtectedModuleOptions>(
                pm =>
                {
                    if (!pm.Items.Any(i => i.Name.Equals("ContentTypeUsage", StringComparison.OrdinalIgnoreCase)))
                    {
                        pm.Items.Add(new() { Name = "ContentTypeUsage" });
                    }
                });

            var providerOptions = new ContentTypeUsageOptions();
            setupAction(providerOptions);

            services.AddOptions<ContentTypeUsageOptions>().Configure<IConfiguration>((options, configuration) =>
            {
                setupAction(options);
                configuration.GetSection("ContentTypeUsage").Bind(options);
            });

            return services;
        }
    }
}
