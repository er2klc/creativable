import { Button } from "@/components/ui/button";
import { SignatureData, Template } from "@/types/signature";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface SignaturePreviewProps {
  template: Template;
  data: SignatureData;
}

export const SignaturePreview = ({ template, data }: SignaturePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const getSocialIcon = (platform: string) => {
    const iconSize = "24";
    const iconColor = "#7075db"; // Consistent brand color for social icons
    
    const icons: Record<string, string> = {
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
      instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
      tiktok: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>`,
      youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`
    };
    
    return icons[platform] || '';
  };

  const getTemplateHtml = () => {
    const socialLinks = [];
    if (data.linkedin) socialLinks.push({ url: data.linkedin, platform: 'linkedin' });
    if (data.instagram) socialLinks.push({ url: data.instagram, platform: 'instagram' });
    if (data.tiktok) socialLinks.push({ url: data.tiktok, platform: 'tiktok' });
    if (data.youtube) socialLinks.push({ url: data.youtube, platform: 'youtube' });

    switch (template) {
      case "modern":
        return `
          <table style="font-family: 'Arial', sans-serif; color: #333333; background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 12px; padding: 24px; max-width: 600px;">
            <tr>
              <td style="text-align: center; padding-bottom: 20px;">
                ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" style="width: 120px; height: auto; margin-bottom: 15px;"/>` : ''}
                <h2 style="margin: 0; color: #2d3748; font-size: 24px; font-weight: 600;">${data.name}</h2>
                <p style="margin: 5px 0; color: #7075db; font-size: 16px;">${data.position}</p>
                <p style="margin: 5px 0; color: #4a5568; font-weight: 500;">${data.company}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 20px; border-top: 2px solid #e2e8f0;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="mailto:${data.email}" style="color: #2d3748; text-decoration: none; display: flex; align-items: center;">
                        <span style="color: #7075db; margin-right: 10px;">✉</span> ${data.email}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="tel:${data.phone}" style="color: #2d3748; text-decoration: none; display: flex; align-items: center;">
                        <span style="color: #7075db; margin-right: 10px;">📞</span> ${data.phone}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="https://${data.website}" style="color: #2d3748; text-decoration: none; display: flex; align-items: center;">
                        <span style="color: #7075db; margin-right: 10px;">🌐</span> ${data.website}
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="margin-top: 15px;">
                  ${socialLinks.map(({ url, platform }) => `
                    <a href="${url}" style="text-decoration: none; margin: 0 8px;" target="_blank">
                      ${getSocialIcon(platform)}
                    </a>
                  `).join('')}
                </div>
              </td>
            </tr>
          </table>
        `;
      case "classic":
        return `
          <table style="font-family: 'Arial', sans-serif; color: #2d3748; background: linear-gradient(to right, #ffffff, #f7fafc); padding: 24px; border-radius: 8px; max-width: 600px;">
            <tr>
              <td style="padding-right: 24px; border-right: 3px solid #7075db;">
                ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" style="width: 100px; height: auto; margin-bottom: 15px;"/>` : ''}
                <h2 style="margin: 0; font-size: 22px; color: #2d3748;">${data.name}</h2>
                <p style="margin: 5px 0; color: #7075db;">${data.position}</p>
                <p style="margin: 5px 0; font-weight: 500;">${data.company}</p>
              </td>
              <td style="padding-left: 24px;">
                <div style="margin-bottom: 15px;">
                  <p style="margin: 5px 0;"><a href="mailto:${data.email}" style="color: #2d3748; text-decoration: none;">${data.email}</a></p>
                  <p style="margin: 5px 0;"><a href="tel:${data.phone}" style="color: #2d3748; text-decoration: none;">${data.phone}</a></p>
                  <p style="margin: 5px 0;"><a href="https://${data.website}" style="color: #2d3748; text-decoration: none;">${data.website}</a></p>
                </div>
                <div style="margin-top: 15px;">
                  ${socialLinks.map(({ url, platform }) => `
                    <a href="${url}" style="text-decoration: none; margin-right: 10px;" target="_blank">
                      ${getSocialIcon(platform)}
                    </a>
                  `).join('')}
                </div>
              </td>
            </tr>
          </table>
        `;
      case "minimal":
        return `
          <table style="font-family: 'Arial', sans-serif; color: #2d3748; background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); padding: 24px; border-left: 4px solid #7075db; max-width: 600px;">
            <tr>
              <td>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding-bottom: 20px;">
                      ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" style="width: 80px; height: auto;"/>` : ''}
                    </td>
                    <td style="text-align: right;">
                      <div style="margin-bottom: 15px;">
                        ${socialLinks.map(({ url, platform }) => `
                          <a href="${url}" style="text-decoration: none; margin-left: 8px;" target="_blank">
                            ${getSocialIcon(platform)}
                          </a>
                        `).join('')}
                      </div>
                    </td>
                  </tr>
                </table>
                <h2 style="margin: 0; font-size: 20px; color: #2d3748;">${data.name}</h2>
                <p style="margin: 5px 0; color: #7075db;">${data.position} · ${data.company}</p>
                <div style="margin-top: 15px;">
                  <p style="margin: 3px 0;">
                    <a href="mailto:${data.email}" style="color: #2d3748; text-decoration: none;">${data.email}</a>
                  </p>
                  <p style="margin: 3px 0;">
                    <a href="tel:${data.phone}" style="color: #2d3748; text-decoration: none;">${data.phone}</a>
                  </p>
                  <p style="margin: 3px 0;">
                    <a href="https://${data.website}" style="color: #2d3748; text-decoration: none;">${data.website}</a>
                  </p>
                </div>
              </td>
            </tr>
          </table>
        `;
      default:
        return "";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getTemplateHtml());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy signature:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vorschau</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Kopiert
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              HTML kopieren
            </>
          )}
        </Button>
      </div>
      
      <div className="border rounded-lg p-6 bg-white">
        <div dangerouslySetInnerHTML={{ __html: getTemplateHtml() }} />
      </div>
    </div>
  );
};