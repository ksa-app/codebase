import {
  LayoutDashboard, Users, Stethoscope, FileText, Globe,
  CheckCircle, AlertCircle, Settings,
} from "lucide-react";
import type { Page } from "../types";

export const navItems: { id: Page; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "candidate", label: "Candidates", icon: Users },
  { id: "medical", label: "Medical", icon: Stethoscope },
  { id: "mofa", label: "MOFA", icon: FileText },
  { id: "visa", label: "Visa", icon: Globe },
  { id: "takamul", label: "Takamul", icon: CheckCircle },
  { id: "passport", label: "Passport", icon: AlertCircle },
  { id: "setting", label: "Settings", icon: Settings },
];
