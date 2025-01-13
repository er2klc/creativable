import { SignatureData, Template } from "@/types/signature";

interface TemplateProps {
  data: SignatureData;
  getSocialIcon: (platform: string) => string;
  formatSocialUrl: (url: string, platform: string) => string;
}

export const ModernTemplate = ({ data, getSocialIcon, formatSocialUrl }: TemplateProps) => {
  const socialLinks = [];
  if (data.linkedin) socialLinks.push({ url: data.linkedin, platform: 'linkedin' });
  if (data.xing) socialLinks.push({ url: data.xing, platform: 'xing' });
  if (data.instagram) socialLinks.push({ url: data.instagram, platform: 'instagram' });
  if (data.twitter) socialLinks.push({ url: data.twitter, platform: 'twitter' });
  if (data.youtube) socialLinks.push({ url: data.youtube, platform: 'youtube' });
  if (data.whatsapp) socialLinks.push({ url: data.whatsapp, platform: 'whatsapp' });

  const contactStyle = `color: ${data.textColor || '#2d3748'}; text-decoration: none; display: flex; align-items: center; gap: 8px; margin: 5px 0;`;
  const logoStyle = 'width: 100px; height: 100px; object-fit: contain;';

  return `
    <table style="font-family: ${data.font || 'Arial'}, sans-serif; color: ${data.textColor || '#333333'}; width: 100%; max-width: 600px;">
      <tr>
        <td style="display: flex; align-items: start; gap: 20px;">
          ${data.logoUrl ? `<div style="flex-shrink: 0; width: 100px; height: 100px;"><img src="${data.logoUrl}" style="${logoStyle}"/></div>` : ''}
          <div style="flex-grow: 1; border-left: 1px solid ${data.textColor || '#2d3748'}; padding-left: 20px;">
            <h2 style="margin: 0; color: ${data.textColor || '#2d3748'}; font-size: 24px; font-weight: 600;">${data.name}</h2>
            <p style="margin: 5px 0; color: ${data.linkColor || '#7075db'}; font-size: 16px;">${data.position}</p>
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
};

export const ClassicTemplate = ({ data, getSocialIcon, formatSocialUrl }: TemplateProps) => {
  const socialLinks = [];
  if (data.linkedin) socialLinks.push({ url: data.linkedin, platform: 'linkedin' });
  if (data.xing) socialLinks.push({ url: data.xing, platform: 'xing' });
  if (data.instagram) socialLinks.push({ url: data.instagram, platform: 'instagram' });
  if (data.twitter) socialLinks.push({ url: data.twitter, platform: 'twitter' });
  if (data.youtube) socialLinks.push({ url: data.youtube, platform: 'youtube' });
  if (data.whatsapp) socialLinks.push({ url: data.whatsapp, platform: 'whatsapp' });

  const contactStyle = `color: ${data.textColor || '#2d3748'}; text-decoration: none; display: flex; align-items: center; gap: 8px; margin: 5px 0;`;
  const logoStyle = 'width: 100px; height: 100px; object-fit: contain;';

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
};

export const MinimalTemplate = ({ data, getSocialIcon, formatSocialUrl }: TemplateProps) => {
  const socialLinks = [];
  if (data.linkedin) socialLinks.push({ url: data.linkedin, platform: 'linkedin' });
  if (data.xing) socialLinks.push({ url: data.xing, platform: 'xing' });
  if (data.instagram) socialLinks.push({ url: data.instagram, platform: 'instagram' });
  if (data.twitter) socialLinks.push({ url: data.twitter, platform: 'twitter' });
  if (data.youtube) socialLinks.push({ url: data.youtube, platform: 'youtube' });
  if (data.whatsapp) socialLinks.push({ url: data.whatsapp, platform: 'whatsapp' });

  const contactStyle = `color: ${data.textColor || '#2d3748'}; text-decoration: none; display: flex; align-items: center; gap: 8px; margin: 5px 0;`;
  const logoStyle = 'width: 100px; height: 100px; object-fit: contain;';

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
};