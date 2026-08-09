'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Group = {
  id: string;
  name: string;
  _count?: {
    submissions: number;
  }
};

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editName, setEditName] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (res.ok) {
        setNewGroupName('');
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editName.trim()) return;

    try {
      const res = await fetch(`/api/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setEditingGroup(null);
        setEditName('');
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มนี้? รูปภาพทั้งหมดในกลุ่มนี้จะถูกลบด้วย')) return;
    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1 className="title">ระบบจัดการผู้ดูแล (Admin)</h1>
      <p className="subtitle">จัดการกลุ่มและนำเสนอภาพ Collage</p>

      <div className="glass-panel mb-4">
        <h2 style={{ marginBottom: '1rem' }}>สร้างกลุ่มใหม่</h2>
        <form onSubmit={handleCreateGroup} className="flex gap-2">
          <input
            type="text"
            className="form-input"
            placeholder="ระบุชื่อกลุ่ม..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={isLoading || !newGroupName.trim()}>
            {isLoading ? 'กำลังสร้าง...' : 'สร้างกลุ่ม'}
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '1rem' }}>จัดการกลุ่ม</h2>
        {groups.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>ยังไม่มีกลุ่มที่ถูกสร้าง</p>
        ) : (
          <ul className="list-group">
            {groups.map((group) => (
              <li key={group.id} className="list-item">
                {editingGroup?.id === group.id ? (
                  <form onSubmit={handleUpdateGroup} className="flex gap-2" style={{ flexGrow: 1, marginRight: '1rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-small btn-primary">บันทึก</button>
                    <button type="button" className="btn btn-small btn-danger" onClick={() => setEditingGroup(null)}>ยกเลิก</button>
                  </form>
                ) : (
                  <>
                    <div>
                      <strong>{group.name}</strong>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Link href={`/admin/presentation/${group.id}`} target="_blank">
                        <button className="btn btn-small btn-primary" style={{ background: '#10b981' }}>
                          ▶ นำเสนอ
                        </button>
                      </Link>
                      <button 
                        className="btn btn-small" 
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                        onClick={() => { setEditingGroup(group); setEditName(group.name); }}
                      >
                        แก้ไข
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="text-center mt-8">
         <Link href="/" style={{color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem'}}>← กลับไปหน้าอัปโหลดรูป</Link>
      </div>
    </div>
  );
}
