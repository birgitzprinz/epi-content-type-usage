using ContentTypeUsage.Helpers;
using ContentTypeUsage.ViewModels;
using EPiServer.Core;
using EPiServer.Logging;
using EPiServer.PlugIn;
using EPiServer.ServiceLocation;
using System;
using System.Linq;
using System.Web.Mvc;

namespace ContentTypeUsage.Controllers
{
    /// <summary>
    /// The controller class for Content Type Usage admin tool
    /// </summary>
    /// <seealso cref="Controller" />
    [GuiPlugIn(
        Area = PlugInArea.AdminMenu,
        Url = "/custom-plugins/content-type-usage",
        DisplayName = "Content Type Usage",
        LanguagePath = "/plugins/contenttypeusage")]
    [Authorize(Roles = "Administrators, WebAdmins, CmsAdmins")]
    public class ContentTypeUsageController : Controller
    {
        private ILogger _log = ServiceLocator.Current.GetInstance<ILogger>();

        public ActionResult Index()
        {
            var model = new ContentTypeUsageViewModels
            {
                AllBlockTypes = Enumerable.Empty<SelectListItem>(),
                AllPageTypes = Enumerable.Empty<SelectListItem>()
            };

            try
            {
                model.AllBlockTypes = ContentTypeUsageHelper.ListAllContentTypes("blocktypes")
                    .Select(t => new SelectListItem { Text = t.LocalizedFullName, Value = t.ID.ToString() });
                model.AllPageTypes = ContentTypeUsageHelper.ListAllContentTypes("pagetypes")
                    .Select(t => new SelectListItem { Text = t.LocalizedFullName, Value = t.ID.ToString() });

                return View("~/modules/_protected/ContentTypeUsage/Views/Index.cshtml", model);
            }
            catch(Exception ex)
            {
                _log.Error("Cannot retrieve list of content types", ex);
                return View("~/modules/_protected/ContentTypeUsage/Views/Index.cshtml", model);
            }
        }

        /// <summary>
        /// Gets all instances of a specified content type with paging & filter support (filter by name).
        /// </summary>
        /// <param name="contentTypeId">The content type identifier.</param>
        /// <param name="page">The page.</param>
        /// <param name="pageSize">Size of the page.</param>
        /// <param name="query">The query string.</param>
        /// <returns></returns>
        [HttpGet]
        public JsonResult GetInstances(int contentTypeId, int page, int pageSize = 10, string query = "")
        {
            var total = 0;
            try
            {
                var result = ContentTypeUsageHelper.ListAllContentOfType(contentTypeId, page, pageSize, query, out total);

                return (Json(new
                {
                    status = true,
                    page = page,
                    pageSize = pageSize,
                    total = total,
                    items = result.Select(t => new
                    {
                        Id = t.ContentLink.ID,
                        Name = t.Name,
                        ViewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                        EditLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                        IsBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                    })
                }, JsonRequestBehavior.AllowGet));
            }
            catch (Exception ex)
            {
                _log.Error("Cannot retrieve list of instances", ex);
                return (Json(new
                {
                    status = true,
                    message = ex.Message
                }, JsonRequestBehavior.AllowGet));
            }
        }

        /// <summary>
        /// Gets all references of a specified block instance with paging & filter support (filter by name).
        /// </summary>
        /// <param name="blockId">The block identifier.</param>
        /// <param name="page">The page.</param>
        /// <param name="pageSize">Size of the page.</param>
        /// <param name="query">The query string.</param>
        /// <returns></returns>
        [HttpGet]
        public JsonResult GetReferences(int blockId, int page, int pageSize = 10, string query = "")
        {
            var total = 0;
            try
            {
                var result = ContentTypeUsageHelper.ListAllReferenceOfContentInstance(blockId, page, pageSize, query, out total);

                return (Json(new
                {
                    status = true,
                    page = page,
                    pageSize = pageSize,
                    total = total,
                    items = result.Select(t => new
                    {
                        Id = t.ContentLink.ID,
                        Name = t.Name,
                        ViewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                        EditLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                        IsBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                    })
                }, JsonRequestBehavior.AllowGet));
            }
            catch (Exception ex)
            {
                _log.Error("Cannot retrieve block's references", ex);
                return (Json(new
                {
                    status = true,
                    message = ex.Message
                }, JsonRequestBehavior.AllowGet));
            }
        }
    }
}