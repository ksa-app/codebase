import { SUPABASE_URL } from "../../lib/supabase";

export const SettingPage = () => (
  <div className="space-y-6 max-w-2xl">
    <div><h2 className="text-lg font-semibold text-foreground">Settings</h2><p className="text-sm text-muted-foreground mt-0.5">Manage company and system preferences</p></div>
    {[
      { title: "Supabase Configuration", fields: [{ label: "Project URL", value: SUPABASE_URL }, { label: "Anon Key", value: "Set in source code" }] },
      { title: "Company Information", fields: [{ label: "Company Name", value: "Manpower ERP" }, { label: "Country", value: "Bangladesh" }] },
    ].map(section => (
      <div key={section.title} className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border"><h3 className="font-semibold text-foreground text-sm">{section.title}</h3></div>
        <div className="p-5 space-y-4">
          {section.fields.map(f => (
            <div key={f.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <label className="text-sm text-muted-foreground w-48 flex-shrink-0">{f.label}</label>
              <input defaultValue={f.value} className="flex-1 px-3 py-2 border border-border rounded-lg bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
