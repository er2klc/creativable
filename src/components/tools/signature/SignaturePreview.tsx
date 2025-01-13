import { Button } from "@/components/ui/button";
import { SignatureData, Template } from "@/types/signature";
import { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SignaturePreviewProps {
  template: Template;
  data: SignatureData;
}

export const SignaturePreview = ({ template, data }: SignaturePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [copiedPlain, setCopiedPlain] = useState(false);

  const getSocialIcon = (platform: string) => {
    const iconSize = "24";
    const iconColor = data.linkColor || "#7075db";
    
    const icons: Record<string, string> = {
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
      instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
      twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>`,
      youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path></svg>`,
      whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
      xing: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022L22.139.756c.095-.191.097-.387.006-.535C22.056.078 21.894 0 21.686 0h-3.498zM3.648 4.74c-.211 0-.385.074-.473.216-.09.149-.078.339.02.531l2.34 4.05c.004.01.004.016 0 .021L1.86 16.051c-.099.188-.093.381 0 .529.085.142.239.234.45.234h3.461c.518 0 .766-.348.945-.667l3.734-6.609-2.378-4.155c-.172-.315-.434-.659-.962-.659H3.648v.016z"/></svg>`
    };
    
    return icons[platform] || '';
  };

  const formatSocialUrl = (url: string, platform: string): string => {
    if (!url) return '';
    
    // If URL already starts with http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Handle WhatsApp numbers
    if (platform === 'whatsapp') {
      const cleanNumber = url.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanNumber}`;
    }

    // Add https:// for website URLs
    if (platform === 'website') {
      return `https://${url}`;
    }

    // Platform-specific URL formatting
    const platformUrls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/in/${url.replace(/^@/, '')}`,
      instagram: `https://www.instagram.com/${url.replace(/^@/, '')}`,
      twitter: `https://twitter.com/${url.replace(/^@/, '')}`,
      youtube: `https://www.youtube.com/${url.replace(/^@/, '')}`,
      xing: `https://www.xing.com/profile/${url.replace(/^@/, '')}`
    };

    return platformUrls[platform] || url;
  };

  const getPlainTextSignature = () => {
    const lines = [];
    lines.push(data.name);
    if (data.position) lines.push(data.position);
    if (data.company) lines.push(data.company);
    if (data.email) lines.push(data.email);
    if (data.phone) lines.push(data.phone);
    if (data.website) lines.push(data.website);
    
    const socialLinks = [];
    if (data.linkedin) socialLinks.push(`LinkedIn: ${formatSocialUrl(data.linkedin, 'linkedin')}`);
    if (data.xing) socialLinks.push(`Xing: ${formatSocialUrl(data.xing, 'xing')}`);
    if (data.instagram) socialLinks.push(`Instagram: ${formatSocialUrl(data.instagram, 'instagram')}`);
    if (data.twitter) socialLinks.push(`Twitter: ${formatSocialUrl(data.twitter, 'twitter')}`);
    if (data.youtube) socialLinks.push(`YouTube: ${formatSocialUrl(data.youtube, 'youtube')}`);
    if (data.whatsapp) socialLinks.push(`WhatsApp: ${formatSocialUrl(data.whatsapp, 'whatsapp')}`);

    if (socialLinks.length > 0) {
      lines.push('');
      lines.push(...socialLinks);
    }

    return lines.join('\n');
  };

  const getTemplateHtml = () => {
    const socialLinks = [];
    if (data.linkedin) socialLinks.push({ url: data.linkedin, platform: 'linkedin' });
    if (data.xing) socialLinks.push({ url: data.xing, platform: 'xing' });
    if (data.instagram) socialLinks.push({ url: data.instagram, platform: 'instagram' });
    if (data.twitter) socialLinks.push({ url: data.twitter, platform: 'twitter' });
    if (data.youtube) socialLinks.push({ url: data.youtube, platform: 'youtube' });
    if (data.whatsapp) socialLinks.push({ url: data.whatsapp, platform: 'whatsapp' });

    const contactStyle = `color: ${data.textColor || '#2d3748'}; text-decoration: none; display: flex; align-items: center; gap: 8px; margin: 5px 0;`;
    const logoStyle = 'width: 100px; height: 100px; object-fit: contain;';
    const borderColor = data.themeColor || data.linkColor || '#7075db';

    switch (template) {
      case "modern":
        return `
          <table style="font-family: ${data.font || 'Arial'}, sans-serif; color: ${data.textColor || '#333333'}; width: 100%; max-width: 600px;">
            <tr>
              <td style="display: flex; align-items: start; gap: 20px;">
                ${data.logoUrl ? `<div style="flex-shrink: 0; width: 100px; height: 100px;"><img src="${data.logoUrl}" style="${logoStyle}"/></div>` : ''}
                <div style="flex-grow: 1; border-left: 2px solid ${borderColor}; padding-left: 20px;">
                  <h2 style="margin: 0; color: ${data.textColor || '#2d3748'}; font-size: 24px; font-weight: 600;">${data.name}</h2>
                  <p style="margin: 5px 0; color: ${data.themeColor || '#7075db'}; font-size: 16px;">${data.position}</p>
                  <p style="margin: 5px 0; color: ${data.textColor || '#4a5568'}; font-weight: 500;">${data.company}</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div>
                      <a href="mailto:${data.email}" style="${contactStyle}">${data.email}</a>
                      <a href="tel:${data.phone}" style="${contactStyle}">${data.phone}</a>
                    </div>
                    <div>
                      <a href="${formatSocialUrl(data.website, 'website')}" style="${contactStyle}" target="_blank">${data.website}</a>
                    </div>
                  </div>
                  <div style="margin-top: 15px; display: flex; gap: 12px;">
                    ${socialLinks.map(({ url, platform }) => `
                      <a href="${formatSocialUrl(url, platform)}" style="text-decoration: none;" target="_blank">
                        ${getSocialIcon(platform)}
                      </a>
                    `).join('')}
                  </div>
                </div>
              </td>
            </tr>
          </table>
        `;

      case "classic":
        return `
          <table style="font-family: ${data.font || 'Arial'}, sans-serif; color: ${data.textColor || '#2d3748'}; width: 100%; max-width: 600px;">
            <tr>
              <td style="display: flex; align-items: start; gap: 20px;">
                ${data.logoUrl ? `<div style="flex-shrink: 0; width: 100px; height: 100px;"><img src="${data.logoUrl}" style="${logoStyle}"/></div>` : ''}
                <div style="flex-grow: 1; padding-left: 20px; border-left: 1px solid ${data.linkColor || '#7075db'};">
                  <h2 style="margin: 0; font-size: 22px; color: ${data.textColor || '#2d3748'};">${data.name}</h2>
                  <p style="margin: 5px 0; color: ${data.linkColor || '#7075db'};">${data.position}</p>
                  <p style="margin: 5px 0; font-weight: 500;">${data.company}</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div>
                      <a href="mailto:${data.email}" style="${contactStyle}">${data.email}</a>
                      <a href="tel:${data.phone}" style="${contactStyle}">${data.phone}</a>
                    </div>
                    <div>
                      <a href="${formatSocialUrl(data.website, 'website')}" style="${contactStyle}" target="_blank">${data.website}</a>
                    </div>
                  </div>
                  <div style="margin-top: 15px; display: flex; gap: 12px;">
                    ${socialLinks.map(({ url, platform }) => `
                      <a href="${formatSocialUrl(url, platform)}" style="text-decoration: none;" target="_blank">
                        ${getSocialIcon(platform)}
                      </a>
                    `).join('')}
                  </div>
                </div>
              </td>
            </tr>
          </table>
        `;
      case "minimal":
        return `
          <table style="font-family: ${data.font || 'Arial'}, sans-serif; color: ${data.textColor || '#2d3748'}; width: 100%; max-width: 600px;">
            <tr>
              <td style="display: flex; align-items: start; gap: 20px;">
                ${data.logoUrl ? `<div style="flex-shrink: 0; width: 100px; height: 100px;"><img src="${data.logoUrl}" style="${logoStyle}"/></div>` : ''}
                <div style="flex-grow: 1;">
                  <h2 style="margin: 0; font-size: 20px; color: ${data.textColor || '#2d3748'};">${data.name}</h2>
                  <p style="margin: 5px 0; color: ${data.linkColor || '#7075db'};">${data.position} · ${data.company}</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div>
                      <a href="mailto:${data.email}" style="${contactStyle}">${data.email}</a>
                      <a href="tel:${data.phone}" style="${contactStyle}">${data.phone}</a>
                    </div>
                    <div>
                      <a href="${formatSocialUrl(data.website, 'website')}" style="${contactStyle}" target="_blank">${data.website}</a>
                    </div>
                  </div>
                  <div style="margin-top: 15px; display: flex; gap: 12px;">
                    ${socialLinks.map(({ url, platform }) => `
                      <a href="${formatSocialUrl(url, platform)}" style="text-decoration: none;" target="_blank">
                        ${getSocialIcon(platform)}
                      </a>
                    `).join('')}
                  </div>
                </div>
              </td>
            </tr>
          </table>
        `;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getTemplateHtml());
      setCopied(true);
      toast({
        title: "HTML Signatur kopiert",
        description: "Die HTML-Signatur wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy signature:", err);
      toast({
        title: "Fehler beim Kopieren",
        description: "Die Signatur konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(getPlainTextSignature());
      setCopiedPlain(true);
      toast({
        title: "Text-Signatur kopiert",
        description: "Die Text-Signatur wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopiedPlain(false), 2000);
    } catch (err) {
      console.error("Failed to copy plain text signature:", err);
      toast({
        title: "Fehler beim Kopieren",
        description: "Die Signatur konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vorschau</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPlainText}
            className="flex items-center gap-2"
          >
            {copiedPlain ? (
              <>
                <Check className="w-4 h-4" />
                Text kopiert
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Text kopieren
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                HTML kopiert
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                HTML kopieren
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 w-full overflow-x-auto">
        <div dangerouslySetInnerHTML={{ __html: getTemplateHtml() }} />
      </div>
    </div>
  );
};
