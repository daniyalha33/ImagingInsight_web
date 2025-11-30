import { useState } from 'react';
import { Check, X, Mail, Phone, Calendar } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';

export function TeacherApprovalScreen() {
  const [pendingTeachers, setPendingTeachers] = useState([
    {
      id: '1',
      name: 'Dr. Uzair Iqbal',
      email: 'uzair.iqbal@hospital.com',
      phone: '+92 300 1234567',
      specialization: 'Radiology',
      experience: '8 years',
      institution: 'Mayo Hospital Lahore',
      appliedAt: '2024-10-08',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@medical.com',
      phone: '+92 321 9876543',
      specialization: 'Medical Imaging',
      experience: '5 years',
      institution: 'Shaukat Khanum Hospital',
      appliedAt: '2024-10-09',
      status: 'pending'
    },
  ]);

  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleApprove = (teacherId: string) => {
    setPendingTeachers(pendingTeachers.filter(t => t.id !== teacherId));
    // In real app, make API call to approve teacher
    console.log('Approved teacher:', teacherId);
  };

  const handleReject = (teacherId: string) => {
    setPendingTeachers(pendingTeachers.filter(t => t.id !== teacherId));
    // In real app, make API call to reject teacher
    console.log('Rejected teacher:', teacherId);
  };

  const handleViewDetails = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowDetailsDialog(true);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-mdbg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-white text-2xl font-bold mb-2">Teacher Approval Requests</h1>
          <p className="text-blue-100">Review and approve teacher registration requests</p>
        </div>


        {/* Pending Requests */}
        <div className="space-y-4">
          {pendingTeachers.length === 0 ? (
            <Card className="p-12 text-center border-blue-100 border-dashed">
              <h4 className="text-blue-900 mb-2">No pending requests</h4>
              <p className="text-muted-foreground">All teacher requests have been reviewed</p>
            </Card>
          ) : (
            pendingTeachers.map((teacher) => (
              <Card key={teacher.id} className="p-6 border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-6">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-blue-900">{teacher.name}</h3>
                          <Badge className="bg-amber-100 text-amber-600">Pending Review</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{teacher.specialization} • {teacher.experience} experience</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{teacher.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Applied: {teacher.appliedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleViewDetails(teacher)}
                        variant="outline"
                        className="border-blue-600 text-blue-600"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleApprove(teacher.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(teacher.id)}
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Teacher Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Teacher Application Details</DialogTitle>
          <DialogDescription>
            Review the complete application information
          </DialogDescription>
          {selectedTeacher && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {selectedTeacher.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-blue-900">{selectedTeacher.name}</h3>
                  <p className="text-muted-foreground">{selectedTeacher.specialization}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <p className="text-foreground">{selectedTeacher.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Phone</p>
                  <p className="text-foreground">{selectedTeacher.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Experience</p>
                  <p className="text-foreground">{selectedTeacher.experience}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Institution</p>
                  <p className="text-foreground">{selectedTeacher.institution}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Applied Date</p>
                  <p className="text-foreground">{selectedTeacher.appliedAt}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    handleApprove(selectedTeacher.id);
                    setShowDetailsDialog(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    handleReject(selectedTeacher.id);
                    setShowDetailsDialog(false);
                  }}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
