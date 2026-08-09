'use client';

import { useState, useEffect, use } from 'react';

type Submission = {
  id: string;
  name: string;
  imagePath: string;
};

type Group = {
  id: string;
  name: string;
};

export default function PresentationPage({ params }: { params: Promise<{ groupId: string }> }) {
  const unwrappedParams = use(params);
  const groupId = unwrappedParams.groupId;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    // Fetch group details
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((g: Group) => g.id === groupId);
        if (found) setGroup(found);
      });

    // Fetch submissions
    fetch(`/api/submissions?groupId=${groupId}`)
      .then((res) => res.json())
      .then((data) => {
        // Randomize array
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setSubmissions(shuffled);
      });
  }, [groupId]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', position: 'relative' }}>
      {group && (
        <div className="collage-header">
          <h2>{group.name}</h2>
        </div>
      )}
      
      {submissions.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
          <h2>ยังไม่มีรูปภาพถูกอัปโหลด</h2>
        </div>
      ) : (
        <div className="collage-container">
          {submissions.map((sub, index) => {
            // Randomly assign spanning classes for masonry effect
            let spanClass = '';
            if (index % 5 === 0) spanClass = 'span-2-both';
            else if (index % 3 === 0) spanClass = 'span-2-row';
            else if (index % 4 === 0) spanClass = 'span-2-col';

            return (
              <div key={sub.id} className={`collage-item ${spanClass}`}>
                <img src={sub.imagePath} alt={sub.name} />
                <div className="name-tag">{sub.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
