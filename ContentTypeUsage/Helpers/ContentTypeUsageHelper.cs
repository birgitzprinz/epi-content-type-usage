using EPiServer;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Editor;
using EPiServer.ServiceLocation;
using EPiServer.Web.Routing;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ContentTypeUsage.Helpers
{
    /// <summary>
    /// Helper class for Content Type Usage admin tool
    /// </summary>
    public class ContentTypeUsageHelper
    {
        private static IContentTypeRepository _contentTypeRepo = ServiceLocator.Current.GetInstance<IContentTypeRepository>();
        private static IContentRepository _contentRepo = ServiceLocator.Current.GetInstance<IContentRepository>();
        private static IAdministrationSettingsService _settingsService = ServiceLocator.Current.GetInstance<IAdministrationSettingsService>();
        private static IContentModelUsage _contentUsage = ServiceLocator.Current.GetInstance<IContentModelUsage>();
        private static UrlResolver _urlResolver = ServiceLocator.Current.GetInstance<UrlResolver>();

        /// <summary>
        /// Lists all content types available in the site base on group name (AdministrationSetttings group)
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<ContentType> ListAllContentTypes(string groupName)
        {
            // Only list the types with specified group name
            var contentTypes = _contentTypeRepo.List().Where((t) =>
             {
                 var settings = _settingsService.GetAttribute(t);
                 return settings.Visible && string.Equals(settings.GroupName.ToLower(), groupName, StringComparison.OrdinalIgnoreCase);
             }).OrderByDescending(p => _settingsService.GetAttribute(p).GroupName);

            return contentTypes;
        }

        /// <summary>
        /// Lists all instances of a specified content type with paging & filter string applied (filter by name).
        /// </summary>
        /// <param name="contentTypeId">The content type identifier.</param>
        /// <param name="page">The page.</param>
        /// <param name="pageSize">Size of the page.</param>
        /// <param name="query">The query string.</param>
        /// <param name="total">The total number of items for this query.</param>
        /// <returns></returns>
        public static IEnumerable<IContent> ListAllContentOfType(int contentTypeId, int page, int pageSize, string query, out int total)
        {
            var contentType = _contentTypeRepo.Load(contentTypeId);
            var contentUsages = _contentUsage.ListContentOfContentType(contentType);

            // Get distinct content references without version
            var contentReferences = contentUsages
                .Select(x => x.ContentLink.ToReferenceWithoutVersion())
                .Distinct();

            // Fetch data from DB
            var instances = contentReferences
                .Select(contentReference => _contentRepo.Get<IContent>(contentReference));

            // Exclude local blocks (block property on pages) if the current content type is a block type.
            var modelType = Type.GetType(contentType.ModelTypeString);
            if (modelType != null && typeof(BlockData).IsAssignableFrom(modelType))
            {
                // Filter out the page contents (local blocks will point to their ContentLink to their parent pages).
                instances = instances.Where(t => typeof(BlockData).IsAssignableFrom(t.GetType().BaseType));
            }

            // Apply query
            if (!string.IsNullOrWhiteSpace(query))
            {
                instances = instances.Where(t => t.Name.IndexOf(query, 0, StringComparison.InvariantCultureIgnoreCase) > -1);
            }

            // Apply sorting (by publish date descending)
            instances = instances.OrderByDescending(t => (t as IVersionable).StartPublish);

            total = instances.Count();

            var result = instances.Skip((page - 1) * pageSize).Take(pageSize);

            return result;
        }

        /// <summary>
        /// Lists all references of a content instance (a block instance).
        /// </summary>
        /// <param name="blockId">The block identifier.</param>
        /// <param name="page">The page.</param>
        /// <param name="pageSize">Size of the page.</param>
        /// <param name="query">The query string.</param>
        /// <param name="total">The total number of items for this query.</param>
        /// <returns></returns>
        public static IEnumerable<IContent> ListAllReferenceOfContentInstance(int blockId, int page, int pageSize, string query, out int total)
        {
            var contentLink = new ContentReference(blockId);

            // Use IContentRepository to list all references of the block instance
            var references = _contentRepo.GetReferencesToContent(contentLink, false)
                .Select(x => x.OwnerID.ToReferenceWithoutVersion())
                .Distinct();

            var pageList = references.Select(t => _contentRepo.Get<IContent>(t));

            // Apply query
            if (!string.IsNullOrWhiteSpace(query))
            {
                pageList = pageList.Where(t => t.Name.IndexOf(query, 0, StringComparison.InvariantCultureIgnoreCase) > -1);
            }

            // Apply sorting (by publish date descending)
            pageList = pageList.OrderByDescending(t => (t as IVersionable).StartPublish);

            total = pageList.Count();

            var result = pageList.Skip((page - 1) * pageSize).Take(pageSize);
            return result;
        }

        /// <summary>
        /// Resolves the CMS edit URL to a specified content instance.
        /// </summary>
        /// <param name="content">The content instance.</param>
        /// <returns></returns>
        public static string ResolveEditUrl(IContent content)
        {
            return PageEditing.GetEditUrl(content.ContentLink);
        }

        /// <summary>
        /// Resolves the front-end's view URL to a specified page.
        /// </summary>
        /// <param name="content">The content instance.</param>
        /// <returns></returns>
        public static string ResolveViewUrl(IContent content)
        {
            return _urlResolver.GetUrl(content.ContentLink);
        }
    }
}