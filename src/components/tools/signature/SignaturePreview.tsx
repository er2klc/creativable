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
      twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>`,
      youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>`,
      whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`
    };
    
    return icons[platform] || '';
  };

  const getTemplateHtml = () => {
    const socialLinks = [];
    if (data.linkedin) socialLinks.push({ url: data.linkedin, platform: 'linkedin' });
    if (data.instagram) socialLinks.push({ url: data.instagram, platform: 'instagram' });
    if (data.twitter) socialLinks.push({ url: data.twitter, platform: 'twitter' });
    if (data.youtube) socialLinks.push({ url: data.youtube, platform: 'youtube' });
    if (data.whatsapp) socialLinks.push({ url: `https://wa.me/${data.whatsapp}`, platform: 'whatsapp' });

    switch (template) {
      case "modern":
        return `
          <table style="font-family: Arial, sans-serif; color: #333333; background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 12px; padding: 24px; width: 100%; max-width: 600px;">
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
                      <a href="mailto:${data.email}" style="color: #2d3748; text-decoration: none; display: block;">
                        <span style="color: #7075db; margin-right: 10px;">✉</span> ${data.email}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="tel:${data.phone}" style="color: #2d3748; text-decoration: none; display: block;">
                        <span style="color: #7075db; margin-right: 10px;">📞</span> ${data.phone}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="https://${data.website}" style="color: #2d3748; text-decoration: none; display: block;">
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
          <table style="font-family: Arial, sans-serif; color: #2d3748; background: linear-gradient(to right, #ffffff, #f7fafc); padding: 24px; border-radius: 8px; width: 100%; max-width: 600px;">
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
          <table style="font-family: Arial, sans-serif; color: #2d3748; background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); padding: 24px; border-left: 4px solid #7075db; width: 100%; max-width: 600px;">
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
      
      <div className="border rounded-lg p-6 bg-white w-full overflow-x-auto">
        <div dangerouslySetInnerHTML={{ __html: getTemplateHtml() }} />
      </div>
    </div>
  );
};