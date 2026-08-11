import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';

const nodeStyles = {
  person: { background: '#2a2a45', borderColor: '#7c6cf0' },
  evidence: { background: '#24342c', borderColor: '#5fd18a' },
  document: { background: '#3a3320', borderColor: '#e0b64a' },
  location: { background: '#27272e', borderColor: '#9a97ae' },
  event: { background: '#3a1f24', borderColor: '#e05a5a' },
};

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
  const color = nodeColors[data.type] || nodeColors.other;
  return (
    <div className="node-card" style={{ borderColor: selected ? data.color : color, boxShadow: selected ? `0 0 0 2px ${data.color}` : 'none' }}>
      <div className="t" style={{ color }}>{data.label}</div>
      <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{data.sub || data.type}</div>
    </div>
  );
}

const nodeTypes = { evidence: EvidenceNode };

export default function Board({ caseData, inventory, discovered, evidenceById }) {
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const disc = new Set(inventory.map((e) => e.id));

    // Evidence + locations + characters discovered so far.
    (caseData?.evidence || []).forEach((e) => {
      if (!disc.has(e.id)) return;
      nodes.push({
        id: e.id,
        type: 'evidence',
        position: { x: 40 + Math.random() * 300, y: 40 + Math.random() * 300 },
        data: { label: e.title, type: e.type, sub: e.type, color: nodeColors[e.type] || nodeColors.other },
      });
      // link evidence to locations
      (e.fact_links || []).forEach((fid) => {
        const loc = caseData.locations.find((l) => e.location_id === l.id);
        if (loc) {
          if (!nodes.some((n) => n.id === loc.id)) {
            nodes.push({ id: loc.id, type: 'evidence', position: { x: 20, y: 20 }, data: { label: loc.name, type: 'location', color: nodeColors.location } });
          }
          edges.push({ id: `${e.id}-${loc.id}`, source: e.id, target: loc.id, label: 'found in' });
        }
      });
    });

    // Suspects as person nodes linking to what they implicate.
    (caseData?.characters || []).filter((c) => c.role === 'suspect' || c.role === 'witness').forEach((c, i) => {
      nodes.push({
        id: c.id, type: 'evidence', position: { x: 420, y: 60 + i * 90 },
        data: { label: c.name, sub: c.role, type: 'person', color: nodeColors.person },
      });
    });

    return { nodes, edges };
  }, [caseData, inventory]);

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
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background color="#333348" gap={16} />
          <Controls />
          <MiniMap nodeColor={(n) => (n.data?.color || '#555')} />
        </ReactFlow>
      </div>
    </div>
  );
}
