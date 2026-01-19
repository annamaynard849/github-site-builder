import { Home, MessageCircle, Heart, Scale, DollarSign, CreditCard, HandHeart, Lock } from "lucide-react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Chat", url: "/chat", icon: MessageCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const params = useParams();
  
  // Extract lovedOneId from various route patterns
  const getLovedOneId = (): string | null => {
    // Check if we're on a case view route - extract from URL
    const caseMatch = location.pathname.match(/\/cases\/([^/]+)/);
    if (caseMatch) {
      // For case routes, we'd need to look up the loved_one_id from the case
      // For now, return null and we'll handle this differently
      return null;
    }
    
    // Check hub routes that already have lovedOneId
    const hubMatch = location.pathname.match(/\/hub\/[^/]+\/([^/]+)/);
    if (hubMatch) return hubMatch[1];
    
    // Check vault route
    const vaultMatch = location.pathname.match(/\/vault\/([^/]+)/);
    if (vaultMatch) return vaultMatch[1];
    
    // Check URL params
    if (params.lovedOneId) return params.lovedOneId;
    if (params.caseId) return null; // Case ID needs lookup
    
    return null;
  };
  
  const lovedOneId = getLovedOneId();
  
  // Dynamic hub items - only show if we have a lovedOneId context
  const hubItems = lovedOneId ? [
    { title: "Memorial", url: `/hub/memorial/${lovedOneId}`, icon: Heart },
    { title: "Support", url: `/hub/support/${lovedOneId}`, icon: HandHeart },
    { title: "Legal", url: `/hub/legal/${lovedOneId}`, icon: Scale },
    { title: "Financial", url: `/hub/financial/${lovedOneId}`, icon: DollarSign },
    { title: "Accounts", url: `/hub/accounts/${lovedOneId}`, icon: CreditCard },
    { title: "Vault", url: `/vault/${lovedOneId}`, icon: Lock },
  ] : [];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="p-4 border-b">
          <h2 className={`font-playfair tracking-widest ${collapsed ? "text-xs" : "text-xl"}`}>
            {collapsed ? "H" : "HONORLY"}
          </h2>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Hubs - only show when in a case/loved one context */}
        {hubItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Hubs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hubItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavCls}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
