define(['apphost', 'globalize'], function (appHost, globalize) {
    'use strict';

    function getDisplayName(item, options) {

        if (!item) {
            throw new Error("null item passed into getDisplayName");
        }

        options = options || {};

        var itemType = item.Type;

        if (itemType === 'Timer') {
            item = item.ProgramInfo || item;
        }

        var name = ((itemType === 'Program' || itemType === 'Recording') && (item.IsSeries || item.EpisodeTitle) ? item.EpisodeTitle : item.Name) || '';

        if (itemType === "TvChannel") {

            if (item.ChannelNumber) {

                if (options.channelNumberFirst) {
                    return item.ChannelNumber + ' ' + name;
                }
                return name + ' ' + item.ChannelNumber;
            }
            return name;
        }
        if (/*options.isInlineSpecial &&*/ itemType === "Episode" && item.ParentIndexNumber === 0) {

            name = globalize.translate('ValueSpecialEpisodeName', name);

        } else if ((itemType === "Episode" || itemType === 'Program') && item.IndexNumber != null && options.includeIndexNumber !== false) {

            var number = item.IndexNumber;
            var nameSeparator = " - ";

            if (options.includeParentInfo !== false && item.ParentIndexNumber != null) {
                number = "S" + item.ParentIndexNumber + ":E" + number;
            } else {
                nameSeparator = ". ";
            }

            if (item.IndexNumberEnd != null) {

                number += "-" + item.IndexNumberEnd;
            }

            if (number) {
                name = name ? (number + nameSeparator + name) : number;
            }
        }

        return name;
    }

    function supportsAddingToCollection(item) {

        var invalidTypes = ['Genre', 'MusicGenre', 'Studio', 'GameGenre', 'Tag', 'UserView', 'CollectionFolder', 'Audio', 'Program', 'Timer', 'SeriesTimer', 'BoxSet', 'ApiKey'];

        var itemType = item.Type;

        if (itemType === 'Recording') {
            if (item.Status !== 'Completed') {
                return false;
            }
        }

        if (item.CollectionType) {
            return false;
        }

        if (invalidTypes.indexOf(itemType) !== -1) {
            return false;
        }

        if (isLocalItem(item)) {
            return false;
        }

        if (item.MediaType === 'Photo') {
            return false;
        }

        if (item.IsFolder || itemType === "MusicArtist") {
            return true;
        }

        if (itemType === 'Device' ||
            itemType === 'User' ||
            itemType === 'Plugin' ||
            itemType === 'Server' ||
            itemType === 'ActivityLogEntry') {
            return false;
        }

        // Not a library item
        if (!item.Id) {
            return false;
        }

        // Check ParentId to filter out owned items (for now)
        // https://emby.media/community/index.php?/topic/63827-add-movie-extras-to-playlists
        if (item.ExtraType) {
            return false;
        }

        return true;
    }

    function supportsAddingToPlaylist(item) {

        var itemType = item.Type;
        if (itemType === 'Program') {
            return false;
        }
        if (itemType === 'TvChannel') {
            return false;
        }
        if (itemType === 'Timer') {
            return false;
        }
        if (itemType === 'SeriesTimer') {
            return false;
        }
        if (itemType === 'VirtualFolder') {
            return false;
        }

        if (itemType === 'Recording') {
            if (item.Status !== 'Completed') {
                return false;
            }
        }

        var mediaType = item.MediaType;
        if (mediaType === 'Photo') {
            return false;
        }
        if (mediaType === 'Game') {
            return false;
        }

        var collectionType = item.CollectionType;
        if (collectionType === 'livetv' || collectionType === 'playlists') {
            return false;
        }

        if (isLocalItem(item)) {
            return false;
        }

        if (item.IsFolder || itemType === "Genre" || itemType === "MusicGenre" || itemType === "MusicArtist") {
            return true;
        }

        if (itemType === 'Device' ||
            itemType === 'User' ||
            itemType === 'Plugin' ||
            itemType === 'Server' ||
            itemType === 'ActivityLogEntry' ||
            itemType === 'ApiKey') {
            return false;
        }

        // Not a library item
        if (!item.Id) {
            return false;
        }

        // Check ParentId to filter out owned items (for now)
        // https://emby.media/community/index.php?/topic/63827-add-movie-extras-to-playlists
        if (item.ExtraType) {
            return false;
        }

        return item.MediaType;
    }

    function canEditInternal(user, item) {

        // AddServer
        if (!item.Id) {
            return false;
        }

        var itemType = item.Type;

        if (itemType === "UserRootFolder" || itemType === "CollectionFolder" || itemType === "UserView" || itemType === "PlaylistsFolder" || itemType === "ApiKey") {
            return false;
        }

        if (itemType === 'Program') {
            return false;
        }

        if (itemType === 'Genre' || itemType === 'MusicGenre' || itemType === 'GameGenre' || itemType === 'Studio' || itemType === 'Tag') {
            return false;
        }

        if (itemType === 'Timer') {
            return false;
        }

        if (itemType === 'SeriesTimer') {
            return false;
        }

        if (itemType === 'Plugin') {
            return false;
        }

        if (itemType === 'Server') {
            return false;
        }

        if (itemType === 'ActivityLogEntry') {
            return false;
        }

        if (itemType === 'Recording') {
            if (item.Status !== 'Completed') {
                return false;
            }
        }

        if (isLocalItem(item)) {
            return false;
        }

        return true;
    }

    function isLocalItem(item) {

        if (item) {

            var id = item.Id;

            if (typeof id === 'string' && id.indexOf('local') === 0) {
                return true;
            }
        }

        return false;
    }

    return {
        getDisplayName: getDisplayName,
        supportsAddingToCollection: supportsAddingToCollection,
        supportsAddingToPlaylist: supportsAddingToPlaylist,
        isLocalItem: isLocalItem,

        canIdentify: function (user, item) {

            var itemType = item.Type;

            if (itemType === "Movie" ||
                itemType === "Trailer" ||
                itemType === "Series" ||
                itemType === "Game" ||
                itemType === "BoxSet" ||
                itemType === "Person" ||
                itemType === "Book" ||
                itemType === "MusicAlbum" ||
                itemType === "MusicArtist" ||
                itemType === "MusicVideo") {

                if (user.Policy.IsAdministrator) {

                    if (!isLocalItem(item)) {
                        return true;
                    }
                }
            }

            return false;
        },

        canEdit: function (user, item) {

            return canEditInternal(user, item) && user.Policy.IsAdministrator;
        },

        canEditSubtitles: function (user, item) {

            var itemType = item.Type;

            if (item.MediaType === 'Video' && itemType !== 'TvChannel' && itemType !== 'Program' && item.LocationType !== 'Virtual' && !(itemType === 'Recording' && item.Status !== 'Completed')) {
                if (user.Policy.EnableSubtitleDownloading || user.Policy.EnableSubtitleManagement) {
                    return canEditInternal(user, item);
                }

                if (user.Policy.EnableSubtitleDownloading == null && user.Policy.EnableSubtitleManagement == null) {
                    return canEditInternal(user, item) && user.Policy.IsAdministrator;
                }
            }

            return false;

        },

        canEditImages: function (user, item) {

            var itemType = item.Type;

            if (item.MediaType === 'Photo') {
                return false;
            }

            if (itemType === 'CollectionFolder' || itemType === 'UserView' || itemType === 'PlaylistsFolder' ||
                itemType === 'Genre' || itemType === 'MusicGenre' || itemType === 'GameGenre' || itemType === 'Studio') {

                if (!isLocalItem(item)) {
                    if (user.Policy.IsAdministrator) {

                        return true;
                    }

                    return false;
                }
            }

            if (itemType === 'Device' ||
                itemType === 'User' ||
                itemType === 'Plugin') {
                return false;
            }

            if (itemType === 'Recording') {
                if (item.Status !== 'Completed') {
                    return false;
                }
            }

            return canEditInternal(user, item) && user.Policy.IsAdministrator;
        },

        canSync: function (user, item) {

            if (user && !user.Policy.EnableContentDownloading) {
                return false;
            }

            if (isLocalItem(item)) {
                return false;
            }

            return item.SupportsSync;
        },

        canShare: function (item, user) {

            if (!user) {
                return false;
            }

            // AddServer
            if (!item.Id) {
                return false;
            }

            var itemType = item.Type;

            if (itemType === 'TvChannel' ||
                itemType === 'Channel' ||
                itemType === 'Person' ||
                itemType === 'Year' ||
                itemType === 'Program' ||
                itemType === 'Timer' ||
                itemType === 'SeriesTimer' ||
                itemType === 'GameGenre' ||
                itemType === 'MusicGenre' ||
                itemType === 'Genre' ||
                itemType === 'Device' ||
                itemType === 'User' ||
                itemType === 'Plugin' ||
                itemType === 'Server' ||
                itemType === 'ActivityLogEntry' ||
                itemType === 'ApiKey' ||
                itemType === 'Tag') {
                return false;
            }

            if (itemType === 'Recording') {
                if (item.Status !== 'Completed') {
                    return false;
                }
            }
            if (isLocalItem(item)) {
                return false;
            }
            return user.Policy.EnablePublicSharing && appHost.supports('sharing');
        },

        enableDateAddedDisplay: function (item) {

            var itemType = item.Type;

            return !item.IsFolder && item.MediaType && itemType !== 'Program' && itemType !== 'TvChannel' && itemType !== 'Trailer';
        },

        canMarkPlayed: function (item) {

            if (item.SupportsResume) {
                return true;
            }

            var itemType = item.Type;
            var mediaType = item.MediaType;

            if (itemType === 'Program') {
                return false;
            }

            if (mediaType === 'Video') {
                if (itemType !== 'TvChannel') {
                    return true;
                }
            }

            if (itemType === "AudioBook" ||
                itemType === "Series" ||
                itemType === "Season" ||
                mediaType === "Game" ||
                mediaType === "Book" ||
                mediaType === "Recording") {
                return true;
            }

            if (itemType === 'Folder') {
                return true;
            }

            if (itemType === 'CollectionFolder') {

                if (item.CollectionType === 'boxsets' ||
                    item.CollectionType === 'playlists' ||
                    item.CollectionType === 'music') {
                    return false;
                }

                return true;
            }

            return false;
        },

        canRate: function (item) {

            var itemType = item.Type;

            if (itemType === 'Program' ||
                itemType === 'Timer' ||
                itemType === 'SeriesTimer' ||
                itemType === 'CollectionFolder' ||
                itemType === 'UserView' ||
                itemType === 'Channel' ||
                itemType === 'Season' ||
                itemType === 'Studio') {
                return false;
            }

            // Could be a stub object like PersonInfo
            if (!item.UserData) {
                return false;
            }

            return true;
        },

        canConvert: function (item, user) {

            // AddServer
            if (!item.Id) {
                return false;
            }

            var mediaType = item.MediaType;
            if (mediaType === 'Book' || mediaType === 'Photo' || mediaType === 'Game' || mediaType === 'Audio') {
                return false;
            }

            var collectionType = item.CollectionType;
            if (collectionType === 'livetv' || collectionType === 'playlists' || collectionType === 'boxsets') {
                return false;
            }

            var type = item.Type;
            if (type === 'TvChannel' ||
                type === 'Channel' ||
                type === 'Person' ||
                type === 'Year' ||
                type === 'Program' ||
                type === 'Timer' ||
                type === 'SeriesTimer' ||
                type === 'GameGenre' ||
                type === 'Device' ||
                type === 'User' ||
                type === 'Plugin' ||
                type === 'VirtualFolder' ||
                type === 'Server' ||
                type === 'ActivityLogEntry' ||
                type === 'ApiKey') {
                return false;
            }

            if (item.LocationType === 'Virtual' && !item.IsFolder) {
                return false;
            }

            if (!user.Policy.EnableMediaConversion) {
                return false;
            }

            if (isLocalItem(item)) {
                return false;
            }

            return true;
        },

        canRefreshMetadata: function (item, user) {

            // AddServer
            if (!item.Id) {
                return false;
            }

            var itemType = item.Type;
            if (itemType === 'Device' ||
                itemType === 'User' ||
                itemType === 'Plugin' ||
                itemType === 'Server' ||
                itemType === 'Tag' ||
                itemType === 'ActivityLogEntry' ||
                itemType === 'ApiKey') {
                return false;
            }

            var collectionType = item.CollectionType;
            if (collectionType === 'livetv') {
                return false;
            }

            if (user.Policy.IsAdministrator) {

                if (itemType !== 'Timer' && itemType !== 'SeriesTimer' && itemType !== 'Program' && itemType !== 'TvChannel' && !(itemType === 'Recording' && item.Status !== 'Completed')) {

                    if (!isLocalItem(item)) {
                        return true;
                    }
                }
            }

            return false;
        },

        supportsMediaSourceSelection: function (item) {

            if (item.MediaType !== 'Video') {
                return false;
            }
            if (item.Type === 'TvChannel') {
                return false;
            }
            if (!item.MediaSources || (item.MediaSources.length === 1 && item.MediaSources[0].Type === 'Placeholder')) {
                return false;
            }

            return true;
        },

        supportsSimilarItems: function (item) {

            var itemType = item.Type;

            return itemType === "Movie" ||
                itemType === "Trailer" ||
                itemType === "Series" ||
                itemType === "Program" ||
                itemType === "Recording" ||
                itemType === "Game" ||
                itemType === "MusicAlbum" ||
                itemType === "MusicArtist" ||
                itemType === "Playlist" ||
                itemType === "MusicVideo";
        },

        supportsSimilarItemsOnLiveTV: function (item, apiClient) {

            var itemType = item.Type;

            return itemType === "Movie" ||
                itemType === "Trailer" ||
                itemType === "Series";
        },

        supportsExtras: function (item) {

            if (item.IsFolder) {
                return false;
            }

            if (item.Type === 'TvChannel' || item.Type === 'Program') {
                return false;
            }

            var mediaType = item.MediaType;

            return mediaType === 'Video';
        },

        canManageMultiVersionGrouping: function (item, user) {

            if (item.IsFolder || item.MediaType !== 'Video') {
                return false;
            }

            if (isLocalItem(item)) {
                return false;
            }

            if (!user.Policy.IsAdministrator) {
                return false;
            }

            return true;
        },

        getContentTypeName: function (contentType) {

            if (!contentType) {
                return globalize.translate('MixedContent');
            }

            switch (contentType) {

                case 'movies':
                    return globalize.translate('Movies');
                case 'music':
                    return globalize.translate('Music');
                case 'tvshows':
                    return globalize.translate('TVShows');
                case 'books':
                    return globalize.translate('Books');
                case 'games':
                    return globalize.translate('Games');
                case 'musicvideos':
                    return globalize.translate('MusicVideos');
                case 'homevideos':
                    return globalize.translate('HomeVideosAndPhotos');
                case 'audiobooks':
                    return globalize.translate('AudioBooks');
                case 'boxsets':
                    return globalize.translate('Collections');
                case 'playlists':
                    return globalize.translate('Playlists');
                default:
                    return contentType;
            }
        }
    };
});