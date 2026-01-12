import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { Alert, AlertDescription } from '../../ui/alert';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';

const API_URL = 'http://localhost:5000/api';

interface CreateTestScreenProps {
  classId: string;
  onBack: () => void;
  onSuccess?: () => void;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export function CreateTestScreen({ classId, onBack, onSuccess }: CreateTestScreenProps) {
  const [testTitle, setTestTitle] = useState('');
  const [testDuration, setTestDuration] = useState('30');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([{
    id: '1',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
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
    if (mcqQuestions.length > 1) {
      setMcqQuestions(mcqQuestions.filter(q => q.id !== id));
    }
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

  const validateForm = () => {
    if (!testTitle.trim()) {
      setError('Please enter a test title');
      return false;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return false;
    }

    for (let i = 0; i < mcqQuestions.length; i++) {
      const q = mcqQuestions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return false;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
        return false;
      }
    }

    return true;
  };

  const handleSaveTest = async () => {
    if (!validateForm()) return;

    setCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare questions without id field
      const questions = mcqQuestions.map(({ id, ...rest }) => rest);

      const response = await fetch(`${API_URL}/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: testTitle,
          type: 'mcq',
          classId: classId,
          duration: parseInt(testDuration),
          dueDate: new Date(dueDate).toISOString(),
          questions: questions
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess();
        }
        onBack();
      } else {
        setError(data.message || 'Failed to create test');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create test error:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-full bg-blue-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="bg-blue-600 text-white rounded-lg p-6 mb-6 shadow-md">
          <button
            onClick={onBack}
            disabled={creating}
            className="flex items-center gap-2 hover:opacity-90 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Create New Assessment</h1>
          <p className="text-blue-100 mt-1">Design an MCQ test for your students</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Info Card */}
        <Card className="p-6 mb-6 border border-blue-200 bg-white shadow-sm">
          <h3 className="text-blue-900 mb-4 font-semibold">Assessment Details</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-title">Assessment Title</Label>
              <Input
                id="test-title"
                placeholder="e.g., CT Scan Basics Quiz"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                disabled={creating}
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
                  disabled={creating}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={creating}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Questions Card */}
        <Card className="p-6 mb-6 border border-blue-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-900 font-semibold">Questions</h3>
            <Button
              onClick={handleAddMCQQuestion}
              variant="outline"
              size="sm"
              disabled={creating}
              className="border-blue-600 text-blue-600 hover:bg-blue-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {mcqQuestions.map((q, index) => (
              <Card key={q.id} className="p-4 border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-blue-900 font-medium">Question {index + 1}</h4>
                  {mcqQuestions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMCQQuestion(q.id)}
                      disabled={creating}
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
                      disabled={creating}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Options (Click radio button to mark as correct)</Label>
                    <RadioGroup 
                      value={q.correctAnswer.toString()} 
                      onValueChange={(value) => handleUpdateMCQQuestion(q.id, 'correctAnswer', parseInt(value))}
                      className="space-y-2 mt-2"
                      disabled={creating}
                    >
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <RadioGroupItem
                            value={optIndex.toString()}
                            id={`${q.id}-option-${optIndex}`}
                            disabled={creating}
                          />
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => handleUpdateMCQOption(q.id, optIndex, e.target.value)}
                            disabled={creating}
                            className="flex-1"
                          />
                          <Label htmlFor={`${q.id}-option-${optIndex}`} className="text-gray-500 whitespace-nowrap min-w-[80px]">
                            {q.correctAnswer === optIndex ? '✓ Correct' : ''}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={creating}
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
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Assessment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}