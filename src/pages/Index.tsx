import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import Login from './Login';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return <Login />;
};

export default Index;
