import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Users, ClipboardList, MessageSquare, Video, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { PostsTab } from './class-tabs/PostsTab';
import { FilesTab } from './class-tabs/FilesTab';
import { TestsTab } from './class-tabs/TestsTab';
import { LiveClassRoom } from './liveClassRoom';

const API_URL = 'http://localhost:5000/api';

interface ClassData {
  id: string;
  name: string;
  code: string;
  description: string;
  students: number;
  teacher: string;
}

interface TeacherClassDetailScreenProps {
  classId: string;
  onBack: () => void;
  onCreateTest: () => void;
  teacherName?: string;
}

export function TeacherClassDetailScreen({ classId, onBack, onCreateTest, teacherName }: TeacherClassDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [showLiveClass, setShowLiveClass] = useState(false);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);

  const authToken = localStorage.getItem('token') || '';

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const res = await fetch(`${API_URL}/classes/${classId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const c = data.data;
          setClassData({
            id: c._id || classId,
            name: c.name || 'Untitled Class',
            code: c.code || c.classCode || '—',
            description: c.description || '',
            students: c.students?.length ?? c.studentCount ?? 0,
            teacher: c.teacher?.name || teacherName || 'Teacher',
          });
        }
      } catch (err) {
        console.error('Failed to fetch class details:', err);
      } finally {
        setLoadingClass(false);
      }
    };
    fetchClassData();
  }, [classId, authToken, teacherName]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Loading State */}
      {loadingClass ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : !classData ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
          <p>Failed to load class details.</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">← Go back</button>
        </div>
      ) : (
      <>
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
                <span>
                  Class Code:{' '}
                  <code className="bg-white/20 px-2 py-1 rounded">{classData.code}</code>
                </span>
              </div>
            </div>

            {/* Live Class Button */}
            <button
              onClick={() => setShowLiveClass(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <Video className="w-4 h-4" />
              Start Live Class
            </button>
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

      {/* Live Class Room Overlay */}
      {showLiveClass && (
        <LiveClassRoom
          classId={classId}
          teacherName={teacherName || classData.teacher}
          token={authToken}
          onClose={() => setShowLiveClass(false)}
        />
      )}
      </>
      )}
    </div>
  );
}