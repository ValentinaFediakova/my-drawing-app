"use client";

import "./Toolbar.scss";

// interface ToolbarProps {
// }

const Toolbar: React.FC = ({ }) => {
  return (
    <div className="toolbar">
      <button className="toolbar-item toolbar-item_active">
        <div className="toolbar-item__pen"></div>
      </button>
    </div>
  );
};

export default Toolbar;
