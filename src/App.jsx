import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CMSProvider } from './context/CMSContext';
import Layout       from './components/Layout/Layout';
import HomePage     from './pages/Home/HomePage';
import WorkPage     from './pages/Work/WorkPage';
import AboutPage    from './pages/About/AboutPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';
import ContactPage  from './pages/Contact/ContactPage';
import NotFoundPage        from './pages/NotFound/NotFoundPage';
import ProjectDetailPage   from './pages/ProjectDetail/ProjectDetailPage';

function App() {
  return (
    <CMSProvider>
      <BrowserRouter>
        <div className="noise-overlay" aria-hidden="true" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"         element={<HomePage     />} />
            <Route path="/work"        element={<WorkPage          />} />
            <Route path="/work/:id"    element={<ProjectDetailPage />} />
            <Route path="/about"       element={<AboutPage         />} />
            <Route path="/feedback"    element={<FeedbackPage      />} />
            <Route path="/contact"     element={<ContactPage       />} />
            <Route path="*"            element={<NotFoundPage      />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CMSProvider>
  );
}

export default App;
