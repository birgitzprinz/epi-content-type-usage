using EPiServer.Framework.Localization;
using EPiServer.Shell.Navigation;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using EPiServer.ServiceLocation;

namespace ContentTypeUsage
{
    [MenuProvider]
    public class AdminMenuProvider : IMenuProvider
    {
        public IEnumerable<MenuItem> GetMenuItems()
        {
            var options = ServiceLocator.Current.GetInstance<IOptions<ContentTypeUsageOptions>>();
            var basePath = options.Value.AvailableToEditors ? "/global/cms/csp" : "/global/cms/admin/csp";

            var menuItem = new UrlMenuItem(LocalizationService.Current.GetString("/plugins/contenttypeusage/displayname"), basePath, "/ContentTypeUsage/Index")
            {
                IsAvailable = context => true,
                SortIndex = 100
            };

            return new List<MenuItem>(1) { menuItem };
        }
    }
}
