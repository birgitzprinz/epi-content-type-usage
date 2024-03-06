using ContentTypeUsage.Helpers;
using ContentTypeUsage.ViewModels;
using EPiServer.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Linq;
using EPiServer.Cms.Shell;

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
                .OrderBy(p => !string.IsNullOrEmpty(p.DisplayName) ? p.DisplayName : p.Name)
                .Select(t => new SelectListItem { Text = t.LocalizedFullName, Value = t.ID.ToString() });

            model.AllPageTypes = ContentTypeUsageHelper.ListAllContentTypes("pagetypes")
                .OrderBy(p => !string.IsNullOrEmpty(p.DisplayName) ? p.DisplayName : p.Name)
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
        public JsonResult GetInstances(int contentTypeId, int page, int pageSize = 20, string query = "")
        {
            try
            {
                var result = ContentTypeUsageHelper.ListAllContentOfType(contentTypeId, query);
                var selectedItems = result.Select(t => new
                {
                    Id = t.ContentLink.ID,
                    Name = t.Name,
                    ViewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                    EditLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                    IsBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType),
                    Usages = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                        ? ContentTypeUsageHelper.GetContentUsageCount(t)
                        : 1
                }).OrderByDescending(x => x.Usages)
                  .Skip((page - 1) * pageSize).Take(pageSize);

                return Json(new
                {
                    status = true,
                    page,
                    pageSize,
                    total = result.Count(),
                    items = selectedItems,
                    isSelectedContentTypeBlockType = ContentTypeUsageHelper.IsContentTypeBlockType(contentTypeId)
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
        public JsonResult GetReferences(int blockId, int page, int pageSize = 20, string query = "")
        {
            try
            {
                var result = ContentTypeUsageHelper.ListAllReferenceOfContentInstance(blockId, query);

                var selectedItems = result.Select(t => new
                {
                    Id = t.OwnerID.ID,
                    Name = t.OwnerName + " (" + t.OwnerLanguage.Name + ")",
                    ViewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                    EditLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                    IsBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                }).Skip((page - 1) * pageSize)
                  .Take(pageSize); ;

                return Json(new
                {
                    status = true,
                    page,
                    pageSize,
                    total = result.Count(),
                    items = selectedItems,
                    isSelectedContentTypeBlockType = false
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