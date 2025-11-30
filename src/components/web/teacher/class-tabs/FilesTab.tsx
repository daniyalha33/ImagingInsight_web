import { useState } from 'react';
import { Upload, FileText, Video, Download, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

interface FilesTabProps {
  classId: string;
}

export function FilesTab({ classId }: FilesTabProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState<'document' | 'video'>('document');
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'CT Scan Basics.pdf',
      type: 'document',
      size: '2.5 MB',
      uploadedAt: '2024-10-05',
      downloads: 28
    },
    {
      id: '2',
      name: 'Liver Anatomy Introduction.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedAt: '2024-10-03',
      downloads: 32
    },
  ]);

  const handleUploadFile = (file: File) => {
    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      type: uploadType,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      downloads: 0
    };
    setFiles([newFile, ...files]);
    setShowUploadDialog(false);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Upload Section */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setUploadType('document');
            setShowUploadDialog(true);
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
          }}
          variant="outline"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Video className="w-4 h-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="p-4 border-blue-100 hover:shadow-md transition-shadow">
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
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteFile(file.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h4 className="text-blue-900 mb-2 truncate">{file.name}</h4>
            <div className="space-y-1 text-muted-foreground">
              <p>{file.size}</p>
              <p>Uploaded: {file.uploadedAt}</p>
              <p>{file.downloads} downloads</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
  <DialogContent className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border p-6">
    <DialogTitle>
      Upload {uploadType === 'document' ? 'Document' : 'Video'}
    </DialogTitle>

    <DialogDescription>
      Upload{' '}
      {uploadType === 'document'
        ? 'PDF, DOCX, or other documents'
        : 'MP4, AVI, or other video files'}{' '}
      for students to access
    </DialogDescription>

    <div className="space-y-4 mt-4">
  <div>
    <Label htmlFor="file-upload">Select File</Label>
    <div className="mt-1.5">
      {/* Hidden file input */}
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
          if (file) handleUploadFile(file);
        }}
        className="hidden"
      />
      {/* Styled button triggers file input */}
      <label
        htmlFor="file-upload"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md cursor-pointer"
      >
        <Upload className="w-4 h-4 mr-2" />
        Choose File
      </label>
    </div>
  </div>
</div>
  </DialogContent>
</Dialog>

    </div>
  );
}
