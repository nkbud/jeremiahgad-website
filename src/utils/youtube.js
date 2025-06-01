/**
 * YouTube utility functions for handling video embeds
 */

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Convert any YouTube URL to proper embed URL
 * @param {string} url - YouTube URL
 * @returns {string} - Embed URL
 */
export function getYouTubeEmbedUrl(url) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return url; // Return original if not a YouTube URL
  
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Check if a URL is a YouTube URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if YouTube URL
 */
export function isYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

/**
 * Generate proper YouTube iframe attributes
 * @param {Object} props - iframe props
 * @returns {Object} - Enhanced props for YouTube
 */
export function getYouTubeIframeProps(props = {}) {
  const { src, ...otherProps } = props;
  
  if (!src || !isYouTubeUrl(src)) {
    return props;
  }
  
  const embedUrl = getYouTubeEmbedUrl(src);
  
  return {
    src: embedUrl,
    width: props.width || '560',
    height: props.height || '315',
    frameBorder: '0',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerPolicy: 'strict-origin-when-cross-origin',
    allowFullScreen: true,
    loading: 'lazy',
    title: props.title || 'YouTube video player',
    ...otherProps
  };
}