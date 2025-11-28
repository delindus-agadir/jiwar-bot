const STORAGE_KEY = 'association_system_data';

const initialData = {
    members: [
        { id: 1, name: 'أحمد محمد', joinDate: '2025-01-01', role: 'عضو لجنة', grade: 3, evaluations: [] },
        { id: 2, name: 'سارة علي', joinDate: '2025-02-15', role: 'منخرط', grade: 2, evaluations: [] },
    ]
};

export const getData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialData;
};

export const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addMember = (member) => {
    const data = getData();
    const newMember = { ...member, id: Date.now(), evaluations: [] };
    data.members.push(newMember);
    saveData(data);
    return newMember;
};

export const addEvaluation = (memberId, evaluation) => {
    const data = getData();
    const memberIndex = data.members.findIndex(m => m.id === memberId);
    if (memberIndex > -1) {
        data.members[memberIndex].evaluations.push(evaluation);
        saveData(data);
    }
};

export const deleteMember = (memberId) => {
    const data = getData();
    data.members = data.members.filter(m => m.id !== memberId);
    saveData(data);
};

export const deleteEvaluation = (memberId, evaluationIndex) => {
    const data = getData();
    const memberIndex = data.members.findIndex(m => m.id === memberId);
    if (memberIndex > -1) {
        data.members[memberIndex].evaluations.splice(evaluationIndex, 1);
        saveData(data);
    }
};
