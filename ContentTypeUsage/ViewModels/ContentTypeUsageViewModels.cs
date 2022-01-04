using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;

namespace ContentTypeUsage.ViewModels
{
    /// <summary>
    /// View model class for Content Type Usage admin plugin
    /// </summary>
    public class ContentTypeUsageViewModels
    {
        public IEnumerable<SelectListItem> AllBlockTypes { get; set; }

        public IEnumerable<SelectListItem> AllPageTypes { get; set; }
    }
}