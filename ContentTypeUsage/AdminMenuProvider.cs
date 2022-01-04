using EPiServer.Framework.Localization;
using EPiServer.Shell.Navigation;
using System.Collections.Generic;

namespace ContentTypeUsage
{
    [MenuProvider]
    public class AdminMenuProvider : IMenuProvider
    {
        public IEnumerable<MenuItem> GetMenuItems()
        {
            var menuItem = new UrlMenuItem(LocalizationService.Current.GetString("/plugins/contenttypeusage/displayname"), 
                "/global/cms/admin/csp", "/ContentTypeUsage/Index")
            {
                IsAvailable = context => true, SortIndex = 100
            };

            return new List<MenuItem>(1)
            {
                menuItem
            };
        }
    }
}
