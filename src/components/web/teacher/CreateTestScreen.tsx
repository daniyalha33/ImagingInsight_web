import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

interface CreateTestScreenProps {
  classId?: string;
  onBack: () => void;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface SegmentationQuestion {
  id: string;
  caseFile: File | null;
  labelFile: File | null;
  description: string;
}

export function CreateTestScreen({ classId, onBack }: CreateTestScreenProps) {
  const [testType, setTestType] = useState<'mcq' | 'segmentation'>('mcq');
  const [testTitle, setTestTitle] = useState('');
  const [testDuration, setTestDuration] = useState('30');
  const [dueDate, setDueDate] = useState('');

  // MCQ State
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([{
    id: '1',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  }]);

  // Segmentation State
  const [segmentationQuestions, setSegmentationQuestions] = useState<SegmentationQuestion[]>([{
    id: '1',
    caseFile: null,
    labelFile: null,
    description: ''
  }]);

  const handleAddMCQQuestion = () => {
    setMcqQuestions([...mcqQuestions, {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const handleRemoveMCQQuestion = (id: string) => {
    setMcqQuestions(mcqQuestions.filter(q => q.id !== id));
  };

  const handleUpdateMCQQuestion = (id: string, field: string, value: any) => {
    setMcqQuestions(mcqQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleUpdateMCQOption = (questionId: string, optionIndex: number, value: string) => {
    setMcqQuestions(mcqQuestions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleAddSegmentationQuestion = () => {
    setSegmentationQuestions([...segmentationQuestions, {
      id: Date.now().toString(),
      caseFile: null,
      labelFile: null,
      description: ''
    }]);
  };

  const handleRemoveSegmentationQuestion = (id: string) => {
    setSegmentationQuestions(segmentationQuestions.filter(q => q.id !== id));
  };

  const handleUpdateSegmentationQuestion = (id: string, field: string, value: any) => {
    setSegmentationQuestions(segmentationQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSaveTest = () => {
    const testData = {
      title: testTitle,
      type: testType,
      duration: testDuration,
      dueDate,
      questions: testType === 'mcq' ? mcqQuestions : segmentationQuestions,
      classId
    };
    
    console.log('Saving test:', testData);
    // In a real app, this would make an API call
    onBack();
  };

  return (
   <div className="h-full bg-blue-50 overflow-y-auto">
  <div className="max-w-4xl mx-auto p-8">
    {/* Header */}
    <div className="bg-blue-600 text-white rounded-lg p-6 mb-6 shadow-md">
      <button
        onClick={onBack}
        className="flex items-center gap-2 hover:opacity-90 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <h1 className="text-2xl font-bold">Create New Assessment</h1>
      <p className="text-blue-100 mt-1">Design a test for your students</p>
    </div>

        {/* Basic Info */}
         {/* Basic Info Card */}
    <Card className="p-6 mb-6 border border-blue-200 bg-blue-50 shadow-sm">
      <h3 className="text-blue-900 mb-4 font-semibold">Assessment Details</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-title">Assessment Title</Label>
              <Input
                id="test-title"
                placeholder="e.g., CT Scan Basics Quiz"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={testDuration}
                  onChange={(e) => setTestDuration(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label>Assessment Type</Label>
              <RadioGroup value={testType} onValueChange={(value: any) => setTestType(value)} className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mcq" id="mcq" />
                  <Label htmlFor="mcq" className="cursor-pointer">Multiple Choice Questions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="segmentation" id="segmentation" />
                  <Label htmlFor="segmentation" className="cursor-pointer">Segmentation Task</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* Questions */}
<Card className="p-6 mb-6 border border-blue-200 bg-blue-50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-900 font-semibold">Questions</h3>
        <Button
          onClick={testType === 'mcq' ? handleAddMCQQuestion : handleAddSegmentationQuestion}
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

          {testType === 'mcq' ? (
            <div className="space-y-6">
              {mcqQuestions.map((q, index) => (
                <Card key={q.id} className="p-4 border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-blue-900">Question {index + 1}</h4>
                    {mcqQuestions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMCQQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        placeholder="Enter your question..."
                        value={q.question}
                        onChange={(e) => handleUpdateMCQQuestion(q.id, 'question', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Options (Click radio button to mark as correct)</Label>
                      <RadioGroup 
                        value={q.correctAnswer.toString()} 
                        onValueChange={(value) => handleUpdateMCQQuestion(q.id, 'correctAnswer', parseInt(value))}
                        className="space-y-2 mt-2"
                      >
                        {q.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <RadioGroupItem
                              value={optIndex.toString()}
                              id={`${q.id}-option-${optIndex}`}
                            />
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={option}
                              onChange={(e) => handleUpdateMCQOption(q.id, optIndex, e.target.value)}
                              className="flex-1"
                            />
                            <Label htmlFor={`${q.id}-option-${optIndex}`} className="text-muted-foreground whitespace-nowrap">
                              {q.correctAnswer === optIndex ? '(Correct)' : ''}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {segmentationQuestions.map((q, index) => (
                <Card key={q.id} className="p-4 border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-blue-900">Case {index + 1}</h4>
                    {segmentationQuestions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSegmentationQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="e.g., Segment the liver in this CT scan"
                        value={q.description}
                        onChange={(e) => handleUpdateSegmentationQuestion(q.id, 'description', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`case-file-${q.id}`}>CT Scan File (.nii)</Label>
                        <div className="mt-1.5">
                          <label
                            htmlFor={`case-file-${q.id}`}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            <Upload className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-900">
                              {q.caseFile ? q.caseFile.name : 'Upload .nii file'}
                            </span>
                            <input
                              id={`case-file-${q.id}`}
                              type="file"
                              accept=".nii,.nii.gz"
                              onChange={(e) => handleUpdateSegmentationQuestion(q.id, 'caseFile', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`label-file-${q.id}`}>Ground Truth Label (.nii)</Label>
                        <div className="mt-1.5">
                          <label
                            htmlFor={`label-file-${q.id}`}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            <Upload className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-900">
                              {q.labelFile ? q.labelFile.name : 'Upload label file'}
                            </span>
                            <input
                              id={`label-file-${q.id}`}
                              type="file"
                              accept=".nii,.nii.gz"
                              onChange={(e) => handleUpdateSegmentationQuestion(q.id, 'labelFile', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
      <Button variant="outline" onClick={onBack} className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-100">
        Cancel
      </Button>
      <Button
        onClick={handleSaveTest}
        disabled={!testTitle.trim()}
        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
      >
        Create Assessment
      </Button>
        </div>
      </div>
    </div>
  );
}
