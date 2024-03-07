using EPiServer;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Modules.Internal;
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
        private static readonly IContentTypeRepository ContentTypeRepo = ServiceLocator.Current.GetInstance<IContentTypeRepository>();
        private static readonly IContentRepository ContentRepo = ServiceLocator.Current.GetInstance<IContentRepository>();
        private static readonly IAdministrationSettingsService SettingsService = ServiceLocator.Current.GetInstance<IAdministrationSettingsService>();
        private static readonly IContentModelUsage ContentUsage = ServiceLocator.Current.GetInstance<IContentModelUsage>();
        private static readonly IUrlResolver UrlResolver = ServiceLocator.Current.GetInstance<IUrlResolver>();

        /// <summary>
        /// Lists all content types available in the site base on group name (AdministrationSetttings group)
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<ContentType> ListAllContentTypes(string groupName)
        {
            // Only list the types with specified group name
            var contentTypes = ContentTypeRepo.List().Where(t =>
             {
                 var settings = SettingsService.GetAttribute(t);
                 return settings.Visible && string.Equals(settings.GroupName.ToLower(), groupName, StringComparison.OrdinalIgnoreCase);
             }).OrderByDescending(p => SettingsService.GetAttribute(p).GroupName);

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
        public static IEnumerable<IContent> ListAllContentOfType(int contentTypeId, string query)
        {
            var contentType = ContentTypeRepo.Load(contentTypeId);
            var contentUsages = ContentUsage.ListContentOfContentType(contentType);

            // Get distinct content references without version
            var contentReferences = contentUsages
                .Select(x => x.ContentLink.ToReferenceWithoutVersion())
                .Distinct();

            // Fetch data from DB
            var instances = contentReferences
                .Select(contentReference => ContentRepo.Get<IContent>(contentReference));

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
            instances = instances.OrderByDescending(t => (t as IVersionable)?.StartPublish);

            return instances;
        }

        /// <summary>
        /// Check if the content type is a block type (Exclude local blocks (block property on pages)).
        /// </summary>
        /// <param name="contentTypeId">The content type identifier.</param>
        /// <returns></returns>
        public static bool IsContentTypeBlockType(int contentTypeId)
        {
            var contentType = ContentTypeRepo.Load(contentTypeId);

            // Exclude local blocks (block property on pages) if the current content type is a block type.
            var modelType = Type.GetType(contentType.ModelTypeString);
            return modelType != null && typeof(BlockData).IsAssignableFrom(modelType);
        }
        /// <summary>
        /// Lists all references of a content instance (a block instance).
        /// </summary>
        /// <param name="blockId">The block identifier.</param>
        /// <param name="query">The query string.</param>
        /// <returns></returns>
        public static IEnumerable<ReferenceInformation> ListAllReferenceOfContentInstance(int blockId, string query)
        {
            var contentLink = new ContentReference(blockId);

            var references = ContentRepo.GetReferencesToContent(contentLink, false);

            // Apply query
            if (!string.IsNullOrWhiteSpace(query))
            {
                references = references.Where(t => t.OwnerName.IndexOf(query, 0, StringComparison.InvariantCultureIgnoreCase) > -1);
            }

            return references;
        }

        /// <summary>
        /// Resolves the CMS edit URL to a specified content instance.
        /// </summary>
        /// <param name="content">The content instance.</param>
        /// <returns></returns>
        public static string ResolveEditUrl(IContent content)
        {
            var language = content is ILocalizable localizable ? localizable.Language.Name : null;
            return language == null ? $"{ModuleResourceResolver.Instance.ResolvePath("CMS", null)}#context=epi.cms.contentdata:///{content.ContentLink}"
                : $"{ModuleResourceResolver.Instance.ResolvePath("CMS", null)}?language={language}#context=epi.cms.contentdata:///{content.ContentLink}";
        }

        /// <summary>
        /// Resolves the CMS edit URL to a specified content instance.
        /// </summary>
        /// <param name="reference">The content instance.</param>
        /// <returns></returns>
        public static string ResolveEditUrl(ReferenceInformation reference)
        {
            var language = reference.OwnerLanguage.Name;
            return $"{ModuleResourceResolver.Instance.ResolvePath("CMS", null)}?language={language}#context=epi.cms.contentdata:///{reference.OwnerID}";
        }

        /// <summary>
        /// Resolves the front-end's view URL to a specified page.
        /// </summary>
        /// <param name="content">The content instance.</param>
        /// <returns></returns>
        public static string ResolveViewUrl(IContent content)
        {
            return UrlResolver.GetUrl(content.ContentLink);
        }

        /// <summary>
        /// Resolves the front-end's view URL to a specified page.
        /// </summary>
        /// <param name="reference"></param>
        /// <returns></returns>
        public static string ResolveViewUrl(ReferenceInformation reference)
        {
            return UrlResolver.GetUrl(reference.OwnerID, reference.OwnerLanguage.Name);
        }

        /// <summary>
        /// Get usage count of the content.
        /// </summary>
        /// <param name="content">The content instance.</param>
        /// <returns></returns>
        public static int GetContentUsageCount(IContent content)
        {
            return ContentRepo.GetReferencesToContent(content.ContentLink, false).Count();
        }
    }
}