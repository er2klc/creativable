import * as React from "react";
import { getMeetingTypeIcon } from "../cards/utils/meetingTypeUtils";

interface MeetingTypeIconProps {
  type: string;
}

export const MeetingTypeIcon = ({ type }: MeetingTypeIconProps) => {
  return getMeetingTypeIcon(type);
};