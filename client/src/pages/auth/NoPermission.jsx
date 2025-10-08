// pages/NoPermission.jsx
import { Link } from 'react-router-dom';
export default function NoPermission() {
  console.log('lỗi nè')
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
              <img
                className="placeHolderImageMusea_0ee45fca"
                src="https://res-1.cdn.office.net/files/sp-client/odsp-media-9e9bf697/images/error/error_exclamation_v3_dark.webp"
                alt="Empty list"
                style={{ width: "200px", height: "auto" }} 
              />
            </div>
      <h1>Access Denied</h1>
      <p>Sorry, this account does not have permissions to access this resource.</p>
      {/* <Link to="/dashboard">Go to Dashboard</Link> */}
    </div>
  );
}
