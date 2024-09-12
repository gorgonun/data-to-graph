import Tooltip from "@mui/material/Tooltip";
import { TooltipProps } from "@mui/material/Tooltip";

interface TooltipOnProps extends TooltipProps {
  on?: boolean;
}

export function TooltipOn({ on, children, ...props }: TooltipOnProps) {
  return on ? <Tooltip {...props}>{children}</Tooltip> : <>{ children }</>;
}
