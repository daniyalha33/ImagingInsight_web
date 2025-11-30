import { useState } from 'react';
import { ArrowLeft, Plus, Upload, FileText, Users, ClipboardList, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { PostsTab } from './class-tabs/PostsTab';
import { FilesTab } from './class-tabs/FilesTab';
import { TestsTab } from './class-tabs/TestsTab';

interface TeacherClassDetailScreenProps {
  classId: string;
  onBack: () => void;
  onCreateTest: () => void;
}

export function TeacherClassDetailScreen({ classId, onBack, onCreateTest }: TeacherClassDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('posts');

  // Mock class data
  const classData = {
    id: classId,
    name: 'Radiology Initial',
    code: 'RAD2024A',
    description: 'Introduction to radiology imaging and CT scan interpretation',
    students: 32,
    teacher: 'Dr. Tahir Mustafa'
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Classes
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-white mb-2">{classData.name}</h1>
              <p className="text-white/80 mb-2">{classData.description}</p>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {classData.students} students
                </span>
                <span>•</span>
                <span>Class Code: <code className="bg-white/20 px-2 py-1 rounded">{classData.code}</code></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b rounded-none bg-white px-6">
          <TabsTrigger value="posts" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <FileText className="w-4 h-4" />
            Files & Content
          </TabsTrigger>
          <TabsTrigger value="tests" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Tests
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50/50 to-white">
          <TabsContent value="posts" className="m-0 p-6">
            <PostsTab classId={classId} />
          </TabsContent>
          
          <TabsContent value="files" className="m-0 p-6">
            <FilesTab classId={classId} />
          </TabsContent>
          
          <TabsContent value="tests" className="m-0 p-6">
            <TestsTab classId={classId} onCreateTest={onCreateTest} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
