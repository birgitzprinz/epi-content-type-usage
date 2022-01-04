using ContentTypeUsage.Helpers;
using ContentTypeUsage.ViewModels;
using EPiServer.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Linq;

namespace ContentTypeUsage.Controllers
{
    /// <summary>
    /// The controller class for Content Type Usage admin tool
    /// </summary>
    /// <seealso cref="Controller" />
    [Authorize(Roles = "Administrators, WebAdmins, CmsAdmins")]
    [Route("[controller]")]
    public class ContentTypeUsageController : Controller
    {
        [Route("[action]")]
        public IActionResult Index()
        {
            var model = new ContentTypeUsageViewModels
            {
                AllBlockTypes = Enumerable.Empty<SelectListItem>(),
                AllPageTypes = Enumerable.Empty<SelectListItem>()
            };

            model.AllBlockTypes = ContentTypeUsageHelper.ListAllContentTypes("blocktypes")
                .Select(t => new SelectListItem { Text = t.LocalizedFullName, Value = t.ID.ToString() });
            model.AllPageTypes = ContentTypeUsageHelper.ListAllContentTypes("pagetypes")
                .Select(t => new SelectListItem { Text = t.LocalizedFullName, Value = t.ID.ToString() });

            return View(model);
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
        [Route("[action]")]
        public JsonResult GetInstances(int contentTypeId, int page, int pageSize = 10, string query = "")
        {
            try
            {
                var result = ContentTypeUsageHelper.ListAllContentOfType(contentTypeId, page, pageSize, query, out var total);

                return Json(new
                {
                    status = true,
                    page,
                    pageSize,
                    total,
                    items = result.Select(t => new
                    {
                        Id = t.ContentLink.ID,
                        t.Name,
                        ViewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                        EditLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                        IsBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                    })
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = false,
                    message = ex.Message
                });
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
        [Route("[action]")]
        public JsonResult GetReferences(int blockId, int page, int pageSize = 10, string query = "")
        {
            try
            {
                var result = ContentTypeUsageHelper.ListAllReferenceOfContentInstance(blockId, page, pageSize, query, out var total);

                return Json(new
                {
                    status = true,
                    page,
                    pageSize,
                    total,
                    items = result.Select(t => new
                    {
                        Id = t.ContentLink.ID,
                        t.Name,
                        ViewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                        EditLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                        IsBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                    })
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = false,
                    message = ex.Message
                });
            }
        }
    }
}