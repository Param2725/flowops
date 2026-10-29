import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import PlaceholderPage from './components/PlaceholderPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { NAV_ITEMS } from './config/navigation.js';

const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      {NAV_ITEMS.map(({ to, label }) => (
        <Route key={to} path={to} element={<PlaceholderPage title={label} />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
