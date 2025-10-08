// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className='' style={{ textAlign: 'center', marginTop: '50px', flex: 'auto' }}>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
              <img
                className="placeHolderImageMusea_0ee45fca"
                src="https://res-1.cdn.office.net/files/sp-client/odsp-media-42def457/images/error/error2.svg"
                alt="Empty list"
                style={{ width: "200px", height: "auto" }} 
              />
            </div>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      {/* <Link to="/dashboard">Go to Dashboard</Link> */}
    </div>
  );
};

export default NotFound;