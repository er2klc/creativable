import { SidebarHeader as Header } from "@/components/ui/sidebar";

interface SidebarHeaderProps {
  isExpanded: boolean;
}

export const SidebarHeader = ({ isExpanded }: SidebarHeaderProps) => {
  return (
    <Header className="px-4 py-6">
      <div className={`flex justify-center transition-all duration-300 ${isExpanded ? 'mx-auto' : ''}`}>
        <img
          src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png"
          alt="Logo"
          className={`transition-all duration-300 ${isExpanded ? 'w-[120px]' : 'w-[30px]'}`}
        />
      </div>
    </Header>
  );
};