import React, { useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position, useNodesState, useEdgesState } from 'reactflow';

const nodeColors = {
  physical: '#5fd18a',
  document: '#e0b64a',
  media: '#7c6cf0',
  location: '#9a97ae',
  event: '#e05a5a',
  person: '#7c6cf0',
  other: '#9a97ae',
};

function EvidenceNode({ data, selected }) {
  const color = data.color || nodeColors.other;
  return (
    <div className="node-card" style={{ borderColor: color, boxShadow: selected ? `0 0 0 2px ${color}` : 'none' }}>
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div className="t" style={{ color }}>{data.label}</div>
      <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{data.sub || data.type}</div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </div>
  );
}

const nodeTypes = { evidence: EvidenceNode };

export default function Board({ caseData, inventory }) {
  // Build nodes/edges: discovered evidence (linked to its location) + suspects.
  const { nodes: initial, edges: initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const disc = new Set(inventory.map((e) => e.id));

    // Discovered evidence nodes, linked to their location (once).
    (caseData?.evidence || []).forEach((e, i) => {
      if (!disc.has(e.id)) return;
      nodes.push({
        id: `node-${e.id}`,
        type: 'evidence',
        position: { x: 60 + (i % 3) * 220, y: 60 + Math.floor(i / 3) * 130 },
        data: { label: e.title, type: e.type, sub: e.type, color: nodeColors[e.type] || nodeColors.other },
      });
    });

    // Location nodes at distinct positions.
    (caseData?.locations || []).forEach((loc, i) => {
      const anyDiscThere = (caseData.evidence || []).some((e) => disc.has(e.id) && e.location_id === loc.id);
      if (!anyDiscThere) return; // only show locations that have discovered evidence
      nodes.push({
        id: `node-${loc.id}`,
        type: 'evidence',
        position: { x: 700 + (i % 3) * 20, y: 60 + i * 40 },
        data: { label: loc.name, sub: 'location', type: 'location', color: nodeColors.location },
      });
    });

    // Suspects as person nodes.
    (caseData?.characters || []).filter((c) => c.role === 'suspect' || c.role === 'witness').forEach((c, i) => {
      nodes.push({
        id: `node-${c.id}`,
        type: 'evidence',
        position: { x: 420, y: 60 + i * 90 },
        data: { label: c.name, sub: c.role, type: 'person', color: nodeColors.person },
      });
    });

    // Edge from each discovered evidence to its location.
    (caseData?.evidence || []).forEach((e) => {
      if (!disc.has(e.id) || !e.location_id) return;
      edges.push({ id: `edge-${e.id}-${e.location_id}`, source: `node-${e.id}`, target: `node-${e.location_id}`, label: 'found in' });
    });

    return { nodes, edges };
  }, [caseData, inventory]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // When the fetched data changes, sync node/edge state (draggable + reflect new evidence).
  useEffect(() => {
    setNodes(initial);
    setEdges(initialEdges);
  }, [initial, initialEdges, setNodes, setEdges]);

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Evidence Board</h2>
        <span className="muted">Drag to arrange. Discovered evidence appears automatically.</span>
      </div>
      <div className="board-wrap">
        <div className="board-toolbar">
          <span className="pill">Nodes: {nodes.length}</span>
          <span className="pill">Links: {edges.length}</span>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#333348" gap={16} />
          <Controls />
          <MiniMap nodeColor={(n) => (n.data?.color || '#555')} />
        </ReactFlow>
      </div>
    </div>
  );
}
