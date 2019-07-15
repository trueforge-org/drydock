// @ts-nocheck
/**
 * Supported Docker labels (ud.* preferred, wud.* legacy fallback).
 */

/**
 * Should the container be tracked? (true | false).
 */
export const udWatch = 'ud.watch';
export const wudWatch = 'wud.watch';

/**
 * Optional regex indicating what tags to consider.
 */
export const udTagInclude = 'ud.tag.include';
export const wudTagInclude = 'wud.tag.include';

/**
 * Optional regex indicating what tags to not consider.
 */
export const udTagExclude = 'ud.tag.exclude';
export const wudTagExclude = 'wud.tag.exclude';

/**
 * Optional transform function to apply to the tag.
 */
export const udTagTransform = 'ud.tag.transform';
export const wudTagTransform = 'wud.tag.transform';

/**
 * Optional path in Docker inspect JSON to derive the running tag value.
 */
export const udInspectTagPath = 'ud.inspect.tag.path';
export const wudInspectTagPath = 'wud.inspect.tag.path';

/**
 * Optional image reference to use for update lookups.
 */
export const udRegistryLookupImage = 'ud.registry.lookup.image';
export const wudRegistryLookupImage = 'wud.registry.lookup.image';

/**
 * Legacy alias kept for compatibility with old experimental builds.
 */
export const udRegistryLookupUrl = 'ud.registry.lookup.url';
export const wudRegistryLookupUrl = 'wud.registry.lookup.url';

/**
 * Should container digest be tracked? (true | false).
 */
export const udWatchDigest = 'ud.watch.digest';
export const wudWatchDigest = 'wud.watch.digest';

/**
 * Optional templated string pointing to a browsable link.
 */
export const udLinkTemplate = 'ud.link.template';
export const wudLinkTemplate = 'wud.link.template';

/**
 * Optional friendly name to display.
 */
export const udDisplayName = 'ud.display.name';
export const wudDisplayName = 'wud.display.name';

/**
 * Optional friendly icon to display.
 */
export const udDisplayIcon = 'ud.display.icon';
export const wudDisplayIcon = 'wud.display.icon';

/**
 * Optional list of triggers to include
 */
export const udTriggerInclude = 'ud.trigger.include';
export const wudTriggerInclude = 'wud.trigger.include';

/**
 * Optional list of triggers to exclude
 */
export const udTriggerExclude = 'ud.trigger.exclude';
export const wudTriggerExclude = 'wud.trigger.exclude';
