import React, { useState, useEffect } from 'react';

const OrganizationalStructure = () => {
  const [spanOfControl, setSpanOfControl] = useState(3);
  const [totalEmployees, setTotalEmployees] = useState(50);
  const [centralization, setCentralization] = useState(0.5);
  const [tree, setTree] = useState(null);
  const [managerCount, setManagerCount] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);

  const TreeNode = ({ label, children, isCEO, level, maxLevel, centralization }) => {
    const getLineThickness = () => {
      const baseThickness = 2;
      const maxAdditionalThickness = 8;
      
      // Calculate the relative position of this level in the hierarchy
      const relativePosition = level / maxLevel;
      
      // Calculate the centralization effect
      const centralizedEffect = Math.abs(centralization - 0.5) * 2;
      
      let thicknessFactor;
      if (centralization > 0.5) {
        // For high centralization, upper levels are thicker and lower levels are thinner
        thicknessFactor = 1 - relativePosition;
      } else {
        // For low centralization, lower levels are thicker and upper levels are thinner
        thicknessFactor = relativePosition;
      }
      
      // Calculate additional thickness
      const additionalThickness = maxAdditionalThickness * thicknessFactor * centralizedEffect;
      
      // Ensure the thickness doesn't go below the base thickness
      return `${Math.max(baseThickness, baseThickness + additionalThickness)}px`;
    };

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{ 
          border: `2px solid #3498db`,
          borderRadius: '8px', 
          padding: '10px', 
          backgroundColor: isCEO ? '#3498db' : '#f0f8ff',
          color: isCEO ? 'white' : '#333',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '100px',
          textAlign: 'center'
        }}>
          {label}
        </div>
        {children && children.length > 0 && (
          <>
            <div style={{ 
              width: getLineThickness(), 
              height: '20px', 
              backgroundColor: '#3498db',
            }}></div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%',
              position: 'relative',
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '0', 
                height: getLineThickness(), 
                backgroundColor: '#3498db',
                left: `${100 / (children.length * 2)}%`,
                right: `${100 / (children.length * 2)}%`
              }}></div>
              {children.map((child, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative'
                }}>
                  {index > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: `-${getLineThickness()}`,
                      left: 0,
                      width: '50%',
                      height: getLineThickness(),
                      backgroundColor: '#3498db',
                    }}></div>
                  )}
                  {index < children.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: `-${getLineThickness()}`,
                      right: 0,
                      width: '50%',
                      height: getLineThickness(),
                      backgroundColor: '#3498db',
                    }}></div>
                  )}
                  <div style={{ 
                    width: getLineThickness(), 
                    height: '20px', 
                    backgroundColor: '#3498db', 
                    marginTop: `-${getLineThickness()}`,
                  }}></div>
                  {child}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    const buildTree = () => {
      const nodes = [{ id: 0, label: 'CEO', level: 0, children: [] }];
      let remainingEmployees = totalEmployees - 1; // Subtract CEO
      let currentIndex = 0;
      let managers = 1; // Start with 1 for the CEO
      let maxLvl = 0;

      while (remainingEmployees > 0 && currentIndex < nodes.length) {
        const currentNode = nodes[currentIndex];
        const subordinates = Math.min(spanOfControl, remainingEmployees);

        for (let i = 0; i < subordinates; i++) {
          const newNodeId = nodes.length;
          const newNode = {
            id: newNodeId,
            level: currentNode.level + 1,
            children: []
          };
          maxLvl = Math.max(maxLvl, newNode.level);
          nodes.push(newNode);
          currentNode.children.push(newNodeId);
          remainingEmployees--;
        }

        if (subordinates > 0) {
          managers++; // Count this node as a manager if it has subordinates
        }

        currentIndex++;
      }

      setManagerCount(managers);
      setMaxLevel(maxLvl);

      // Assign labels based on level
      for (let i = 1; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.children.length === 0) {
          node.label = 'Staff';
        } else {
          node.label = 'Manager';
        }
      }

      const renderNode = (nodeId) => {
        const node = nodes[nodeId];
        return (
          <TreeNode 
            key={nodeId} 
            label={node.label} 
            isCEO={nodeId === 0}
            level={node.level}
            maxLevel={maxLvl}
            centralization={centralization}
          >
            {node.children.map(childId => renderNode(childId))}
          </TreeNode>
        );
      };

      return renderNode(0);
    };

    setTree(buildTree());
  }, [spanOfControl, totalEmployees, centralization]);

  const handleEmployeeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setTotalEmployees(value);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', 
        padding: '30px', 
        marginBottom: '20px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
          Organizational Structure Visualizer
        </h2>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="span-control" style={{ display: 'block', marginBottom: '10px', color: '#34495e' }}>
            Span of Control: {spanOfControl}
          </label>
          <input
            type="range"
            id="span-control"
            min="2"
            max="10"
            step="1"
            value={spanOfControl}
            onChange={(e) => setSpanOfControl(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="total-employees" style={{ display: 'block', marginBottom: '10px', color: '#34495e' }}>
            Total Employees:
          </label>
          <input
            type="number"
            id="total-employees"
            min="1"
            value={totalEmployees}
            onChange={handleEmployeeChange}
            style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="centralization" style={{ display: 'block', marginBottom: '10px', color: '#34495e' }}>
            Centralization: {centralization.toFixed(2)}
          </label>
          <input
            type="range"
            id="centralization"
            min="0"
            max="1"
            step="0.01"
            value={centralization}
            onChange={(e) => setCentralization(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'center', fontSize: '18px', color: '#2c3e50' }}>
          Number of Managers: {managerCount}
        </div>
        <div style={{ 
          overflow: 'auto', 
          maxHeight: '60vh', 
          marginTop: '30px', 
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          {tree}
        </div>
      </div>
    </div>
  );
};

export default OrganizationalStructure;