
import { useState } from "react";
import { Gauge, Target, Crosshair, ChevronDown, ChevronUp, Award, List, BriefcaseIcon, TargetIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from 'react-markdown';

interface BusinessMatchCardProps {
  matchScore: number;
  skills: string[];
  commonalities: string[];
  potentialNeeds: string[];
  strengths: string[];
  content: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const BusinessMatchCard = ({
  matchScore,
  skills,
  commonalities,
  potentialNeeds,
  strengths,
  content,
  onRegenerate,
  isRegenerating = false
}: BusinessMatchCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // Function to determine the color based on the match score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  // Function to determine the progress bar color based on the match score
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };
  
  // Function to get the text description of the match score
  const getScoreDescription = (score: number) => {
    if (score >= 80) return "Ausgezeichnet";
    if (score >= 60) return "Gut";
    if (score >= 40) return "Mittel";
    if (score >= 20) return "Niedrig";
    return "Sehr niedrig";
  };

  // Custom renderer for markdown to properly handle emoji headers
  const renderers = {
    p: ({ children }: { children: React.ReactNode }) => {
      const text = String(children);
      // Check if paragraph starts with emoji (Unicode character range for most emojis)
      const emojiRegex = /^(\p{Emoji}|[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}])\s+(.+)/u;
      const match = text.match(emojiRegex);
      
      if (match) {
        // This is an emoji header
        return (
          <h3 className="text-md font-semibold mt-3 mb-2 text-gray-800 flex items-center">
            <span className="mr-2">{match[1]}</span>
            <span>{match[2]}</span>
          </h3>
        );
      }
      
      // Regular paragraph
      return <p className="my-2">{children}</p>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold">Business Match Analyse</h3>
          </div>
          {onRegenerate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? 'Wird neu generiert...' : 'Neu generieren'}
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Gauge className={cn("w-5 h-5 mr-2", getScoreColor(matchScore))} />
              <span className="font-medium">Business Match Score</span>
            </div>
            <div className={cn("font-bold text-xl", getScoreColor(matchScore))}>
              {matchScore}%
            </div>
          </div>
          
          <Progress value={matchScore} className="h-2" indicatorClassName={getProgressColor(matchScore)} />
          
          <div className="text-right mt-1 text-sm text-gray-600">
            {getScoreDescription(matchScore)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center mb-2">
              <BriefcaseIcon className="w-4 h-4 mr-2 text-blue-600" />
              <span className="font-medium text-sm">Skills</span>
            </div>
            <ul className="text-xs space-y-1">
              {skills.map((skill, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xs mr-1">•</span> {skill}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center mb-2">
              <Crosshair className="w-4 h-4 mr-2 text-purple-600" />
              <span className="font-medium text-sm">Gemeinsamkeiten</span>
            </div>
            <ul className="text-xs space-y-1">
              {commonalities.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xs mr-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center mb-2">
              <TargetIcon className="w-4 h-4 mr-2 text-amber-600" />
              <span className="font-medium text-sm">Potentielle Bedarfe</span>
            </div>
            <ul className="text-xs space-y-1">
              {potentialNeeds.map((need, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xs mr-1">•</span> {need}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex items-center mb-2">
              <SparklesIcon className="w-4 h-4 mr-2 text-emerald-600" />
              <span className="font-medium text-sm">Stärken</span>
            </div>
            <ul className="text-xs space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xs mr-1">•</span> {strength}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex items-center justify-center mt-2 text-gray-500"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              <span>Details ausblenden</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              <span>Details anzeigen</span>
            </>
          )}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="prose prose-sm max-w-none mt-2">
            <ReactMarkdown components={renderers}>{content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
