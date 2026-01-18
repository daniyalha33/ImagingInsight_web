import { useState, useEffect } from 'react';
import { Upload, FileText, Video, Download, Trash2, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { Alert, AlertDescription } from '../../../ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

const API_URL = 'http://localhost:5000/api';

interface FilesTabProps {
  classId: string;
}

export function FilesTab({ classId }: FilesTabProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState<'document' | 'video'>('document');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, [classId]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/classes/${classId}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      
      // Use XMLHttpRequest for upload progress
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setFiles([data.data, ...files]);
            setShowUploadDialog(false);
            setUploadProgress(0);
          } else {
            setError(data.message || 'Failed to upload file');
          }
        } else {
          const data = JSON.parse(xhr.responseText);
          setError(data.message || 'Failed to upload file');
        }
        setUploading(false);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setError('Network error. Please try again.');
        setUploading(false);
      });

      // Send request
      xhr.open('POST', `${API_URL}/classes/${classId}/files`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Upload file error:', err);
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/classes/${classId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFiles(files.filter(f => f._id !== fileId));
      } else {
        alert(data.message || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Delete file error:', err);
      alert('Failed to delete file');
    }
  };

  const handleDownload = async (fileId: string, url: string, name: string) => {
    try {
      // Increment download count
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/classes/${classId}/files/${fileId}/download`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Open file in new tab
      window.open(url, '_blank');
      
      // Update local state
      setFiles(files.map(f => 
        f._id === fileId ? { ...f, downloads: (f.downloads || 0) + 1 } : f
      ));
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Upload Section */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setUploadType('document');
            setShowUploadDialog(true);
            setError('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
        <Button
          onClick={() => {
            setUploadType('video');
            setShowUploadDialog(true);
            setError('');
          }}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Video className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {/* Files Grid */}
      {files.length === 0 ? (
        <Card className="p-12 text-center border-blue-100 border-dashed">
          <FileText className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h4 className="text-blue-900 mb-2 font-semibold">No files yet</h4>
          <p className="text-gray-600">Upload documents or videos for your students</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file._id} className="p-4 border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {file.type === 'document' ? (
                    <FileText className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Video className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleDownload(file._id, file.url, file.name)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteFile(file._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h4 className="text-blue-900 mb-2 truncate font-medium" title={file.name}>
                {file.name}
              </h4>
              <div className="space-y-1 text-gray-500 text-sm">
                <p>{file.size}</p>
                <p>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</p>
                <p>{file.downloads || 0} downloads</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="bg-white rounded-xl shadow-lg border p-6">
          <DialogTitle className="text-blue-900 font-semibold">
            Upload {uploadType === 'document' ? 'Document' : 'Video'}
          </DialogTitle>

          <DialogDescription className="text-gray-600">
            Upload{' '}
            {uploadType === 'document'
              ? 'PDF, DOCX, or other documents'
              : 'MP4, AVI, or other video files'}{' '}
            for students to access
          </DialogDescription>

          {error && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-900">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="file-upload">Select File</Label>
              <div className="mt-1.5">
                <input
                  id="file-upload"
                  type="file"
                  accept={
                    uploadType === 'document'
                      ? '.pdf,.doc,.docx,.ppt,.pptx'
                      : '.mp4,.avi,.mov,.wmv'
                  }
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size (100MB limit)
                      if (file.size > 100 * 1024 * 1024) {
                        setError('File size must be less than 100MB');
                        return;
                      }
                      handleUploadFile(file);
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md cursor-pointer ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </label>
              </div>
              
              {uploading && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}