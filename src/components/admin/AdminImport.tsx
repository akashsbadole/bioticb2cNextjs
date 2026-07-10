'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  ArrowRight,
  Settings,
  Database,
  ArrowLeft,
  XCircle,
  FileSearch,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/admin-fetch';
import { parseCSV } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Step = 'platform' | 'upload' | 'mapping' | 'validation' | 'importing' | 'results';

interface Mapping {
  [key: string]: string;
}

const WOO_PRODUCT_HEADERS = [
  'ID', 'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog',
  'Short description', 'Description', 'Date sale price starts', 'Date sale price ends',
  'Tax status', 'Tax class', 'In stock?', 'Stock', 'Low stock amount',
  'Backorders allowed?', 'Sold individually?', 'Weight (kg)', 'Length (cm)',
  'Width (cm)', 'Height (cm)', 'Allow customer reviews?', 'Purchase note',
  'Sale price', 'Regular price', 'Categories', 'Tags', 'Shipping class',
  'Images', 'Download limit', 'Download expiry days', 'Parent',
  'Grouped products', 'Upsells', 'Cross-sells', 'External URL', 'Button text', 'Position'
];

export function AdminImport() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>('platform');
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce'>('woocommerce');
  const [entity, setEntity] = useState<'products' | 'orders' | 'users' | 'categories'>('products');
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCurrentStep('platform');
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setValidationErrors([]);
    setImportResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    const text = await selectedFile.text();
    const rows = parseCSV(text);
    if (rows.length < 2) {
      toast.error('CSV file is empty or invalid');
      return;
    }

    const csvHeaders = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      csvHeaders.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    setHeaders(csvHeaders);
    setCsvData(data);

    // Auto-mapping for WooCommerce
    if (platform === 'woocommerce') {
        const initialMapping: Mapping = {};
        csvHeaders.forEach(h => {
            if (WOO_PRODUCT_HEADERS.includes(h)) initialMapping[h] = h;
        });
        setMapping(initialMapping);
    }

    setCurrentStep('mapping');
  };

  const validateData = () => {
    const errors: string[] = [];
    if (entity === 'products') {
        csvData.forEach((row, i) => {
            if (!row[mapping['Name'] || 'Name']) errors.push(`Row ${i + 1}: Name is required`);
        });
    }
    setValidationErrors(errors);
    setCurrentStep('validation');
  };

  const importMutation = useMutation({
    mutationFn: async () => {
        const res = await adminFetch(`/api/admin/migrations/woocommerce`, {
            method: 'POST',
            body: JSON.stringify({
                type: entity,
                data: csvData,
                mapping: mapping
            })
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Import failed');
        return res.json();
    },
    onSuccess: (data) => {
        setImportResult(data);
        setCurrentStep('results');
        toast.success(`Migration completed: ${data.imported} items imported`);
        queryClient.invalidateQueries();
    },
    onError: (err: any) => {
        toast.error(err.message);
        setCurrentStep('validation');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Migration Suite
          </h2>
          <p className="text-muted-foreground mt-1 text-lg">Migrate your store data with a professional wizard</p>
        </div>
        {currentStep !== 'platform' && (
            <Button variant="outline" onClick={reset} className="rounded-full">
                <Trash2 className="h-4 w-4 mr-2" /> Start Over
            </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-4">
        {[
            { id: 'platform', label: 'Platform', icon: Settings },
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'mapping', label: 'Mapping', icon: FileSearch },
            { id: 'validation', label: 'Validate', icon: AlertCircle },
            { id: 'importing', label: 'Import', icon: Database },
        ].map((s, idx) => {
            const isActive = currentStep === s.id || (currentStep === 'results' && s.id === 'importing');
            const isCompleted = ['platform', 'upload', 'mapping', 'validation', 'importing'].indexOf(currentStep as any) > idx || currentStep === 'results';

            return (
                <div key={s.id} className="flex flex-col items-center gap-2 flex-1 relative">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all z-10",
                        isActive ? "border-primary bg-primary text-white shadow-lg shadow-primary/30" :
                        isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted bg-background text-muted-foreground"
                    )}>
                        {isCompleted ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
                    {idx < 4 && (
                        <div className={cn("absolute h-[2px] w-full top-5 left-1/2 -z-0", isCompleted ? "bg-emerald-500" : "bg-muted")} />
                    )}
                </div>
            )
        })}
      </div>

      <div className="mt-8">
        {currentStep === 'platform' && (
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-card to-muted/20">
                <CardHeader className="pt-8 text-center">
                    <CardTitle className="text-2xl font-black">Choose your source</CardTitle>
                    <CardDescription>Select the platform you are migrating from</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 p-8">
                    <div
                        className={cn("p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg flex flex-col items-center gap-4 group", platform === 'woocommerce' ? 'border-primary bg-primary/5' : 'border-muted bg-background')}
                        onClick={() => setPlatform('woocommerce')}
                    >
                        <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src="https://woocommerce.com/wp-content/themes/wccom/images/logo-woocommerce.svg" className="h-8" alt="Woo" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold">WooCommerce</p>
                            <p className="text-xs text-muted-foreground mt-1">Direct CSV export mapping</p>
                        </div>
                    </div>
                    <div
                        className={cn("p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg flex flex-col items-center gap-4 group opacity-50 grayscale", platform === 'shopify' ? 'border-primary bg-primary/5' : 'border-muted bg-background')}
                        // onClick={() => setPlatform('shopify')}
                    >
                        <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
                            <img src="https://cdn.shopify.com/assets/images/logos/shopify-bag.svg" className="h-8" alt="Shopify" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold">Shopify</p>
                            <p className="text-xs text-muted-foreground mt-1">Coming soon...</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pb-8 flex justify-center">
                    <Button size="lg" className="rounded-full px-12 h-12 font-bold shadow-xl" onClick={() => setCurrentStep('upload')}>
                        Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        )}

        {currentStep === 'upload' && (
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-black">Upload your data</CardTitle>
                    <CardDescription>Select the entity and upload your {platform} CSV file</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    <div className="grid grid-cols-2 gap-4">
                        {['products', 'orders', 'users', 'categories'].map((e) => (
                            <div
                                key={e}
                                className={cn("p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3", entity === e ? 'border-primary bg-primary/5' : 'border-muted bg-background')}
                                onClick={() => setEntity(e as any)}
                            >
                                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", entity === e ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                                    <Database className="h-4 w-4" />
                                </div>
                                <span className="font-bold capitalize">{e}</span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer hover:bg-muted/30 transition-all border-muted-foreground/20"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <p className="text-lg font-bold">Click to upload your CSV</p>
                        <p className="text-sm text-muted-foreground mt-1">Maximum file size: 50MB</p>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-6 flex justify-between">
                    <Button variant="ghost" className="rounded-full" onClick={() => setCurrentStep('platform')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </CardFooter>
            </Card>
        )}

        {currentStep === 'mapping' && (
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl font-black">Map CSV Headers</CardTitle>
                    <CardDescription>Match your CSV columns to our database fields</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                        <div className="p-6 space-y-4">
                            {WOO_PRODUCT_HEADERS.filter(h => entity === 'products' ? true : false).map(header => (
                                <div key={header} className="grid grid-cols-2 gap-4 items-center p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <Label className="font-bold text-sm">{header}</Label>
                                    <Select
                                        value={mapping[header]}
                                        onValueChange={(v) => setMapping(prev => ({ ...prev, [header]: v }))}
                                    >
                                        <SelectTrigger className="rounded-lg h-10">
                                            <SelectValue placeholder="Skip field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Skip field</SelectItem>
                                            {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-6 border-t flex justify-between bg-card">
                    <Button variant="ghost" className="rounded-full" onClick={() => setCurrentStep('upload')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20" onClick={validateData}>
                        Validate Data <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        )}

        {currentStep === 'validation' && (
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl font-black">Data Validation</CardTitle>
                    <CardDescription>Checking {csvData.length} rows for inconsistencies</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    {validationErrors.length > 0 ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4 text-destructive">
                                <XCircle className="h-6 w-6 shrink-0" />
                                <div>
                                    <p className="font-bold">Validation Failed</p>
                                    <p className="text-sm">We found {validationErrors.length} errors in your CSV file.</p>
                                </div>
                            </div>
                            <ScrollArea className="h-[300px] rounded-xl border p-4 bg-muted/30">
                                <ul className="space-y-2">
                                    {validationErrors.map((err, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold">Row {err.split(':')[0].replace(/\D/g,'')}</Badge>
                                            {err.split(':')[1]}
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                <CheckCircle className="h-16 w-16" />
                            </div>
                            <h3 className="text-2xl font-black">Everything looks great!</h3>
                            <p className="text-muted-foreground mt-2">All {csvData.length} records are ready for migration.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-6 bg-muted/30 flex justify-between">
                    <Button variant="ghost" className="rounded-full" onClick={() => setCurrentStep('mapping')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        className="rounded-full px-12 h-12 font-bold shadow-xl shadow-primary/20"
                        disabled={validationErrors.length > 0 || importMutation.isPending}
                        onClick={() => importMutation.mutate()}
                    >
                        {importMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                        Start Migration
                    </Button>
                </CardFooter>
            </Card>
        )}

        {currentStep === 'results' && importResult && (
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden text-center">
                <CardContent className="pt-16 pb-8">
                    <div className="h-32 w-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                        <CheckCircle className="h-20 w-20" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-2">Migration Successful!</h2>
                    <p className="text-xl text-muted-foreground max-w-md mx-auto">
                        We successfully imported your {entity} into your store.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
                        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                            <p className="text-3xl font-black text-emerald-700">{importResult.imported}</p>
                            <p className="text-xs font-bold uppercase text-emerald-600 mt-1 tracking-widest">Imported</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100">
                            <p className="text-3xl font-black text-orange-700">{importResult.errors?.length || 0}</p>
                            <p className="text-xs font-bold uppercase text-orange-600 mt-1 tracking-widest">Errors</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-muted border border-muted-foreground/10">
                            <p className="text-3xl font-black">{csvData.length}</p>
                            <p className="text-xs font-bold uppercase text-muted-foreground mt-1 tracking-widest">Total Rows</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pb-12 flex flex-col gap-4 items-center">
                    <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold shadow-2xl shadow-primary/30" onClick={reset}>
                        Import More Data
                    </Button>
                    <Button variant="ghost" onClick={() => window.location.href = '/admin/products'}>
                        Go to Products <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
