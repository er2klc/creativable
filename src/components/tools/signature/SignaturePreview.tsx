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

  const getTemplateHtml = () => {
    switch (template) {
      case "modern":
        return `
          <table style="font-family: Arial, sans-serif; color: #333333;">
            <tr>
              <td style="padding-right: 20px; border-right: 3px solid #2563eb;">
                <h2 style="margin: 0; color: #1e40af; font-size: 18px;">${data.name}</h2>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${data.position}</p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${data.company}</p>
              </td>
              <td style="padding-left: 20px;">
                <p style="margin: 3px 0;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a></p>
                <p style="margin: 3px 0;"><a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none;">${data.phone}</a></p>
                <p style="margin: 3px 0;"><a href="https://${data.website}" style="color: #2563eb; text-decoration: none;">${data.website}</a></p>
                ${data.linkedIn ? `<p style="margin: 3px 0;"><a href="${data.linkedIn}" style="color: #2563eb; text-decoration: none;">LinkedIn</a></p>` : ''}
              </td>
            </tr>
          </table>
        `;
      case "classic":
        return `
          <table style="font-family: Times New Roman, serif; color: #333333;">
            <tr>
              <td>
                <h2 style="margin: 0; font-size: 18px;">${data.name}</h2>
                <p style="margin: 5px 0; font-style: italic;">${data.position}</p>
                <p style="margin: 5px 0; font-weight: bold;">${data.company}</p>
                <div style="margin-top: 10px; border-top: 1px solid #cccccc; padding-top: 10px;">
                  <p style="margin: 3px 0;">Email: <a href="mailto:${data.email}" style="color: #000000;">${data.email}</a></p>
                  <p style="margin: 3px 0;">Tel: <a href="tel:${data.phone}" style="color: #000000;">${data.phone}</a></p>
                  <p style="margin: 3px 0;">Web: <a href="https://${data.website}" style="color: #000000;">${data.website}</a></p>
                  ${data.linkedIn ? `<p style="margin: 3px 0;">LinkedIn: <a href="${data.linkedIn}" style="color: #000000;">Profil</a></p>` : ''}
                </div>
              </td>
            </tr>
          </table>
        `;
      case "minimal":
        return `
          <table style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000;">
            <tr>
              <td>
                <p style="margin: 0; font-size: 16px; font-weight: 500;">${data.name}</p>
                <p style="margin: 2px 0; color: #666666; font-size: 14px;">${data.position} · ${data.company}</p>
                <p style="margin: 8px 0; font-size: 14px;">
                  <a href="mailto:${data.email}" style="color: #000000; text-decoration: none;">${data.email}</a>
                  ${data.phone ? ` · <a href="tel:${data.phone}" style="color: #000000; text-decoration: none;">${data.phone}</a>` : ''}
                </p>
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