import ORICPortal from './ORICPortal';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Publications from './pages/Publications';
import Funding from './pages/Funding';
import Patents from './pages/Patents';
import Events from './pages/Events';

const oricRoutes = [
  {
    path: '/oric',
    element: <ORICPortal />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'projects',
        element: <Projects />,
      },
      {
        path: 'publications',
        element: <Publications />,
      },
      {
        path: 'funding',
        element: <Funding />,
      },
      {
        path: 'ip',
        element: <Patents />,
      },
      {
        path: 'events',
        element: <Events />,
      },
    ],
  },
];

export default oricRoutes;
