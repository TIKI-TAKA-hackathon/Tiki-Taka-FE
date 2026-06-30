import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CardPreviewPage } from './routes/CardPreviewPage';
import { HomePage } from './routes/HomePage';
import { QuestionPage } from './routes/QuestionPage';
import { SharedCardPage } from './routes/SharedCardPage';
import { TopicsPage } from './routes/TopicsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="topics" element={<TopicsPage />} />
        <Route path="topics/:topicId/question" element={<QuestionPage />} />
        <Route path="preview/:cardId" element={<CardPreviewPage />} />
        <Route path="t/:shareToken" element={<SharedCardPage />} />
      </Route>
    </Routes>
  );
}
