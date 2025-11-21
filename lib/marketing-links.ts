/**
 * Marketing Links Utility
 * 
 * Helper functions to generate tracked invite links for different marketing channels
 */

/**
 * Generate a tracked invite link with UTM parameters
 * 
 * @param baseInviteLink - The base invite link (e.g., "https://invite.puravida.events/?invite=...")
 * @param source - Marketing source (e.g., "instagram", "facebook", "google")
 * @param medium - Marketing medium (e.g., "story", "cpc", "post")
 * @param campaign - Campaign name (e.g., "launch_2024")
 * @param content - Optional content identifier (e.g., "story_1", "ad_variant_a")
 * @param term - Optional search term (mainly for search ads)
 * @returns Complete tracked URL with UTM parameters
 */
export function generateTrackedLink(
  baseInviteLink: string,
  source: string,
  medium: string,
  campaign: string,
  content?: string,
  term?: string
): string {
  const url = new URL(baseInviteLink);
  
  // Add UTM parameters
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  
  if (content) {
    url.searchParams.set('utm_content', content);
  }
  
  if (term) {
    url.searchParams.set('utm_term', term);
  }
  
  return url.toString();
}

/**
 * Pre-configured link generators for common marketing channels
 */

export const MarketingLinks = {
  /**
   * Instagram Story link
   */
  instagramStory: (
    baseInviteLink: string,
    campaign: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'instagram', 'story', campaign, content),
  
  /**
   * Instagram Post link
   */
  instagramPost: (
    baseInviteLink: string,
    campaign: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'instagram', 'post', campaign, content),
  
  /**
   * Instagram Reel link
   */
  instagramReel: (
    baseInviteLink: string,
    campaign: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'instagram', 'reel', campaign, content),
  
  /**
   * Facebook Ads link
   */
  facebookAd: (
    baseInviteLink: string,
    campaign: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'facebook', 'cpc', campaign, content),
  
  /**
   * Google Ads link
   */
  googleAd: (
    baseInviteLink: string,
    campaign: string,
    term?: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'google', 'cpc', campaign, content, term),
  
  /**
   * TikTok Ads link
   */
  tiktokAd: (
    baseInviteLink: string,
    campaign: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'tiktok', 'cpc', campaign, content),
  
  /**
   * LinkedIn Ads link
   */
  linkedinAd: (
    baseInviteLink: string,
    campaign: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'linkedin', 'cpc', campaign, content),
  
  /**
   * Email campaign link
   */
  email: (
    baseInviteLink: string,
    campaign: string,
    content?: string
  ) => generateTrackedLink(baseInviteLink, 'email', 'email', campaign, content),
  
  /**
   * WhatsApp/SMS link
   */
  whatsapp: (
    baseInviteLink: string,
    campaign: string
  ) => generateTrackedLink(baseInviteLink, 'whatsapp', 'message', campaign),
  
  /**
   * Partner/Influencer link
   */
  partner: (
    baseInviteLink: string,
    campaign: string,
    ref?: string
  ) => {
    const url = generateTrackedLink(baseInviteLink, 'partner', 'referral', campaign);
    if (ref) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('ref', ref);
      return urlObj.toString();
    }
    return url;
  },
};

/**
 * Example usage:
 * 
 * const baseLink = "https://invite.puravida.events/?invite=Sm9obiBEb2U=|OTcxNTU1NTEyMzQ1Ng==";
 * 
 * // Instagram Story
 * const storyLink = MarketingLinks.instagramStory(baseLink, "launch_2024", "story_1");
 * // Result: https://invite.puravida.events/?invite=...&utm_source=instagram&utm_medium=story&utm_campaign=launch_2024&utm_content=story_1
 * 
 * // Facebook Ad
 * const fbLink = MarketingLinks.facebookAd(baseLink, "summer_2024", "ad_variant_a");
 * 
 * // Google Ad
 * const googleLink = MarketingLinks.googleAd(baseLink, "summer_2024", "dubai_nightlife");
 */

