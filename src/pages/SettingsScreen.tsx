import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  Save,
  ArrowLeft,
  Upload,
  Download,
  Bell,
  Building,
  Printer,
  ChevronRight,
  ShieldCheck,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Settings = {
  store: {
    name: string;
    address: string;
    phone: string;
    email: string;
    pan: string;
    footerMessage: string;
    taxRate: number;
    currency: string;
  };
  receipt: {
    header: string;
    footer: string;
    showTax: boolean;
    showLogo: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    lowStock: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    requirePasswordForDelete: boolean;
  };
};

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Settings>({
    store: {
      name: settings.name || '',
      address: settings.address || '',
      phone: settings.phone || '',
      email: settings.email || 'store@example.com',
      pan: settings.pan || '',
      footerMessage: settings.footerMessage || 'Thank you for shopping with us!',
      taxRate: settings.taxRate || 13,
      currency: settings.currency || 'NPR'
    },
    receipt: {
      header: settings.receipt?.header || 'Thank you for your purchase!',
      footer: settings.receipt?.footer || 'Please come again!',
      showTax: settings.receipt?.showTax ?? true,
      showLogo: settings.receipt?.showLogo ?? true
    },
    notifications: {
      email: true,
      sms: true,
      lowStock: true,
      ...settings.notifications
    },
    security: {
      twoFactorAuth: settings.security?.twoFactorAuth ?? false,
      sessionTimeout: settings.security?.sessionTimeout ?? 30,
      requirePasswordForDelete: settings.security?.requirePasswordForDelete ?? true,
      ...settings.security
    }
  });

  // Sync local state when global settings are fetched
  React.useEffect(() => {
    setFormData({
      store: {
        name: settings.name || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || 'store@example.com',
        pan: settings.pan || '',
        footerMessage: settings.footerMessage || 'Thank you for shopping with us!',
        taxRate: settings.taxRate || 13,
        currency: settings.currency || 'NPR'
      },
      receipt: {
        header: settings.receipt?.header || 'Thank you for your purchase!',
        footer: settings.receipt?.footer || 'Please come again!',
        showTax: settings.receipt?.showTax ?? true,
        showLogo: settings.receipt?.showLogo ?? true
      },
      notifications: {
        email: true,
        sms: true,
        lowStock: true,
        ...settings.notifications
      },
      security: {
        twoFactorAuth: settings.security?.twoFactorAuth ?? false,
        sessionTimeout: settings.security?.sessionTimeout ?? 30,
        requirePasswordForDelete: settings.security?.requirePasswordForDelete ?? true,
        ...settings.security
      }
    });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const [section, key] = name.split('.');

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof Settings],
        [key]: type === 'number' ? parseFloat(value) : value
      }
    }));
  };

  const handleToggle = (section: keyof Settings, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    updateSettings({
      ...formData.store,
      receipt: formData.receipt,
      notifications: formData.notifications,
      security: formData.security
    });

    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const Switch = ({ checked, onChange, label, description }: { checked: boolean, onChange: (v: boolean) => void, label: string, description?: string }) => (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <Label className="text-sm font-bold text-gray-800">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          checked ? "bg-primary" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">Settings</h1>
          <p className="text-muted-foreground font-medium">Configure your store, receipts, and security preferences.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" className="gap-2 font-bold text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleSave} className="gap-2 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 px-8">
            <Save className="h-4 w-4" /> Save All Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <TabsList className="flex flex-col bg-transparent h-auto p-0 space-y-2 border-none">
          {[
            { id: 'general', icon: Building, label: 'Store Info' },
            { id: 'receipt', icon: Printer, label: 'Receipt & Billing' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: ShieldCheck, label: 'Security & Access' },
            { id: 'backup', icon: History, label: 'Backup & Restore' },
          ].map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 group"
            >
              <tab.icon className="h-5 w-5 group-data-[state=active]:text-primary" />
              <span className="font-bold group-data-[state=active]:text-primary">{tab.label}</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="general" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardHeader className="border-b pb-6">
                <CardTitle className="text-xl font-black">Store Information</CardTitle>
                <CardDescription className="text-sm font-medium">Your store identity and basic billing details.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="store.name" className="text-sm font-bold text-gray-700">Store Name</Label>
                    <Input id="store.name" name="store.name" value={formData.store.name} onChange={handleChange} placeholder="e.g. My Local Mart" className="font-semibold h-11" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="store.pan" className="text-sm font-bold text-gray-700">PAN Number</Label>
                    <Input id="store.pan" name="store.pan" value={formData.store.pan} onChange={handleChange} placeholder="9-digit PAN" className="font-mono font-semibold h-11" />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="store.address" className="text-sm font-bold text-gray-700">Business Address</Label>
                    <Textarea id="store.address" name="store.address" value={formData.store.address} onChange={handleChange} placeholder="Update store address" className="font-semibold min-h-[100px] bg-slate-50/30" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="store.phone" className="text-sm font-bold text-gray-700">Contact Phone</Label>
                    <Input id="store.phone" name="store.phone" value={formData.store.phone} onChange={handleChange} className="font-semibold h-11" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="store.email" className="text-sm font-bold text-gray-700">Business Email</Label>
                    <Input id="store.email" type="email" name="store.email" value={formData.store.email} onChange={handleChange} className="font-semibold h-11" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="store.taxRate" className="text-sm font-bold text-gray-700">Default Tax Rate (%)</Label>
                    <Input id="store.taxRate" type="number" name="store.taxRate" value={formData.store.taxRate} onChange={handleChange} className="font-bold h-11 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="store.currency" className="text-sm font-bold text-gray-700">Currency</Label>
                    <Select value={formData.store.currency} onValueChange={(v) => handleToggle('store', 'currency', v)}>
                      <SelectTrigger className="h-11 font-bold">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NPR">Nepalese Rupee (NPR)</SelectItem>
                        <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipt" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
              <CardHeader className="border-b pb-6 bg-slate-50/30">
                <CardTitle className="text-xl font-black">Receipt Customization</CardTitle>
                <CardDescription className="text-sm font-medium">Control how your print receipts look.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">Header Message</Label>
                    <Textarea name="receipt.header" value={formData.receipt.header} onChange={handleChange} rows={2} className="font-semibold bg-slate-50/30" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">Footer Message</Label>
                    <Textarea name="receipt.footer" value={formData.receipt.footer} onChange={handleChange} rows={2} className="font-semibold bg-slate-50/30" />
                  </div>
                  <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                    <Switch
                      checked={formData.receipt.showTax}
                      onChange={(v) => handleToggle('receipt', 'showTax', v)}
                      label="Show Tax Breakdown"
                      description="Include detailed tax information on every receipt."
                    />
                    <div className="h-px bg-slate-200" />
                    <Switch
                      checked={formData.receipt.showLogo}
                      onChange={(v) => handleToggle('receipt', 'showLogo', v)}
                      label="Print Store Logo"
                      description="If a logo is uploaded, it will be printed on the header."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardHeader className="border-b pb-6">
                <CardTitle className="text-xl font-black">Notification Preferences</CardTitle>
                <CardDescription className="text-sm font-medium">Stay updated on sales and inventory status.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <Switch
                  checked={formData.notifications.email}
                  onChange={(v) => handleToggle('notifications', 'email', v)}
                  label="Email Summaries"
                  description="Receive daily end-of-day sales reports via email."
                />
                <div className="h-px bg-slate-100" />
                <Switch
                  checked={formData.notifications.sms}
                  onChange={(v) => handleToggle('notifications', 'sms', v)}
                  label="Critical SMS Alerts"
                  description="Get notified immediately about suspicious activities."
                />
                <div className="h-px bg-slate-100" />
                <Switch
                  checked={formData.notifications.lowStock}
                  onChange={(v) => handleToggle('notifications', 'lowStock', v)}
                  label="Inventory Alerts"
                  description="Push notifications when products fall below low stock threshold."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardHeader className="border-b pb-6">
                <CardTitle className="text-xl font-black">Security & Privacy</CardTitle>
                <CardDescription className="text-sm font-medium">Manage access and protect your store data.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Switch
                    checked={formData.security.twoFactorAuth}
                    onChange={(v) => handleToggle('security', 'twoFactorAuth', v)}
                    label="Two-Factor Authentication"
                    description="Require a code from your phone to login."
                  />
                  <div className="h-px bg-slate-100" />
                  <Switch
                    checked={formData.security.requirePasswordForDelete}
                    onChange={(v) => handleToggle('security', 'requirePasswordForDelete', v)}
                    label="Admin Action Confirmation"
                    description="Require admin password to delete products or expenses."
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">Auto-Logout Period (Minutes)</Label>
                  <Select
                    value={formData.security.sessionTimeout.toString()}
                    onValueChange={(v) => handleToggle('security', 'sessionTimeout', parseInt(v))}
                  >
                    <SelectTrigger className="h-11 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="60">1 Hour</SelectItem>
                      <SelectItem value="0">Never (High Risk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="outline" className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all">
                    Change Administrative Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="m-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-xl shadow-slate-200/50 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-black flex items-center gap-2 text-blue-600"><Download className="h-4 w-4" /> Create Backup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">Securely archive all your product, sales, and settings data into a encrypted file.</p>
                  <Button className="w-full gap-2 font-bold shadow-md">Run System Backup</Button>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-[10px] text-muted-foreground font-mono">LAST BACKUP: {new Date().toLocaleDateString()} AT {new Date().toLocaleTimeString()}</p>
                </CardFooter>
              </Card>

              <Card className="border-none shadow-xl shadow-slate-200/50 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-black flex items-center gap-2 text-amber-600"><Upload className="h-4 w-4" /> Restore Point</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">Recover your system from a previous backup file. Warning: This will overwrite current data.</p>
                  <Button variant="outline" className="w-full gap-2 font-bold border-amber-200 text-amber-700 hover:bg-amber-50">Upload Backup File</Button>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-[10px] text-amber-600/70 font-bold uppercase tracking-tighter">Use with extreme caution</p>
                </CardFooter>
              </Card>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardHeader className="border-b"><CardTitle className="text-lg font-black">Automated Solutions</CardTitle></CardHeader>
              <CardContent className="p-8">
                <Switch
                  checked={true}
                  onChange={() => { }}
                  label="Cloud Synchronization"
                  description="Automatically backup data to your connected Google Drive once a day."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
