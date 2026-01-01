// ...existing imports...
import MedicalLeaves from '../portals/vc/pages/MedicalLeaves';
import ORICPortal from '../portals/oric/ORICPortal';

// ...existing routes...
export default function AppRoutes() {
  return (
    // ...existing Router/Routes...
    <>
      {/* ...existing routes... */}
      <Route path="/vc">
        <Route index element={<MedicalLeaves />} />
        <Route path="medical-leaves" element={<MedicalLeaves />} />
      </Route>
      <Route path="/oric" element={<ORICPortal />} />
      {/* 404 etc. */}
    </>
  );
}
