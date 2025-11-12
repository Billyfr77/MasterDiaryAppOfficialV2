import React, { memo, useState } from 'react';
import { useDrop } from 'react-dnd';

const DropZone = memo(({ entryId, onDrop, children, isHighlighted, entryType, dropFeedback }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: entryType,
    drop: (item) => {
      if (onDrop) onDrop(item, entryId, null);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const isHighlightedFinal = isHighlighted || isOver;

  const baseStyle = {
    border: '2px dashed rgba(255,255,255,0.3)',
    borderRadius: '8px',
    padding: '16px',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const highlightStyle = {
    borderColor: '#4ecdc4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    transform: 'scale(1.02)',
  };

  return (
    <section
      ref={drop}
      style={{
        ...baseStyle,
        ...(isHighlightedFinal ? highlightStyle : {}),
      }}
    >
      {children}
    </section>
  );
});

const PaintDiary = ({
  entries = [],
  onDropItem = () => {},
  onUpdateItemDuration = () => {},
  onUpdateItemQuantity = () => {},
  isDropTarget = null
}) => {
  // Default entries if none provided
  const defaultEntries = [
    {
      id: 'entry-1',
      title: 'Sample Project Entry',
      items: []
    },
    {
      id: 'entry-2',
      title: 'Another Entry',
      items: []
    }
  ];

  const displayEntries = entries.length > 0 ? entries : defaultEntries;

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '2.5rem',
        color: '#4ecdc4'
      }}>
        Paint Your Diary
      </h1>

      <p style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: 'rgba(255,255,255,0.7)'
      }}>
        This is the drag-and-drop diary feature. Drag staff, equipment, and materials here to plan your projects.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {displayEntries.map(entry => (
          <div key={entry.id} style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{
              color: '#4ecdc4',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {entry.title}
            </h3>

            <DropZone
              entryId={entry.id}
              onDrop={onDropItem}
              entryType="staff"
              isHighlighted={isDropTarget === entry.id}
              dropFeedback={entry.items?.some(item => item.type === 'staff')}
            >
              {entry.items?.filter(item => item.type === 'staff').length > 0 ? (
                <div>
                  <h5 style={{ color: '#4ecdc4', marginBottom: '10px' }}>🟢 Team Members</h5>
                  {entry.items.filter(item => item.type === 'staff').map(item => (
                    <div key={item.id} style={{
                      background: 'rgba(78, 205, 196, 0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      margin: '5px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#ffffff' }}>{item.name}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                          type="number"
                          value={item.duration || 0}
                          onChange={(e) => onUpdateItemDuration(entry.id, item.id, parseFloat(e.target.value))}
                          placeholder="hrs"
                          style={{
                            width: '60px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#ffffff'
                          }}
                        />
                        <button
                          onClick={() => onDropItem(null, entry.id, item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff8787',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  Drop staff here
                </div>
              )}
            </DropZone>

            <DropZone
              entryId={entry.id}
              onDrop={onDropItem}
              entryType="equipment"
              isHighlighted={isDropTarget === entry.id}
              dropFeedback={entry.items?.some(item => item.type === 'equipment')}
            >
              {entry.items?.filter(item => item.type === 'equipment').length > 0 ? (
                <div>
                  <h5 style={{ color: '#ffd43b', marginBottom: '10px' }}>🟠 Equipment</h5>
                  {entry.items.filter(item => item.type === 'equipment').map(item => (
                    <div key={item.id} style={{
                      background: 'rgba(255, 212, 59, 0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      margin: '5px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#ffffff' }}>{item.name}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => onUpdateItemQuantity(entry.id, item.id, parseInt(e.target.value))}
                          placeholder="qty"
                          style={{
                            width: '50px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#ffffff'
                          }}
                        />
                        <input
                          type="number"
                          value={item.duration || 0}
                          onChange={(e) => onUpdateItemDuration(entry.id, item.id, parseFloat(e.target.value))}
                          placeholder="hrs"
                          style={{
                            width: '60px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#ffffff'
                          }}
                        />
                        <button
                          onClick={() => onDropItem(null, entry.id, item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff8787',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  Drop equipment here
                </div>
              )}
            </DropZone>

            <DropZone
              entryId={entry.id}
              onDrop={onDropItem}
              entryType="materials"
              isHighlighted={isDropTarget === entry.id}
              dropFeedback={entry.items?.some(item => item.type === 'materials')}
            >
              {entry.items?.filter(item => item.type === 'materials').length > 0 ? (
                <div>
                  <h5 style={{ color: '#da77f2', marginBottom: '10px' }}>🟣 Materials</h5>
                  {entry.items.filter(item => item.type === 'materials').map(item => (
                    <div key={item.id} style={{
                      background: 'rgba(218, 119, 242, 0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      margin: '5px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#ffffff' }}>{item.name}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => onUpdateItemQuantity(entry.id, item.id, parseInt(e.target.value))}
                          placeholder="qty"
                          style={{
                            width: '50px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#ffffff'
                          }}
                        />
                        <button
                          onClick={() => onDropItem(null, entry.id, item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff8787',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  Drop materials here
                </div>
              )}
            </DropZone>

          </div>
        ))}
      </div>
    </div>
  );
};

export default PaintDiary;