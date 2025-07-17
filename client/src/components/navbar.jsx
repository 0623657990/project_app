function Sidebar({ show, onClose }) {
    return (
      <div 
        className={`position-fixed top-0 start-0 h-100 bg-light border-end p-3 shadow ${show ? "d-block" : "d-none"}`} 
        style={{ width: "250px", zIndex: 1040 }}
      >
        {/* Close button */}
        <button className="btn btn-sm btn-close float-end" onClick={onClose}></button>
        <h4 className="mt-4">Menu</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <a className="nav-link" href="#">Dashboard</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Projects</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Tasks</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Profile</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Settings</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Logout</a>
          </li>
        </ul>
      </div>
    );
  }
  
  export default Sidebar;
  