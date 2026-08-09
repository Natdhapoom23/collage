'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Group = {
  id: string;
  name: string;
};

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGroups(data);
          if (data.length > 0) setGroupId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !groupId || !file) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูปภาพครับ');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('groupId', groupId);
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setIsSuccess(true);
        setName('');
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'อัปโหลดไม่สำเร็จ');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดระหว่างการอัปโหลด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Photo Collage</h1>
      <p className="subtitle">อัปโหลดรูปภาพของคุณเพื่อเข้าร่วมการนำเสนอ</p>

      <div className="glass-panel">
        {isSuccess ? (
          <div className="text-center">
            <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>อัปโหลดสำเร็จ! 🎉</h2>
            <p>รูปภาพของคุณถูกเพิ่มเข้าสู่ระบบเรียบร้อยแล้ว</p>
            <button className="btn btn-primary mt-4" onClick={() => setIsSuccess(false)}>
              อัปโหลดรูปอื่นเพิ่มเติม
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ชื่อของคุณ</label>
              <input
                type="text"
                className="form-input"
                placeholder="กรอกชื่อ-นามสกุล"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">เลือกกลุ่ม</label>
              <select
                className="form-select"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
              >
                <option value="" disabled>-- กรุณาเลือกกลุ่ม --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">อัปโหลดรูปภาพ</label>
              <div
                className="file-drop"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>คลิกเพื่อเปลี่ยนรูปภาพ</p>
                    <img src={previewUrl} alt="Preview" className="preview-image" />
                  </div>
                ) : (
                  <p>คลิกที่นี่เพื่อเลือกรูปภาพจากเครื่องของคุณ</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              disabled={isLoading || !name || !groupId || !file}
            >
              {isLoading ? <div className="spinner"></div> : 'อัปโหลดเข้าสู่ระบบ'}
            </button>
          </form>
        )}
      </div>
      <div className="text-center mt-8">
         <a href="/admin" style={{color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem'}}>เข้าสู่ระบบผู้ดูแล (Admin) →</a>
      </div>
    </div>
  );
}
