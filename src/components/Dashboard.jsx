import React, { useState, useEffect } from 'react';
import { client, databases, DATABASE_ID } from '../lib/appwrite';
import { Query } from 'appwrite';
import { addEvaluationToDb, addMemberToDb, deleteMemberFromDb, deleteEvaluationFromDb, updateMemberInDb, updateEvaluationInDb, exportAllData } from '../utils/db';
import { useAuth } from '../contexts/AuthContext';
import EvaluationForm from './EvaluationForm';
import MemberForm from './MemberForm';
import MemberDetails from './MemberDetails';
import UserManagement from './UserManagement';
import { getClassification, calculateEffectiveness } from '../utils/calculations';
import { Search, Plus, Filter, Edit, Trash2, MoreHorizontal, FileText, Star, Download, Users } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  console.log("Dashboard rendering...");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [editingMember, setEditingMember] = useState(null);
  const [editingEvaluation, setEditingEvaluation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userRole, currentUser } = useAuth();

  // Listen for sidebar events
  useEffect(() => {
    const handleOpenUserManagement = () => setShowUserManagement(true);
    document.addEventListener('openUserManagement', handleOpenUserManagement);
    return () => document.removeEventListener('openUserManagement', handleOpenUserManagement);
  }, []);

  // Fetch members and evaluations
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const membersResponse = await databases.listDocuments(DATABASE_ID, 'members');
      const evaluationsResponse = await databases.listDocuments(DATABASE_ID, 'evaluations');

      // Fetch dependents count
      const dependentsResponse = await databases.listDocuments(DATABASE_ID, 'dependents', [Query.limit(1)]);
      const totalDependents = dependentsResponse.total;

      const membersData = membersResponse.documents;
      const evaluationsData = evaluationsResponse.documents;

      // Join evaluations to members
      const membersWithEvaluations = membersData.map(member => ({
        ...member,
        id: member.$id, // Appwrite uses $id
        matricule: member.matricule || member.Matricule, // Fallback for old field name
        evaluations: evaluationsData
          .filter(ev => ev.member_id === member.$id)
          .map(ev => ({
            ...ev,
            id: ev.$id,
            score: Number(ev.Score), // Map Appwrite Score to frontend score
            maxScore: Number(ev.Max_Score), // Map Appwrite Max_Score to frontend maxScore
            date: ev.JSdate, // Map Appwrite JSdate to frontend date
            details: ev.Details ? JSON.parse(ev.Details) : {} // Parse JSON details
          }))
      }));

      setMembers(membersWithEvaluations);
      // Store dependents count in a state or pass it to stats
      window.totalDependents = totalDependents;
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل تحميل البيانات. تأكد من إنشاء المجموعات (Collections) في Appwrite بشكل صحيح.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (memberData) => {
    try {
      await addMemberToDb(memberData);
      setShowAddMember(false);
      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      alert("فشل إضافة العضو: " + (error.message || error));
    }
  };

  const handleEvaluate = async (evaluationData) => {
    try {
      await addEvaluationToDb(selectedMember.id, evaluationData, currentUser.$id);
      setSelectedMember(null);
      fetchMembers();
    } catch (error) {
      console.error("Error adding evaluation:", error);
      alert("فشل إضافة التقييم: " + (error.message || error));
    }
  };

  const handleUpdateEvaluation = async (evaluationData) => {
    try {
      await updateEvaluationInDb(editingEvaluation.evaluation.id, evaluationData);
      setEditingEvaluation(null);
      fetchMembers();

      // Update viewMember if open
      if (viewMember && viewMember.id === editingEvaluation.memberId) {
        const updatedMember = members.find(m => m.id === viewMember.id);
        if (updatedMember) setViewMember(updatedMember);
      }
    } catch (error) {
      console.error("Error updating evaluation:", error);
      alert("فشل تحديث التقييم: " + (error.message || error));
    }
  };


  const handleUpdateMember = async (memberData) => {
    try {
      await updateMemberInDb(editingMember.id, memberData);
      setEditingMember(null);
      fetchMembers(); // Refresh the member list
    } catch (error) {
      console.error("Error updating member:", error);
      alert("فشل تحديث العضو: " + (error.message || error));
    }
  };

  const handleDeleteMember = async (memberId) => {
    await deleteMemberFromDb(memberId);
    setViewMember(null);
  };

  const handleDeleteEvaluation = async (memberId, evaluationId) => {
    console.log("Attempting to delete evaluation:", evaluationId, "for member:", memberId);
    if (!evaluationId) {
      alert("خطأ: معرف التقييم غير موجود");
      return;
    }
    try {
      await deleteEvaluationFromDb(evaluationId);
      console.log("Evaluation deleted successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      alert("فشل حذف التقييم: " + (error.message || error));
    }
  };

  // Sync viewMember with updated data
  useEffect(() => {
    if (viewMember) {
      const updated = members.find(m => m.id === viewMember.id);
      if (updated) setViewMember(updated);
    }
  }, [members]);

  // Stats
  const getCount = (grade) => members.filter(m => getClassification(calculateEffectiveness(m.evaluations)).grade === grade).length;

  const stats = {
    total: members.length,
    elite: getCount('elite'),
    distinguished: getCount('distinguished'),
    pivotal: getCount('pivotal'),
    dependents: window.totalDependents || 0,
  };

  const canEdit = userRole === 'admin';
  const canEvaluate = userRole === 'admin' || userRole === 'editor';

  // Only admin and editor can access Dashboard
  if (userRole !== 'admin' && userRole !== 'editor') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#dc2626' }}>⛔ غير مصرح</h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          ليس لديك صلاحية للوصول إلى هذه الصفحة.
        </p>
        <p style={{ color: '#64748b', marginTop: '10px' }}>
          فقط المسؤولون والمقيّمون يمكنهم رؤية التقييمات والتصنيفات.
        </p>
      </div>
    );
  }

  const StatCard = ({ title, value, color, icon: Icon }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{title}</span>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{value}</div>
    </div>
  );

  const handleBackup = async () => {
    try {
      if (!window.confirm('هل تريد تحميل نسخة احتياطية من جميع البيانات؟')) return;

      const data = await exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup failed:', error);
      alert('فشل النسخ الاحتياطي: ' + error.message);
    }
  };

  // Filter members by classification, search, and grade
  const filteredMembers = members.filter(member => {
    const effectiveness = calculateEffectiveness(member.evaluations);
    const classification = getClassification(effectiveness);

    // Filter by classification
    if (filter !== 'ALL' && classification.grade !== filter) return false;

    // Filter by search term
    if (searchTerm && !member.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    // Filter by grade
    if (gradeFilter !== 'ALL') {
      // Use Number() to handle both string and number types from database
      if (member.grade == null || Number(member.grade) !== Number(gradeFilter)) return false;
    }

    return true;
  });

  return (
    <div className="container" style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '5px' }}>نظام التنقيط والتحفيز</h1>
        <p style={{ color: '#64748b' }}>مرحباً بك في لوحة القيادة</p>
      </div>

      {loading && <div style={{ marginBottom: '20px', color: 'var(--primary)' }}>جاري تحميل البيانات...</div>}
      {error && <div style={{ marginBottom: '20px', color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{error}</div>}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard title="مجموع الأعضاء" value={stats.total} color="#3b82f6" icon={FileText} />
        <StatCard title="الصفوة (Gold)" value={stats.elite} color="#eab308" />
        <StatCard title="المتميزون (Silver)" value={stats.distinguished} color="#94a3b8" />
        <StatCard title="المحوريون (Bronze)" value={stats.pivotal} color="#f97316" />
        <StatCard title="مجموع الرعايا" value={stats.dependents} color="#8b5cf6" icon={Users} />
      </div>

      {/* Main Content Card */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>قائمة الأعضاء</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setFilter('ALL')}
                style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: filter === 'ALL' ? '#eff6ff' : 'transparent', color: filter === 'ALL' ? '#2563eb' : '#64748b', cursor: 'pointer', fontWeight: filter === 'ALL' ? 'bold' : 'normal' }}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('elite')}
                style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: filter === 'elite' ? '#fefce8' : 'transparent', color: filter === 'elite' ? '#ca8a04' : '#64748b', cursor: 'pointer', fontWeight: filter === 'elite' ? 'bold' : 'normal' }}
              >
                الصفوة
              </button>
              <button
                onClick={() => setFilter('distinguished')}
                style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: filter === 'distinguished' ? '#f1f5f9' : 'transparent', color: filter === 'distinguished' ? '#475569' : '#64748b', cursor: 'pointer', fontWeight: filter === 'distinguished' ? 'bold' : 'normal' }}
              >
                المتميزون
              </button>
              <button
                onClick={() => setFilter('pivotal')}
                style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: filter === 'pivotal' ? '#fff7ed' : 'transparent', color: filter === 'pivotal' ? '#ea580c' : '#64748b', cursor: 'pointer', fontWeight: filter === 'pivotal' ? 'bold' : 'normal' }}
              >
                المحوريون
              </button>
              <button
                onClick={() => setFilter('rising')}
                style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: filter === 'rising' ? '#f0fdf4' : 'transparent', color: filter === 'rising' ? '#16a34a' : '#64748b', cursor: 'pointer', fontWeight: filter === 'rising' ? 'bold' : 'normal' }}
              >
                الصاعدون
              </button>
              <button
                onClick={() => setFilter('regressing')}
                style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: filter === 'regressing' ? '#fef2f2' : 'transparent', color: filter === 'regressing' ? '#dc2626' : '#64748b', cursor: 'pointer', fontWeight: filter === 'regressing' ? 'bold' : 'normal' }}
              >
                المتراجعون
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '150px' }}>
              <Search size={18} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 35px 8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '100%', outline: 'none' }}
              />
            </div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b', outline: 'none', minWidth: '120px' }}
            >
              <option value="ALL">كل الدرجات</option>
              <option value="5">الدرجة 5</option>
              <option value="4">الدرجة 4</option>
              <option value="3">الدرجة 3</option>
              <option value="2">الدرجة 2</option>
              <option value="1">الدرجة 1</option>
            </select>
            {userRole === 'admin' && (
              <button
                onClick={handleBackup}
                title="نسخ احتياطي للبيانات"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}
              >
                <Download size={18} />
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => setShowAddMember(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}
              >
                <Plus size={18} />
                <span>إضافة عضو</span>
              </button>
            )}
          </div>
        </div>


        {/* Table */}
        <div className="table-container">
          <table className="responsive-table">
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'right', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}>
                <th style={{ padding: '15px', fontWeight: 'normal' }}>الاسم الكامل</th>
                <th style={{ padding: '15px', fontWeight: 'normal' }}>رقم العضوية</th>
                <th style={{ padding: '15px', fontWeight: 'normal' }}>الدرجة</th>
                <th style={{ padding: '15px', fontWeight: 'normal' }}>الأداء</th>
                <th style={{ padding: '15px', fontWeight: 'normal' }}>التصنيف</th>
                <th style={{ padding: '15px', fontWeight: 'normal' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => {
                const effectiveness = calculateEffectiveness(member.evaluations);
                const classification = getClassification(effectiveness);

                return (
                  <tr key={member.id} className="hover-row">
                    <td data-label="الاسم الكامل" style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a' }}>{member.name}</td>
                    <td data-label="رقم العضوية" style={{ padding: '15px', color: '#64748b' }}>{member.matricule || '-'}</td>
                    <td data-label="الدرجة" style={{ padding: '15px', color: '#64748b' }}>{member.grade}</td>
                    <td data-label="الأداء" style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                          <div style={{ width: `${effectiveness}%`, height: '100%', background: classification.color, transition: 'width 0.5s' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>{effectiveness}%</span>
                      </div>
                    </td>
                    <td data-label="التصنيف" style={{ padding: '15px' }}>
                      <span style={{
                        backgroundColor: `${classification.color}20`,
                        color: classification.color,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        border: `1px solid ${classification.color}40`
                      }}>
                        {classification.label}
                      </span>
                    </td>
                    <td data-label="إجراءات" style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                        {canEvaluate && (
                          <>
                            <button
                              onClick={() => setSelectedMember(member)}
                              title="تقييم"
                              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#eab308' }}
                            >
                              <Star size={16} />
                            </button>
                            <button
                              onClick={() => setEditingMember(member)}
                              title="تعديل"
                              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#2563eb' }}
                            >
                              <Edit size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setViewMember(member)}
                          title="التفاصيل"
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {
            filteredMembers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <div style={{ marginBottom: '10px' }}>🔍</div>
                لا يوجد أعضاء مطابقين للبحث
              </div>
            )
          }
        </div >
      </div >

      {/* Modals Overlay */}
      {
        (selectedMember || showAddMember || viewMember || showUserManagement || editingMember || editingEvaluation) && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
            onClick={() => {
              setSelectedMember(null);
              setShowAddMember(false);
              setViewMember(null);
              setShowUserManagement(false);
              setEditingMember(null);
              setEditingEvaluation(null);
            }}
          />
        )
      }

      {
        selectedMember && (
          <EvaluationForm
            member={selectedMember}
            onSubmit={handleEvaluate}
            onCancel={() => setSelectedMember(null)}
          />
        )
      }

      {
        showAddMember && (
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowAddMember(false)}
          />
        )
      }

      {
        editingMember && (
          <MemberForm
            initialData={editingMember}
            onSubmit={handleUpdateMember}
            onCancel={() => setEditingMember(null)}
          />
        )
      }

      {
        editingEvaluation && (
          <EvaluationForm
            member={members.find(m => m.id === editingEvaluation.memberId)}
            initialData={editingEvaluation.evaluation}
            onSubmit={handleUpdateEvaluation}
            onCancel={() => setEditingEvaluation(null)}
          />
        )
      }

      {
        viewMember && (
          <MemberDetails
            member={viewMember}
            currentUser={currentUser}
            onClose={() => setViewMember(null)}
            onDeleteMember={canEdit ? handleDeleteMember : null}
            onDeleteEvaluation={canEdit ? handleDeleteEvaluation : null}
            onEditEvaluation={(memberId, evaluation, idx) => {
              setEditingEvaluation({ memberId, evaluation, index: idx });
            }}
            canEdit={canEdit}
          />
        )
      }

      {
        showUserManagement && (
          <UserManagement onClose={() => setShowUserManagement(false)} />
        )
      }
    </div >
  );
};

export default Dashboard;
