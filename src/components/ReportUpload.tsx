import React, { useState, useCallback } from 'react';
import { Upload, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface MedicalReport {
  id: string;
  fileName: string;
  fileUrl?: string | null;
  testDate: string;
  tsh: number | null;
  t3: number | null;
  t4: number | null;
  notes: string | null;
}

interface ReportUploadProps {
  patientId: string;
  onUploadSuccess?: (newReport?: MedicalReport) => void;
}

const ReportUpload: React.FC<ReportUploadProps> = ({ patientId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [tsh, setTsh] = useState('');
  const [t3, setT3] = useState('');
  const [t4, setT4] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [reportCount, setReportCount] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF, JPG, or PNG files only',
          variant: 'destructive'
        });
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB',
          variant: 'destructive'
        });
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);

      // Auto-extract values from filename if they exist (TSH: 2.5, T3: 120, etc)
      const filenameRegex = /TSH[:\s]+(\d+\.?\d*)|T3[:\s]+(\d+\.?\d*)|T4[:\s]+(\d+\.?\d*)/gi;
      let match;
      while ((match = filenameRegex.exec(selectedFile.name)) !== null) {
        if (match[1]) setTsh(match[1]);
        if (match[2]) setT3(match[2]);
        if (match[3]) setT4(match[3]);
      }

      toast({
        title: 'File selected',
        description: `${selectedFile.name} ready to upload`
      });
    }
  };

  const loadReports = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/patient/${patientId}/reports`);
      if (!response.ok) {
        const message = `Failed to load reports: ${response.status} ${response.statusText}`;
        console.error(message);
        toast({ title: 'Failed to load reports', description: message, variant: 'destructive' });
        return;
      }
      const data = await response.json();
      const reportsArray = Array.isArray(data) ? data : [];
      setReports(reportsArray);
      setReportCount(reportsArray.length);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast({ title: 'Failed to load reports', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    }
  }, [patientId]);

  const handleUpload = async () => {
    if (!file && !tsh && !t3 && !t4) {
      toast({
        title: 'Missing data',
        description: 'Please provide at least one value or upload a file',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Validate numbers
      const tshNum = tsh.trim() !== '' ? parseFloat(tsh) : null;
      const t3Num = t3.trim() !== '' ? parseFloat(t3) : null;
      const t4Num = t4.trim() !== '' ? parseFloat(t4) : null;

      if ((tsh.trim() !== '' && isNaN(tshNum)) || (t3.trim() !== '' && isNaN(t3Num)) || (t4.trim() !== '' && isNaN(t4Num))) {
        throw new Error('Invalid lab values. Please enter valid numbers.');
      }

      const formData = new FormData();
      formData.append('patientId', patientId);
      if (file) {
        formData.append('report', file);
      }
      if (tshNum !== null) formData.append('tsh', tshNum.toString());
      if (t3Num !== null) formData.append('t3', t3Num.toString());
      if (t4Num !== null) formData.append('t4', t4Num.toString());
      if (notes.trim()) formData.append('notes', notes.trim());

      const uploadResponse = await fetch(`${API_BASE}/api/reports/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        let errorMsg = 'Upload failed';
        try {
          const errorData = await uploadResponse.json();
          errorMsg = errorData.error || errorData.details || 'Upload failed';
        } catch {
          errorMsg = `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const uploadData = await uploadResponse.json();
      if (uploadData.extracted) {
        if (uploadData.extracted.tsh !== null && uploadData.extracted.tsh !== undefined) {
          setTsh(uploadData.extracted.tsh.toString());
        }
        if (uploadData.extracted.t3 !== null && uploadData.extracted.t3 !== undefined) {
          setT3(uploadData.extracted.t3.toString());
        }
        if (uploadData.extracted.t4 !== null && uploadData.extracted.t4 !== undefined) {
          setT4(uploadData.extracted.t4.toString());
        }
      }

      if (uploadData.ai) {
        toast({
          title: '🧠 AI Analysis Complete!',
          description: `Prediction: ${uploadData.ai.prediction} (${uploadData.ai.confidence}% confidence)`
        });
      }

      toast({
        title: 'Report uploaded and analyzed!',
        description: `TSH: ${uploadData.test.tsh || 'N/A'}, T3: ${uploadData.test.t3 || 'N/A'}, T4: ${uploadData.test.t4 || 'N/A'}`
      });

      // Add the newly created report immediately so the count updates visually
      if (uploadData.test) {
        setReports((current) => [uploadData.test, ...current]);
        setReportCount((current) => current + 1);
      }

      // Reset form
      setFile(null);
      setFileName('');
      setTsh('');
      setT3('');
      setT4('');
      setNotes('');

      if (onUploadSuccess) await onUploadSuccess(uploadData.test);
      await loadReports();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (testId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/tests/${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Report deleted' });
        loadReports();
      }
    } catch (error) {
      toast({
        title: 'Delete failed',
        variant: 'destructive'
      });
    }
  };

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="medical-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Medical Report
        </h3>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label className="mb-2 block">Upload Report (PDF/Image)</Label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-accent transition-colors"
              >
                <div className="text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    {file ? `✓ ${fileName}` : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                </div>
              </label>
            </div>
          </div>

          {/* Auto-filled Lab Values */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="tsh" className="mb-2 block text-sm">TSH (mIU/L)</Label>
              <Input
                id="tsh"
                type="number"
                step="0.1"
                value={tsh}
                onChange={(e) => setTsh(e.target.value)}
                placeholder="0.4 - 4.0"
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="t3" className="mb-2 block text-sm">T3 (pg/mL)</Label>
              <Input
                id="t3"
                type="number"
                step="0.1"
                value={t3}
                onChange={(e) => setT3(e.target.value)}
                placeholder="80 - 200"
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="t4" className="mb-2 block text-sm">T4 (ng/dL)</Label>
              <Input
                id="t4"
                type="number"
                step="0.1"
                value={t4}
                onChange={(e) => setT4(e.target.value)}
                placeholder="4.5 - 12"
                className="text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="mb-2 block text-sm">Notes (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this report..."
              className="w-full p-2 border border-border rounded-lg text-sm"
              rows={2}
            />
          </div>

          <Button onClick={handleUpload} disabled={loading} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {loading ? 'Uploading...' : 'Upload Report'}
          </Button>
        </div>
      </div>

      {/* Reports History */}
      <div className="medical-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Medical Reports
          </h3>
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">{reportCount} report{reportCount === 1 ? '' : 's'}</span>
        </div>

        {reports.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reports uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{report.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.testDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs">
                      {report.tsh && <span>TSH: <span className="font-semibold">{report.tsh}</span></span>}
                      {report.t3 && <span>T3: <span className="font-semibold">{report.t3}</span></span>}
                      {report.t4 && <span>T4: <span className="font-semibold">{report.t4}</span></span>}
                    </div>
                    {report.fileUrl && (
                      <a href={report.fileUrl} target="_blank" rel="noreferrer" className="text-primary text-xs underline mt-2 inline-block">
                        View uploaded document
                      </a>
                    )}
                    {report.notes && <p className="text-xs text-muted-foreground mt-2">{report.notes}</p>}
                  </div>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportUpload;
