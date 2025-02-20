
import { useNavigate } from "react-router-dom";
import { SnapNavigationOptions } from "../types/snaps";

export const useSnapNavigation = ({
  teamSlug,
  onCalendarClick,
  onSnapClick,
}: SnapNavigationOptions) => {
  const navigate = useNavigate();

  const handleSnapClick = (snapId: string) => {
    if (!teamSlug) {
      return;
    }

    switch (snapId) {
      case "posts":
        navigate(`/unity/team/${teamSlug}/posts`);
        break;
      case "calendar":
        onCalendarClick();
        break;
      case "leaderboard":
        navigate(`/unity/team/${teamSlug}/leaderboard`);
        break;
      case "members":
        navigate(`/unity/team/${teamSlug}/members`);
        break;
      default:
        navigate(`/unity/team/${teamSlug}/${snapId}`);
    }
    onSnapClick(snapId);
  };

  return { handleSnapClick };
};
