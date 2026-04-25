// components/teacher/CreateSegmentationTestScreen.tsx
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle, Upload, Eye } from 'lucide-react';
import { Button }   from '../../ui/button';
import { Input }    from '../../ui/input';
import { Label }    from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card }     from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../../ui/select';

const API_URL = 'http://localhost:5000/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreateSegmentationTestScreenProps {
  classId: string;
  onBack: () => void;
  onSuccess?: () => void;
}

interface SegmentationCase {
  id: string;               // local only – stripped before POST
  description:   string;
  niftiFileUrl:  string;    // URL after upload (GridFS stream URL or S3)
  labelFileUrl:  string;
  sliceNum:      number;
  axis:          number;
  referenceThumbnailUrl: string;

  // UI-only state
  _niftiFileName:  string;
  _labelFileName:  string;
  _uploading:      boolean;
  _previewReady:   boolean;
  _maxSlice?:      number; // maximum slice index (from server), optional
  _sliceValid:       boolean;
  _sliceOrgans:      string[];
  _recommendedSlices: { slice: number; organCount: number }[];
  _validating:       boolean;
}

const AXIS_LABELS: Record<number, string> = {
  0: 'Sagittal',
  1: 'Coronal',
  2: 'Axial (default)',
};

const emptyCase = (): SegmentationCase => ({
  id:                   Date.now().toString(),
  description:          '',
  niftiFileUrl:         '',
  labelFileUrl:         '',
  sliceNum:             50,
  axis:                 2,
  referenceThumbnailUrl: '',
  _niftiFileName:       '',
  _labelFileName:       '',
  _uploading:           false,
  _previewReady:        false,
  _maxSlice:            undefined,
  _sliceValid:        true,
  _sliceOrgans:       [],
  _recommendedSlices: [],
  _validating:        false,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Upload a NIfTI file to your Node.js backend which stores it in GridFS
 * and returns a streaming URL.
 *
 * Adjust this function to match your existing file-upload route.
 * Expected response: { success: true, url: "http://localhost:5000/api/files/<id>/stream" }
 */
async function uploadNiftiFile(file: File, token: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/files/upload-nifti`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json();
  if (!data.success || !data.url) {
    throw new Error(data.message || 'File upload failed');
  }
  return data.url as string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateSegmentationTestScreen({
  classId,
  onBack,
  onSuccess,
}: CreateSegmentationTestScreenProps) {
  const [testTitle,    setTestTitle]    = useState('');
  const [instructions, setInstructions] = useState(
    'Segment the highlighted organ as accurately as possible.'
  );
  const [testDuration, setTestDuration] = useState('30');
  const [dueDate,      setDueDate]      = useState('');
  const [creating,     setCreating]     = useState(false);
  const [error,        setError]        = useState('');
  const [cases, setCases] = useState<SegmentationCase[]>([emptyCase()]);

  // ── Case management ─────────────────────────────────────────────────────────

  const updateCase = (id: string, patch: Partial<SegmentationCase>) => {
    setCases(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addCase = () => setCases(prev => [...prev, emptyCase()]);

  const removeCase = (id: string) => {
    if (cases.length > 1) {
      setCases(prev => prev.filter(c => c.id !== id));
    }
  };

  // ── Slice validation ────────────────────────────────────────────────────────

  const validateSlice = async (segCase: SegmentationCase) => {
    if (!segCase.labelFileUrl) return;

    updateCase(segCase.id, { _validating: true });
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(
        `${API_URL}/segmentation-tests/validate-slice` +
        `?label_url=${encodeURIComponent(segCase.labelFileUrl)}` +
        `&slice_num=${segCase.sliceNum}` +
        `&axis=${segCase.axis}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        updateCase(segCase.id, {
          _sliceValid:        data.valid,
          _sliceOrgans:       data.organsPresent ?? [],
          _recommendedSlices: data.recommendedSlices ?? [],
          _validating:        false,
        });
      }
    } catch {
      updateCase(segCase.id, { _validating: false });
    }
  };

  // ── Case management ─────────────────────────────────────────────────────────
  // ── File upload ─────────────────────────────────────────────────────────────

  const handleFileUpload = async (
    caseId:    string,
    file:      File,
    fileType:  'nifti' | 'label'
  ) => {
    if (!file.name.endsWith('.nii') && !file.name.endsWith('.nii.gz')) {
      setError('Only .nii or .nii.gz files are accepted');
      return;
    }

    updateCase(caseId, { _uploading: true });
    try {
      const token = localStorage.getItem('token') ?? '';
      const url   = await uploadNiftiFile(file, token);

      if (fileType === 'nifti') {
        updateCase(caseId, { niftiFileUrl: url, _niftiFileName: file.name, _uploading: false });
      } else {
        const updated = { ...cases.find(x => x.id === caseId)!, labelFileUrl: url, _labelFileName: file.name, _uploading: false };
        updateCase(caseId, updated);
        validateSlice(updated);   // ← auto-validate immediately after upload
      }
    } catch (err: any) {
      updateCase(caseId, { _uploading: false });
      setError(`Upload failed: ${err.message}`);
    }
  };

  // ── Preview ─────────────────────────────────────────────────────────────────

  const handlePreview = async (segCase: SegmentationCase) => {
    if (!segCase.niftiFileUrl) {
      setError('Upload the CT NIfTI file first');
      return;
    }

    // Try to fetch lightweight NIfTI info (axis sizes) so we can clamp slice number
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(
        `${API_URL}/segmentation-tests/nifti-info?nifti_url=${encodeURIComponent(segCase.niftiFileUrl)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const info = await res.json().catch(() => ({}));
      if (info && info.success && typeof info.axisSize === 'number') {
        // axisSize is total slices along the selected axis
        updateCase(segCase.id, { _maxSlice: Math.max(0, info.axisSize - 1) });
        setError('');
      }
    } catch (e) {
      // non-fatal — continue to open preview
      console.warn('Failed to fetch NIfTI info for preview', e);
    }

    const previewUrl =
      `${API_URL}/segmentation-tests/preview-slice` +
      `?nifti_url=${encodeURIComponent(segCase.niftiFileUrl)}` +
      `&slice_num=${segCase.sliceNum}&axis=${segCase.axis}`;
    window.open(previewUrl, '_blank');
  };
  // ── Validation ──────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    if (!testTitle.trim())  { setError('Please enter a test title'); return false; }
    if (!dueDate)           { setError('Please select a due date');  return false; }

    for (let i = 0; i < cases.length; i++) {
      const c = cases[i];
      if (!c.description.trim()) { setError(`Case ${i + 1}: description is required`); return false; }
      if (!c.niftiFileUrl)       { setError(`Case ${i + 1}: upload the CT NIfTI file`); return false; }
      if (!c.labelFileUrl)       { setError(`Case ${i + 1}: upload the label file`);    return false; }
      if (c.sliceNum < 0)        { setError(`Case ${i + 1}: slice number must be ≥ 0`); return false; }
      if (!c._sliceValid) {
        setError(`Case ${i + 1}: slice ${c.sliceNum} has no annotations. ` +
                 `Try: ${c._recommendedSlices.slice(0,3).map(r => r.slice).join(', ')}`);
        return false;
      }
    }
    return true;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSaveTest = async () => {
    if (!validateForm()) return;

    setCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('token') ?? '';

      // Strip UI-only fields
      const segmentationCases = cases.map(({ id, _niftiFileName, _labelFileName, _uploading, _previewReady, _maxSlice, ...rest }) => rest);

      const response = await fetch(`${API_URL}/segmentation-tests`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: testTitle,
          instructions,
          classId,
          duration: parseInt(testDuration, 10),
          dueDate:  new Date(dueDate).toISOString(),
          segmentationCases,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
        onBack();
      } else {
        setError(data.message || 'Failed to create test');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-full bg-blue-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">

        {/* Header */}
        <div className="bg-blue-600 text-white rounded-lg p-6 mb-6 shadow-md">
          <button onClick={onBack} disabled={creating} className="flex items-center gap-2 hover:opacity-90 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold">Create Segmentation Assessment</h1>
          <p className="text-blue-100 mt-1">Assign CT scan annotation tasks to your students</p>
        </div>

        {/* Error */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Info */}
        <Card className="p-6 mb-6 border border-blue-200 bg-white shadow-sm">
          <h3 className="text-blue-900 mb-4 font-semibold">Assessment Details</h3>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="e.g., Liver Segmentation – Week 4"
                value={testTitle}
                onChange={e => setTestTitle(e.target.value)}
                disabled={creating}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Instructions shown to students</Label>
              <Textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                disabled={creating}
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number" min={1}
                  value={testDuration}
                  onChange={e => setTestDuration(e.target.value)}
                  disabled={creating}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  disabled={creating}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Cases */}
        <Card className="p-6 mb-6 border border-blue-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-900 font-semibold">CT Cases</h3>
            <Button
              onClick={addCase}
              variant="outline" size="sm"
              disabled={creating}
              className="border-blue-600 text-blue-600 hover:bg-blue-100"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Case
            </Button>
          </div>

          <div className="space-y-6">
            {cases.map((c, idx) => (
              <Card key={c.id} className="p-4 border-blue-200 bg-blue-50">
                {/* Case header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-blue-900 font-medium">Case {idx + 1}</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handlePreview(c)}
                      disabled={creating || !c.niftiFileUrl}
                      title="Preview slice"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    {cases.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeCase(c.id)} disabled={creating}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Description */}
                  <div>
                    <Label>Case Description</Label>
                    <Input
                      placeholder="e.g., Liver – Axial Slice 72"
                      value={c.description}
                      onChange={e => updateCase(c.id, { description: e.target.value })}
                      disabled={creating}
                      className="mt-1.5 bg-white"
                    />
                  </div>                  {/* Organ Info */}
                  <div className="mt-1.5 flex items-center gap-2 px-3 py-2 rounded-md
                                  bg-blue-50 border border-blue-200 text-sm text-blue-700">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                         style={{flexShrink: 0}}>
                      <circle cx="8" cy="8" r="7" stroke="#2563EB" strokeWidth="1.5"/>
                      <path d="M8 7v4M8 5.5v .5" stroke="#2563EB" strokeWidth="1.5"
                            strokeLinecap="round"/>
                    </svg>
                    Students segment <strong className="mx-1">all 13 organs</strong>
                    visible on the selected slice. No organ selection needed.
                  </div>

                  {/* NIfTI upload */}
                  <div>
                    <Label>CT Scan File (.nii / .nii.gz)</Label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <label className="flex-1">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer bg-white
                          ${c.niftiFileUrl ? 'border-green-400 text-green-700' : 'border-blue-300 text-blue-600'}
                          hover:bg-blue-50`}>
                          {c._uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span className="text-sm truncate">
                            {c.niftiFileUrl ? (c._niftiFileName || 'Uploaded ✓') : 'Upload CT NIfTI'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".nii,.nii.gz"
                          className="hidden"
                          disabled={creating || c._uploading}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(c.id, file, 'nifti');
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Label upload */}
                  <div>
                    <Label>Ground-Truth Label File (.nii / .nii.gz)</Label>
                    <div className="mt-1.5">
                      <label>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer bg-white
                          ${c.labelFileUrl ? 'border-green-400 text-green-700' : 'border-blue-300 text-blue-600'}
                          hover:bg-blue-50`}>
                          {c._uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span className="text-sm truncate">
                            {c.labelFileUrl ? (c._labelFileName || 'Uploaded ✓') : 'Upload Label NIfTI'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept=".nii,.nii.gz"
                          className="hidden"
                          disabled={creating || c._uploading}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(c.id, file, 'label');
                          }}
                        />
                      </label>
                    </div>
                  </div>                  {/* Slice + Axis */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Slice Number</Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Input
                          type="number"
                          min={0}
                          max={c._maxSlice ?? 9999}
                          value={c.sliceNum}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const clamped = c._maxSlice !== undefined ? Math.min(val, c._maxSlice) : val;
                            updateCase(c.id, { sliceNum: clamped });
                            // Debounce — wait 600ms after typing stops
                            clearTimeout((window as any)[`sliceTimer_${c.id}`]);
                            (window as any)[`sliceTimer_${c.id}`] = setTimeout(() => {
                              validateSlice({ ...c, sliceNum: clamped });
                            }, 600);
                          }}
                          disabled={creating}
                          className={`bg-white flex-1 ${
                            !c._sliceValid && c.labelFileUrl
                              ? 'border-red-400 focus:ring-red-400'
                              : c._sliceValid && c._sliceOrgans.length > 0
                              ? 'border-green-400'
                              : ''
                          }`}
                        />
                        {c._validating && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                        )}
                        {!c._validating && c._sliceValid && c._sliceOrgans.length > 0 && (
                          <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>

                      {/* Invalid slice warning + recommendations */}
                      {!c._sliceValid && c.labelFileUrl && !c._validating && (
                        <div className="mt-2 p-2 rounded-md bg-red-50 border border-red-200">
                          <p className="text-xs text-red-700 font-medium mb-1">
                            No annotations on slice {c.sliceNum}. Pick one of these:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {c._recommendedSlices.slice(0, 6).map(r => (
                              <button
                                key={r.slice}
                                type="button"
                                onClick={() => {
                                  updateCase(c.id, { sliceNum: r.slice });
                                  validateSlice({ ...c, sliceNum: r.slice });
                                }}
                                className="text-xs px-2 py-1 rounded bg-white border
                                           border-red-300 text-red-700 hover:bg-red-100"
                              >
                                {r.slice}
                                <span className="text-red-400 ml-1">
                                  ({r.organCount} organ{r.organCount > 1 ? 's' : ''})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Valid slice — show which organs are present */}
                      {c._sliceValid && c._sliceOrgans.length > 0 && !c._validating && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c._sliceOrgans.map(organ => (
                            <span key={organ}
                              className="text-xs px-2 py-0.5 rounded-full bg-green-50
                                         border border-green-200 text-green-700">
                              {organ.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}

                      {c._maxSlice !== undefined && (
                        <p className="text-xs text-slate-400 mt-1">Valid range: 0 – {c._maxSlice}</p>
                      )}
                    </div>
                    <div>
                      <Label>Slice Axis</Label>
                      <Select
                        value={c.axis.toString()}
                        onValueChange={(val: string) => {
                          const newAxis = parseInt(val, 10);
                          updateCase(c.id, { axis: newAxis });
                          // Debounce validation on axis change
                          clearTimeout((window as any)[`sliceTimer_${c.id}`]);
                          (window as any)[`sliceTimer_${c.id}`] = setTimeout(() => {
                            validateSlice({ ...c, axis: newAxis });
                          }, 600);
                        }}
                        disabled={creating}
                      >
                        <SelectTrigger className="mt-1.5 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AXIS_LABELS).map(([v, label]) => (
                            <SelectItem key={v} value={v}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline" onClick={onBack} disabled={creating}
            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTest}
            disabled={!testTitle.trim() || creating}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            {creating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</>
            ) : 'Create Assessment'}
          </Button>
        </div>
      </div>
    </div>
  );
}