using ContentTypeUsage.Helpers;
using ContentTypeUsage.ViewModels;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Localization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Linq;

namespace ContentTypeUsage.Controllers
{
    /// <summary>
    /// The controller class for Content Type Usage tool
    /// </summary>
    /// <seealso cref="Controller" />
    [Authorize]
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

            model.AllBlockTypes = ContentTypeUsageHelper.ListAllContentTypes(ContentTypeBase.Block)
                .OrderBy(p => !string.IsNullOrEmpty(p.DisplayName) ? p.DisplayName : p.Name)
                .Select(t => new SelectListItem { Text = LocalizationService.Current.GetContentTypeFullName(t), Value = t.ID.ToString() });

            model.AllPageTypes = ContentTypeUsageHelper.ListAllContentTypes(ContentTypeBase.Page)
                .OrderBy(p => !string.IsNullOrEmpty(p.DisplayName) ? p.DisplayName : p.Name)
                .Select(t => new SelectListItem { Text = LocalizationService.Current.GetContentTypeFullName(t), Value = t.ID.ToString() });

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
                var result = ContentTypeUsageHelper.ListAllContentOfType(contentTypeId, query).ToList();
                var selectedItems = result.Select(t => new
                {
                    id = t.ContentLink.ID,
                    name = t.Name,
                    viewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                    editLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                    isBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType),
                    usages = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                        ? ContentTypeUsageHelper.GetContentUsageCount(t)
                        : 1
                }).OrderByDescending(x => x.usages)
                  .Skip((page - 1) * pageSize).Take(pageSize);

                return Json(new
                {
                    status = true,
                    page,
                    pageSize,
                    total = result.Count,
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
                var result = ContentTypeUsageHelper.ListAllReferenceOfContentInstance(blockId, query).ToList();

                var selectedItems = result.Select(t => new
                {
                    id = t.OwnerID.ID,
                    name = t.OwnerName + " (" + t.OwnerLanguage.Name + ")",
                    viewLink = ContentTypeUsageHelper.ResolveViewUrl(t),
                    editLink = ContentTypeUsageHelper.ResolveEditUrl(t),
                    isBlockType = typeof(BlockData).IsAssignableFrom(t.GetType().BaseType)
                }).Skip((page - 1) * pageSize)
                  .Take(pageSize);

                return Json(new
                {
                    status = true,
                    page,
                    pageSize,
                    total = result.Count,
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