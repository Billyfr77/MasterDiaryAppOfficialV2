const fs = require('fs');

const filePath = 'frontend/src/components/PaintDiary.jsx';

// Find the header p tag and add selector after it
const oldStr = `              <p style={{
                margin: 0,
                color: theme === 'dark' ? '#a0aec0' : '#6c757d',
                fontSize: '1.2rem'
              }}>
                The ultimate construction time-tracking solution with AI, photos, voice, GPS & real-time cost calculations with overtime
              </p>
            </div>`;

const newStr = `              <p style={{
                margin: 0,
                color: theme === 'dark' ? '#a0aec0' : '#6c757d',
                fontSize: '1.2rem'
              }}>
                The ultimate construction time-tracking solution with AI, photos, voice, GPS & real-time cost calculations with overtime
              </p>
              <div className="project-selector" style={{ marginTop: '16px' }}>
                <label htmlFor="project-select" style={{
                  color: theme === 'dark' ? '#e2e8f0' : '#495057',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginRight: '12px'
                }}>Select Project: </label>
                <select
                  id="project-select"
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p.id == e.target.value)
                    setSelectedProject(project)
                  }}
                  style={{
                    background: theme === 'dark' ? '#2d3748' : '#f8f9fa',
                    color: theme === 'dark' ? '#e2e8f0' : '#495057',
                    border: '1px solid ' + (theme === 'dark' ? '#4a5568' : '#ced4da'),
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>`;

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) throw err;
  const result = data.replace(oldStr, newStr);
  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) throw err;
    console.log('Project selector added to PaintDiary.jsx');
  });
});