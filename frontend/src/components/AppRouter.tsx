import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from '../pages/Dashboard';
import BihinList from '../pages/BihinList';
import BihinDetail from '../pages/BihinDetail';
import NotFound from '../pages/NotFound';

const AppRouter = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bihin" element={<BihinList />} />
        <Route path="/bihin/:id" element={<BihinDetail />} />
        <Route path="/movement" element={<div>移動履歴ページ</div>} />
        <Route path="/activity" element={<div>アクティビティページ</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default AppRouter;